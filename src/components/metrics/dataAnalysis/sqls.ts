interface QueryWhereType {
  key?:
    | 'database'
    | 'table'
    | 'name'
    | 'type'
    | 'initial_user'
    | 'query_kind'
    | 'normalized_query_hash'
    | 'user'
  value?: string
}
export const JSON_SUFFIX = ' FORMAT JSON;'
/**
 * 查询条件转sql
 */
function dealSQLWhere(whereArr: QueryWhereType[]): string {
  const arr: string[] = []
  whereArr.forEach((item) => {
    let str = ''
    if (item.value) {
      if (item.key) {
        str = item.key + ' IN ' + item.value
      } else {
        str = item.value
      }
      arr.push(str)
    }
  })
  if (arr.length) {
    return ' WHERE ' + arr.join(' AND ')
  } else {
    return ''
  }
}

export function formatJson(sql: string) {
  return sql + JSON_SUFFIX
}

function queryVersion() {
  return formatJson('SELECT version()')
}

function queryServerUptime() {
  return formatJson('SELECT uptime() as uptime')
}

export type SqlParams = {
  database?: string
  table?: string
  type?: string
  initial_user?: string
  query_kind?: string
  startTime?: string
  endTime?: string
  timeDuration?: string
}

function queryTotalRows({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'name', value: table },
  ])
  return formatJson(`SELECT sum(total_rows) as "Total rows" FROM system.tables${whereStr}`)
}

function queryTotalColumns({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'name', value: table },
  ])
  return formatJson(`SELECT count() as "Total columns" FROM system.columns${whereStr}`)
}

function queryDiskUsage() {
  return formatJson(`SELECT
      name as Name,
      path as Path,
      formatReadableSize(free_space) as Free,
      formatReadableSize(total_space) as Total,
      1 - free_space/total_space as Used
      FROM system.disks
    `)
}

function queryTopTablesByRows({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { value: 'active' },
    { key: 'name', value: table },
  ])
  return formatJson(`SELECT concatAssumeInjective(table.database, '.', name) as name,
      table_stats.total_rows as total_rows
      FROM system.tables table
      LEFT JOIN ( SELECT table,
      database,
      sum(rows)                  as total_rows
      FROM system.parts
      ${whereStr}
      GROUP BY table, database
      ) AS table_stats ON table.name = table_stats.table
      ORDER BY total_rows DESC
      LIMIT 10`)
}

function queryTopTablesByColumns({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { value: "name != ''" },
    { key: 'table', value: table },
    { value: "name != ''" },
  ])
  return formatJson(`SELECT concatAssumeInjective(table.database, '.', name) as name,
    col_stats.col_count as total_columns
    FROM system.tables table
    LEFT JOIN (SELECT database, table, count() as col_count FROM system.columns  GROUP BY table, database) as col_stats
    ON table.name = col_stats.table AND col_stats.database = table.database
    ${whereStr} ORDER BY total_columns DESC LIMIT 10`)
}

function queryDatabaseEngines({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'name', value: database }])
  return formatJson(
    `SELECT engine, count() "Number of databases" FROM system.databases
      ${whereStr}
      GROUP BY engine`,
  )
}

function queryTableEngines({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { value: "notLike(engine,'System%')" },
    { key: 'name', value: table },
  ])
  return formatJson(
    `SELECT engine, count() "Number of tables"
      FROM system.tables
      ${whereStr}
      GROUP BY engine ORDER BY count() DESC`,
  )
}

function queryDatabaseSummary({ database, table }: SqlParams) {
  const whereStr1 = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'table', value: table },
  ])
  const whereStr2 = dealSQLWhere([
    { key: 'database', value: database },
    { value: 'active' },
    { key: 'table', value: table },
  ])
  const whereStr3 = dealSQLWhere([
    { key: 'database', value: database },
    { value: "lower(name) != 'information_schema'" },
    { key: 'table', value: table },
  ])
  return formatJson(`
      SELECT name,
        engine,
        tables,
        partitions,
        parts,
        formatReadableSize(bytes_on_disk)            "disk_size",
        col_count,
        total_rows,
        formatReadableSize(data_compressed_bytes) as "uncompressed_size"
      FROM system.databases db
          LEFT JOIN ( SELECT database,
                             uniq(table)                   "tables",
                             uniq(table, partition)        "partitions",
                             count()                    AS parts,
                             sum(bytes_on_disk)            "bytes_on_disk",
                             sum(data_compressed_bytes) as "data_compressed_bytes",
                             sum(rows) as total_rows,
                             max(col_count) as "col_count"
                      FROM system.parts AS parts
                                JOIN (SELECT database, count() as col_count
                                          FROM system.columns
                                          ${whereStr1}
                                          GROUP BY database) as col_stats
                                         ON parts.database = col_stats.database
                      ${whereStr2}
                      GROUP BY database) AS db_stats ON db.name = db_stats.database
      ${whereStr3}
      ORDER BY bytes_on_disk DESC
      LIMIT 10
    `)
}

