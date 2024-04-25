import { query } from '@/utils/http'

interface CommonResponse<T> {
  code: number
  data: T
  msg: string
}

interface TestResponse {
  id: number
  title: string
  userId: number
}

export const testApi = (sql: string) => {
  return query(sql)
}
