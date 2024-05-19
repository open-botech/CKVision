import { formatDialect, FormatOptions } from 'sql-formatter'
import { clickhouse } from '@tw/willy-clickhouse-formatter'

export function formatSqlSafely(sql: string, opts: Partial<FormatOptions> = {}) {
  try {
    let formattedSql = sql
    formattedSql = formatDialect(sql, { ...opts, dialect: clickhouse })
    return formattedSql
  } catch (error) {
    console.error('Error formatting SQL safely', error)
    return sql
  }
}
