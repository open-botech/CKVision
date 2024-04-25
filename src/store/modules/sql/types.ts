import { TableItem, TabsType } from '@/components/sql/types'

export type TabItem = {
  name?: string
  sql?: string
  type?: TabsType
  title?: string
  node?: TableItem
}