function queryDictionaries() {
  return formatJson(`
      SELECT source, type, status, count() "count" FROM system.dictionaries GROUP BY source, type, status ORDER BY status DESC, source
    `)
}

function queryTableSummary({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { value: "lower(name) != 'information_schema'" },
    { key: 'table', value: table },
  ])
  return formatJson(`
      SELECT name,
        table.database,
        engine,
        partitions,
        parts,
        formatReadableSize(bytes_on_disk)            "disk_size",
        col_count,
        table_stats.total_rows,
        formatReadableSize(data_compressed_bytes) as "uncompressed_size"
      FROM system.tables table
          LEFT JOIN ( SELECT table,
        database,
        uniq(table, partition)        "partitions",
        count()                    AS parts,
        sum(bytes_on_disk)            "bytes_on_disk",
        sum(data_compressed_bytes) as "data_compressed_bytes",
        sum(rows)                  as total_rows,
                             max(col_count) as col_count
      FROM system.parts as parts
          LEFT JOIN (SELECT database, table, count() as col_count FROM system.columns GROUP BY table, database) as col_stats
                    ON parts.table = col_stats.table AND col_stats.database = parts.database
      WHERE active
      GROUP BY table, database
      ) AS table_stats ON table.name = table_stats.table
      ${whereStr}
      ORDER BY bytes_on_disk DESC
      LIMIT 1000
    `)
}

function queryDetachedPartitions({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'table', value: table },
  ])
  return formatJson(`
      SELECT database, table, partition_id, name, disk, level FROM system.detached_parts
      ${whereStr}
    `)
}

function queryPartsOverTimeWithRowCount({ database, table, startTime, endTime }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'table', value: table },
    {
      value: `modification_time > '${startTime}' AND modification_time < '${endTime}'`,
    },
    // { value: '$__timeFilter(modification_time)' },
  ])
  // SELECT modification_time as timestamp, concatAssumeInjective(database, '.', table) as table, rows FROM system.parts WHERE database IN ($database) AND table IN (${table})  AND $__timeFilter(modification_time) ORDER BY modification_time DESC
  return formatJson(`
      SELECT modification_time as timestamp, concatAssumeInjective(database, '.', table) as table, rows FROM system.parts
      ${whereStr}
      ORDER BY modification_time
    `)
}

function queryMaxPartsPerPartition({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { value: 'active' },
    { key: 'table', value: table },
  ])
  return formatJson(`
      SELECT concatAssumeInjective(database, '.', table) as dbTable, count() "partitions", sum(part_count) "parts", max(part_count) "max_parts_per_partition"
      FROM ( SELECT database, table, count() "part_count"
             FROM system.parts
             ${whereStr}
             GROUP BY database, table, partition ) partitions
      GROUP BY database, table
      ORDER BY max_parts_per_partition DESC
      LIMIT 10
    `)
}

function queryWriteRowDataAnalysis({ timeDuration, startTime, endTime }: SqlParams) {
  const whereStr = dealSQLWhere([
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])

  return formatJson(`
    SELECT toStartOfInterval(toDateTime(event_time) , INTERVAL ${timeDuration}) time,
    sum(written_rows) written_rows FROM system.query_log
    ${whereStr} GROUP BY time  ORDER BY time ASC
  `)
}

function queryRecentPartAnalysis({ database, table }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'database', value: database },
    { key: 'table', value: table },
    { value: 'modification_time > now() - INTERVAL 3 MINUTE' },
  ])
  return formatJson(`
      SELECT
        database,
        table,
        partition_id,
        modification_time,
        name,
        part_type,
        active,
        level,
        disk_name,
        path,
        marks,
        rows,
        bytes_on_disk,
        refcount,
        min_block_number,
        max_block_number FROM system.parts
      ${whereStr}
      ORDER BY modification_time DESC
    `)
}

// Cluster Analysis Query Functions Start

/**
 * 数据库数量
 */

function queryDatabaseNumber({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'name', value: database }])
  return formatJson(`SELECT count() as "Number of databases" FROM system.databases ${whereStr}`)
}

