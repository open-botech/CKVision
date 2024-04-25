export type ColumnItem = {
  character_octet_length: string | null
  comment: string
  compression_codec: string
  data_compressed_bytes: string
  data_uncompressed_bytes: string
  database: string
  datetime_precision: string | null
  default_expression: string
  default_kind: string
  is_in_partition_key: number
  is_in_primary_key: number
  is_in_sampling_key: number
  is_in_sorting_key: number
  marks_bytes: string
  name: string
  numeric_precision: string | null
  numeric_precision_radix: string | null
  numeric_scale: string | null
  position: string
  table: string
  type: string
}

export type TableItem = {
  database: string
  engine: string
  name: string
  size: string
}

export type DatabaseItem = {
  name: string
}

export enum TextInsertType {
  Sql = 'sql',
  Table = 'table',
  Column = 'column',
}

export enum TabsType {
  Editor = 'editor',
  TableView = 'tableView',
}

export type Statistics = {
  bytes_read: number
  elapsed: string
  rows_read: number
}

export enum ColumnCommand {
  OpenTable = 'openTable',
  MakeSelect = 'makeSelect',
  MakeSqlDescribe = 'makeSqlDescribe',
}

export type LineageDataItem = {
  source_schema: string
  source_table: string
  target_schema: string
  target_table: string
}
