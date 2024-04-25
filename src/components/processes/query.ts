import { query } from '@/utils/http'
import { JSON_SUFFIX } from '../metrics/dataAnalysis/sqls'

export const queryProcessesImports = () => {
  const sql = `SELECT
  round(elapsed / 3600) || 'h ' || 
    round(elapsed % 3600 / 60) || 'm ' ||
    round(elapsed % 60) || 's' AS query_duration,
  query,
  formatReadableSize(written_bytes) as "written bytes",  
  formatReadableSize(written_bytes / elapsed) as written_bytes_per_sec,
  written_rows,
  formatReadableSize(read_bytes) as "read bytes",
  formatReadableSize(read_bytes / elapsed) as read_bytes_per_sec,
  read_rows,
  formatReadableSize(peak_memory_usage) AS "peak memory",
  formatReadableSize(memory_usage) AS "memory usage",
  query_id,
  is_cancelled,
  user,
  multiIf(empty(client_name), http_user_agent, concat(client_name, ' ', toString(client_version_major), '.', toString(client_version_minor), '.', toString(client_version_patch))) AS client,
  cityHash64(query) AS hash,
  thread_ids,
  ProfileEvents,
  Settings
  FROM clusterAllReplicas(main, system.processes)
  where query_kind='Insert' and user != 'backup' and client not like 'clickhouse-js%'
  order by elapsed asc
`
  return query(sql)
}

export const queryProcessesSelects = () => {
  const sql = `SELECT
    now() as time,
    round(elapsed,1) as elapsed ,
    query,
    formatReadableSize(toUInt64(read_bytes)+toUInt64(written_bytes)) as bytes,
    toUInt64(toUInt64(read_rows) + toUInt64(written_rows)) as rows,
    formatReadableSize(peak_memory_usage) AS "peak memory",
    formatReadableSize(read_bytes) as "read bytes",
    formatReadableSize(written_bytes) as "written bytes",  
    formatReadableSize(memory_usage) AS "memory usage",
    
    query_id,
    is_cancelled,
    user,
    multiIf(empty(client_name), http_user_agent, concat(client_name, ' ', toString(client_version_major), '.', toString(client_version_minor), '.', toString(client_version_patch))) AS client,
    
    cityHash64(query) AS hash,
    thread_ids,
    ProfileEvents,
    Settings
    FROM clusterAllReplicas(main, system.processes)
    where query_kind='Select'
    order by elapsed asc


   ${JSON_SUFFIX}
  `
  return query(sql)
}

export const queryMutations = (limit = 100, offset = 0) => {
  const sql = `
    SELECT
          database,
          table,
          mutation_id,
          command,
          create_time,
      parts_to_do_names,
      parts_to_do,
          is_done,
          latest_failed_part,
          latest_fail_time,
          latest_fail_reason
      FROM clusterAllReplicas(main, system.mutations)
      ORDER BY create_time DESC
      LIMIT ${limit} OFFSET ${offset}
    ${JSON_SUFFIX}`
  return query(sql)
}

export const queryHistoricalImports = () => {
  const sql = `WITH ranked_queries AS (
    SELECT
        *,
        ROW_NUMBER() OVER(PARTITION BY query_id ORDER BY event_time DESC) AS rn
    FROM
        clusterAllReplicas(main, system.query_log)
    WHERE
        http_user_agent NOT LIKE '%clickhouse%'
        AND query_kind = 'Insert'
        AND query NOT LIKE '%query_log%'
        and user != 'backup'
)
SELECT
    type,
    event_time,
    query_start_time,
    round((event_time - query_start_time) / 3600) || 'h ' || 
    round(((event_time - query_start_time) % 3600) / 60) || 'm ' ||
    round((event_time - query_start_time) % 60) || 's' AS query_duration,
    formatReadableSize(if(event_time - query_start_time != 0, 
      written_bytes / (event_time - query_start_time), 
      0)) as written_bytes_per_sec,
    query_id,
    written_rows,
    formatReadableSize(written_bytes) as "written bytes",  
    read_rows,
    formatReadableSize(read_bytes) as "read bytes",
    query,
    user,
    exception
FROM
    ranked_queries
WHERE
    rn = 1
ORDER BY
    event_time DESC
LIMIT
    100
`
  return query(sql)
}