/**
 * 数据库表数量
 */

function queryTableNumber({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  return formatJson(`SELECT count() as "Number of tables" FROM system.tables ${whereStr}`)
}

/**
 * 数据库表中数据条数
 */

function queryRowNumber({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  return formatJson(`SELECT sum(total_rows) as "Number of rows" FROM system.tables ${whereStr}`)
}
/**
 * Number of columns
 */

function queryColumnNumber({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  return formatJson(`SELECT count() as "Number of columns" FROM system.columns ${whereStr}`)
}

/**
 * Cluster Overview
 */

function queryClusterOverview() {
  return formatJson(
    'SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local, errors_count, slowdowns_count FROM system.clusters',
  )
}

/**
 * Current Merges
 */

function queryCurrentMerges({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  // WHERE database IN (${database:singlequote})
  return formatJson(
    `SELECT concatAssumeInjective(database, '.', table) as db_table, round(elapsed, 1) "elapsed", round(100 * progress, 1) "progress", is_mutation, partition_id, result_part_path, source_part_paths, num_parts, formatReadableSize(total_size_bytes_compressed) "total_size_compressed", formatReadableSize(bytes_read_uncompressed) "read_uncompressed", formatReadableSize(bytes_written_uncompressed) "written_uncompressed", columns_written, formatReadableSize(memory_usage) "memory_usage", thread_id FROM system.merges ${whereStr}`,
  )
}

/**
 * Current Mutations
 */

function queryCurrentMutations({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  // WHERE database IN (${database:singlequote})
  return formatJson(
    `SELECT concatAssumeInjective(database, '.', table) as db_table, mutation_id, command, create_time, parts_to_do_names, is_done, latest_failed_part, if(latest_fail_time = '1970-01-01 01:00:00', 'success', 'failure') as success, if(latest_fail_time = '1970-01-01 01:00:00', '-', CAST(latest_fail_time, 'String')) as fail_time, latest_fail_reason FROM system.mutations ${whereStr} ORDER BY is_done ASC, create_time DESC LIMIT 10`,
  )
}

/**
 * Replicated tables by delay
 */

function queryReplicatedTablesByDelay({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  // WHERE database IN (${database:singlequote})
  return formatJson(
    `SELECT concatAssumeInjective(database, '.', table) as db_table, is_leader, is_readonly, absolute_delay, queue_size, inserts_in_queue, merges_in_queue FROM system.replicas ${whereStr} ORDER BY absolute_delay DESC LIMIT 10`,
  )
}

/**
 * Merge progress per table
 */

function queryMergeProgressPerTable({ database }: SqlParams) {
  const whereStr = dealSQLWhere([{ key: 'database', value: database }])
  // WHERE database IN (${database:singlequote})
  return formatJson(
    `SELECT concatAssumeInjective(database, '.', table) as db_table, round(100 * progress, 1) "progress" FROM system.merges ORDER BY progress DESC LIMIT 5 ${whereStr}`,
  )
}

/**
 * Muations parts remaining
 */

function queryMutattionsPartsRemaining({ database }: SqlParams) {
  const whereStr = dealSQLWhere([
    { value: 'parts_remaining > 0' },
    { key: 'database', value: database },
  ])
  // WHERE database IN (${database:singlequote})
  return formatJson(
    `SELECT concatAssumeInjective(database, '.', table, ' - ', mutation_id) as db_table, length(parts_to_do_names) as parts_remaining FROM system.mutations ${whereStr} ORDER BY parts_remaining DESC`,
  )
}

// Cluster Analysis Query Functions End

// Query Analysis Query Functions Start

/**
 * Total Query
 */

function queryTotalQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(`SELECT count() as "Total queries" FROM system.query_log ${whereStr}`)
}

/**
 * Avg query memory
 */

function queryAveMemoryQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(
    `SELECT avg(memory_usage) as "Avg query memory", toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time FROM system.query_log ${whereStr} GROUP BY time ORDER BY time`,
  )
}

/**
 * Avg query time
 */

function queryAveTimeQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(
    `SELECT avg(query_duration_ms) as "Avg query time", toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time FROM system.query_log ${whereStr} GROUP BY time ORDER BY time`,
  )
}

/**
 * Query time distribution
 */

function queryTimeDistributionQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(
    `SELECT query_duration_ms as "Query time" FROM system.query_log ${whereStr} LIMIT 1000`,
  )
}

/**
 * Top users
 */

function queryTopUsersQueryAnalysis({ type, initial_user, query_kind }: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    // { value: `event_time > '${startTime}' and event_time < '${endTime}'` }
  ])
  return formatJson(
    `SELECT initial_user, count() as c FROM system.query_log ${whereStr} GROUP BY initial_user LIMIT 100`,
  )
}

