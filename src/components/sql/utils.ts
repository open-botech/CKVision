
import { useLoginStore } from '@/store'
import { query } from '@/utils/http'
import { ColumnItem, DatabaseItem, TableItem } from './types'
import { JSON_SUFFIX } from '../metrics/dataAnalysis/sqls'

export const createTree = (columns: ColumnItem[], tables: TableItem[], database: DatabaseItem[]) => {
  const loginStore = useLoginStore()
  const tablesTree = tables.map((item) => {
    const children = columns.filter((col) => col.table === item.name)
    return {
      ...item,
      children
    }
  })

  const databaseTree = database.map(item => {
    const children = tablesTree.filter((table) => table.database === item.name)
    return {
      ...item,
      children
    }
  })

  const finalTree = {
    name: loginStore.connection.connectionName,
    isRoot: true,
    children: databaseTree
  }
  return [finalTree]
}

export const getMakeSelectSql = (table: any) => {
  const cols = table.children
  const fields: Array<string> = []
  const where: Array<string> = []

  cols.forEach((item: any) => {
    if (!item) return
    fields.push(item.name)
    if (item.type === 'Date') {
      where.push(`${item.name}=today()`)
    }
  })

  const tableName = table.name.includes('.') ? `"${table.name}"` : table.name
  const db = table.database
  const selectFields = fields.join(',\n\t')
  const sqlTemplate = `\nSELECT\n\t${selectFields}\nFROM\n\t${db}.${tableName}\n%WHERE%\nLIMIT 100\n\n`
  const sql = sqlTemplate.replace(
    '%WHERE%',
    where.length ? `\nWHERE\n\t${where.join('\n AND \n')}` : ''
  )
  return sql
}

export const getSqlDescribe = (table: any) => {
  const sql = `SHOW CREATE TABLE ${table.database}.${table.name} ${JSON_SUFFIX}`
  return query(sql)
    .then(res => {
      return res.data[0].statement
    })
}
