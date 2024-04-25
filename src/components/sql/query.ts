import { query } from '@/utils/http'
import { JSON_SUFFIX } from '../metrics/dataAnalysis/sqls'

export const queryLineage = ({ database, name }: any) => {
  const sql = `
    WITH
        (SELECT groupUniqArray(concat(database, '.', name))
        FROM system.tables
        ) AS tables
    SELECT substring(source, 1, position(source, '.') - 1) AS source_schema
        , substring(source, position(source, '.') + 1)    AS source_table
        , database                                        AS target_schema
        , name                                            AS target_table
    FROM system.tables
            ARRAY JOIN arrayIntersect(splitByRegexp('[\\s()'']+', create_table_query), tables) AS source
    WHERE engine IN ('View')
      AND NOT (source_schema = target_schema AND source_table = target_table) and 
      (
                    source_schema = '${database}' and source_table = '${name}'
            or
                    target_schema = '${database}' and target_table = '${name}'
        )
    union all    
    SELECT source_schema, source_table, target_schema, target_table
    FROM (
        WITH
            (SELECT groupUniqArray(concat(database, '.', name))
             FROM system.tables
            ) AS tables
        SELECT substring(source, 1, position(source, '.') - 1) AS source_schema
             , substring(source, position(source, '.') + 1)    AS source_table
             , database                                        AS target_schema
             , name                                            AS target_table
             , extract(create_table_query, 'TO (.*?) \\(')     AS extract_to
        FROM system.tables
                 ARRAY JOIN arrayIntersect(splitByRegexp('[\\s()'']+', create_table_query), tables) AS source
        WHERE engine IN ('MaterializedView')
          AND NOT (source_schema = target_schema AND source_table = target_table)
          AND source <> extract_to and
            (
          source_schema = '${database}' and source_table = '${name}'
           or
          target_schema = '${database}' and target_table = '${name}'
          )

        UNION ALL
        SELECT database                                                AS source_schema
             , name                                                    AS source_table
             , substring(extract_to, 1, position(extract_to, '.') - 1) AS target_schema
             , substring(extract_to, position(extract_to, '.') + 1)    AS target_table
             , extract(create_table_query, 'TO (.*?) \\(')             AS extract_to
        FROM system.tables
        WHERE engine IN ('MaterializedView')
          AND extract_to <> '' and
            (
          source_schema = '${database}' and source_table = '${name}'
           or
          target_schema = '${database}' and target_table = '${name}'
          )

         )
    `

  return query(sql).then((res) => {
    return res
  })
}

export const queryAllTables = () => {
  const sql = `SELECT t.database,
        t.name,
        t.engine,
        -- t.*,
        pa.size
    FROM system.tables as t ANY LEFT JOIN ( SELECT database,table as name,formatReadableSize(sum(bytes)) as size FROM system.parts  GROUP BY database,name ) as pa USING (database,name)
    LIMIT 10000

    ${JSON_SUFFIX};`
  return query(sql).then((res) => {
    return res
  })
}

export const queryAllDatabases = () => {
  const sql = `SELECT name FROM system.databases LIMIT 10000

  ${JSON_SUFFIX}`
  return query(sql).then((res) => {
    return res
  })
}

export const queryAllColumns = () => {
  const sql = `SELECT * FROM system.columns

    LIMIT 50000

  ${JSON_SUFFIX}`
  return query(sql).then((res) => {
    return res
  })
}

export const queryTableDataPaneData = (table: any, rows = 100) => {
  const sql = `select * from ${table.database}.${table.name} limit ${rows}`
  return query(sql).then((res) => {
    console.log(res, 'res')

    return res
  })
}

export const queryPropertiesColumns = (table: any) => {
  const sql = `DESCRIBE TABLE ${table.database}.${table.name} ${JSON_SUFFIX}`
  return query(sql).then((res) => {
    return res
  })
}

export const queryPropertiesStatistics = (table: any) => {
  const sql = `SELECT table,
    sum(rows) AS rows,
    formatReadableSize(sum(bytes)) as size,
    min(min_date) as min_date,
    max(max_date) as max_date
    FROM system.parts
    WHERE active
    and database = '${table.database}' and table = '${table.name}'
    GROUP BY table ${JSON_SUFFIX}`
  return query(sql).then((res) => {
    const data = res.data[0]
    return {
      columns: [
        {
          name: 'Name',
        },
        {
          name: 'Value',
        },
      ],
      tableData:
        data &&
        res.meta.map((item: any) => {
          return {
            Name: item.name,
            Value: data[item.name],
          }
        }),
    }
  })
}