/**
 * Top query types over time
 */

function queryTopOverTimeQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const innerWhereStr = dealSQLWhere([
    { key: 'type', value: type },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
    { key: 'query_kind', value: query_kind },
  ])
  const whereStr = dealSQLWhere([
    { value: "type != 'QueryStart'" },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    {
      key: 'normalized_query_hash',
      value: `(SELECT normalized_query_hash
        FROM system.query_log
        ${innerWhereStr}
        GROUP BY normalized_query_hash
        ORDER BY count() DESC
        LIMIT 5)`,
    },
  ])
  return formatJson(
    `SELECT toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time,
      any(normalizeQuery(query)) AS normalized_query,
      count() as c
      FROM system.query_log
      ${whereStr}
      GROUP BY normalized_query_hash, time
      ORDER BY time`,
  )
}

/**
 * Query performance by type over time
 */

function queryPerformanceQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { value: "type != 'QueryStart'" },
    { value: `event_time > '${startTime}' and event_time < '${endTime}'` },
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    {
      key: 'normalized_query_hash',
      value: `(SELECT normalized_query_hash
        FROM system.query_log
        ${dealSQLWhere([
          { key: 'type', value: type },
          { key: 'initial_user', value: initial_user },
          { key: 'query_kind', value: query_kind },
          { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
        ])}
        GROUP BY normalized_query_hash
        ORDER BY avg(query_duration_ms) DESC
        LIMIT 10)`,
    },
  ])
  return formatJson(
    `SELECT toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time,
      any(normalizeQuery(query)) AS normalized_query,
      avg(query_duration_ms) as avg_query_duration
      FROM system.query_log
      ${whereStr}
      GROUP BY normalized_query_hash, time
      ORDER BY time`,
  )
}

/**
 * Query requests by user
 */

function queryRequestsQueryAnalysis({
  type,
  query_kind,
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'query_kind', value: query_kind },
    { key: 'type', value: type },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
    {
      key: 'initial_user',
      value: `(SELECT initial_user
        FROM system.query_log
        ${dealSQLWhere([
          { key: 'query_kind', value: query_kind },
          { key: 'type', value: type },
          { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
        ])}
        GROUP BY initial_user
        ORDER BY count() as c DESC
        LIMIT 10)`,
    },
  ])
  return formatJson(
    `SELECT toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time, initial_user as user, count() as "number of queries by"
      FROM system.query_log
      ${whereStr}
      GROUP BY initial_user, time
      ORDER BY time`,
  )
}

/**
 * Memory usage over time
 */

