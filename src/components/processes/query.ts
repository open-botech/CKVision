import { query } from '@/utils/http'
import { JSON_SUFFIX } from '../metrics/dataAnalysis/sqls'

export const queryProcesses = () => {
  const sql = `SELECT
    now() as time,
    round(elapsed,1) as elapsed ,
    
    normalizeQuery(query) AS Query,
    1 as count,
    formatReadableSize(toUInt64(read_bytes)+toUInt64(written_bytes)) as bytes,
    toUInt64(toUInt64(read_rows) + toUInt64(written_rows)) as rows,
    formatReadableSize(peak_memory_usage) AS "peak memory",
    -- formatReadableSize(memory_usage) as "memory usage",
    formatReadableSize(read_bytes) as "read bytes",
    formatReadableSize(written_bytes) as "written bytes",  
    formatReadableSize(memory_usage) AS "memory usage",
    
    query_id,
    is_cancelled,
    user,
    multiIf(empty(client_name), http_user_agent, concat(client_name, ' ', toString(client_version_major), '.', toString(client_version_minor), '.', toString(client_version_patch))) AS client,
    
    cityHash64(normalizeQuery(query)) AS hash,
    thread_ids,
    ProfileEvents,
    Settings
    FROM system.processes


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
      FROM system.mutations
      ORDER BY create_time DESC
      LIMIT ${limit} OFFSET ${offset}
    ${JSON_SUFFIX}`
  return query(sql)
}