function queryMemoryUsageQueryAnalysis({
  startTime,
  endTime,
  timeDuration = '1 MINUTE',
}: SqlParams) {
  const whereStr = dealSQLWhere([
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(
    `SELECT toStartOfInterval(query_start_time,INTERVAL ${timeDuration}) as time, 
      max(memory_usage) as "Max Memory Usage"
      FROM system.query_log
      ${whereStr}
      GROUP BY time
      ORDER BY time DESC`,
  )
}

/**
 * Read vs Write Rows
 */

function queryReadWriteQueryAnalysis({ startTime, endTime }: SqlParams) {
  const whereStr = dealSQLWhere([
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
  ])
  return formatJson(
    `SELECT toStartOfInterval(toDateTime(event_time), INTERVAL 60 second) time,  sum(read_rows) read_rows, sum(written_rows) written_rows FROM system.query_log ${whereStr} GROUP BY time ORDER BY time ASC`,
  )
}

/**
 * Query overview
 */

function queryOverviewQueryAnalysis({
  type,
  initial_user,
  query_kind,
  startTime,
  endTime,
}: // timeDuration = '1 MINUTE'
SqlParams) {
  const whereStr = dealSQLWhere([
    { key: 'type', value: type },
    { key: 'initial_user', value: initial_user },
    { key: 'query_kind', value: query_kind },
    { value: `event_time > '${startTime}' AND event_time < '${endTime}'` },
    // { value: `toStartOfInterval(toDateTime(event_time), INTERVAL ${timeDuration})` },
  ])
  return formatJson(
    `SELECT query_start_time, type, query_duration_ms, 
    initial_user, substring(query_id,1, 8) as query_id, 
    query_kind, normalizeQuery(query) AS normalized_query, 
    concat( toString(read_rows), ' rows / ', 
    formatReadableSize(read_bytes) ) AS read, concat( toString(written_rows), 
    ' rows / ', formatReadableSize(written_bytes) ) AS written, 
    concat( toString(result_rows), ' rows / ', formatReadableSize(result_bytes) ) AS result, 
    formatReadableSize(memory_usage) AS "memory usage" FROM system.query_log 
    ${whereStr} ORDER BY query_duration_ms DESC LIMIT  300`,
    // `SELECT toStartOfInterval(toDateTime(event_time), INTERVAL ${timeDuration}),  sum(read_rows) read_rows, sum(written_rows) written_rows FROM system.query_log ${whereStr} GROUP BY event_time ORDER BY event_time ASC LIMIT 1000`
  )
}

// Query Analysis Query Functions End

/**
 * 获取所有的数据库
 */

function queryAllDatabases() {
  return formatJson('SELECT name FROM system.databases')
}

// select * from system.tables where database = 'default'

/**
 * 根据 database 获取 tables
 */

function queryTablesByDatabase(database?: string) {
  const whereStr = dealSQLWhere([{ key: 'database', value: `'${database}'` }])
  return formatJson(`select * from system.tables ${whereStr}`)
}

// select * from system.columns where database = 'default' and table = 'uk_price_paid'  and type = 'Date'

/**
 * 根据 database 获取 tables
 */

function queryTypeIsDate(database: string, table: string) {
  return formatJson(
    `select * from system.columns where database = '${database}' and table = '${table}'  and type = 'DateTime'`,
  )
}

/**
 * 获取所有的表
 */

function queryAllTables() {
  return formatJson('SELECT name FROM system.tables')
}

/**
 * 获取typeList
 */

function queryTypeList() {
  return formatJson('SELECT type FROM system.query_log GROUP BY type')
}

/**
 * 获取typeList
 */

function queryInitUserList() {
  return formatJson(
    "SELECT DISTINCT (initial_user) FROM system.query_log WHERE initial_user != '' LIMIT 100",
  )
}

/**
 * 获取typeList
 */

function queryKindList() {
  return formatJson(
    "SELECT DISTINCT (query_kind) as query_kind FROM system.query_log WHERE query_kind != ''",
  )
}

function queryDataForMlSecondStep(
  database: string,
  table: string,
  startTime: string,
  endTime: string,
  timeField: string,
  timeInterval = '1 day',
) {
  return formatJson(
    `select toStartOfInterval(${timeField}, INTERVAL ${timeInterval}) as date,
        count() as count from ${database}.${table}
        where ${timeField} >=  '${startTime}' and ${timeField} <= '${endTime}' 
        group by toStartOfInterval(${timeField}, INTERVAL ${timeInterval}) 
        order by toStartOfInterval(${timeField}, INTERVAL ${timeInterval})`,
  )
}

export default {
  queryVersion,
  queryServerUptime,
  queryTotalRows,
  queryTotalColumns,
  queryDiskUsage,
  queryTopTablesByRows,
  queryTopTablesByColumns,
  queryDatabaseEngines,
  queryTableEngines,
  queryDatabaseSummary,
  queryDictionaries,
  queryTableSummary,
  queryDetachedPartitions,
  queryPartsOverTimeWithRowCount,
  queryMaxPartsPerPartition,
  queryRecentPartAnalysis,
  queryWriteRowDataAnalysis,
  // Cluster Analysis start
  queryDatabaseNumber,
  queryTableNumber,
  queryRowNumber,
  queryColumnNumber,
  queryClusterOverview,
  queryCurrentMerges,
  queryCurrentMutations,
  queryReplicatedTablesByDelay,
  queryMergeProgressPerTable,
  queryMutattionsPartsRemaining,
  // Cluster Analysis end
  // Query Analysis Start
  queryTotalQueryAnalysis,
  queryAveMemoryQueryAnalysis,
  queryAveTimeQueryAnalysis,
  queryTimeDistributionQueryAnalysis,
  queryTopUsersQueryAnalysis,
  queryTopOverTimeQueryAnalysis,
  queryPerformanceQueryAnalysis,
  queryRequestsQueryAnalysis,
  queryMemoryUsageQueryAnalysis,
  queryReadWriteQueryAnalysis,
  queryOverviewQueryAnalysis,
  // Query Analysis End
  queryAllDatabases,
  queryAllTables,
  queryTablesByDatabase,
  queryTypeIsDate,
  queryTypeList,
  queryKindList,
  queryInitUserList,
  queryDataForMlSecondStep,
}
