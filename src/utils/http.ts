import { JSON_SUFFIX } from '@/components/metrics/dataAnalysis/sqls';
import { Statistics } from '@/components/sql/types';
import { useLioginOutsideStore } from '@/store/modules/login';
import { Axios, AxiosRequestConfig } from 'axios';

const axiosClient = new Axios({
  method: 'post',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/json',
  },
});

export type QueryRes = {
  data: any;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
  exception?: string;
  meta?: any;
  rows?: number;
  rows_before_limit_at_least?: number;
};

async function request(request: AxiosRequestConfig): Promise<QueryRes> {
  const response = await axiosClient.request(request);
  const contentType = response.headers['content-type'] as string;
  const statistics = JSON.parse(response.headers['x-clickhouse-summary']);
  const replicaName = response.headers['x-clickhouse-server-display-name'];
  statistics.elapsed = Number(statistics.elapsed_ns) / 1e9;
  statistics.bytes_read = Number(statistics.read_bytes);
  statistics.rows_read = Number(statistics.total_rows_to_read);

  const result: QueryRes = { statistics } as any;
  if (
    contentType.includes('text/plain') ||
    contentType.includes('application/xml') ||
    contentType.includes('text/csv') ||
    contentType.includes('text/tab-separated-values')
  )
    result.data = response.data;
  if (contentType.includes('application/json')) {
    const res = JSON.parse(response.data);
    result.data = res.data;
    result.meta = res.meta;
    result.rows = res.rows;
    result.rows_before_limit_at_least = res.rows_before_limit_at_least;
    result.exception = res.exception;
  }
  if (response.status === 200 && !result.data) {
    result.data = 'OK';
  }
  if (response.status > 399) {
    throw new Error(result.data?.length || result.exception);
  }
  return result;
}

type Connection = {
  connectionUrl: string;
  password: string;
  username: string;
};

function getRequestUrl(connection?: Connection, settings?: string): string {
  if (!connection) {
    throw new Error('No Connection');
  }
  const httpProto = connection.connectionUrl.indexOf('//') === -1 ? 'http://' : '';

  let url = `${httpProto}${connection.connectionUrl}`;
  url = `${url}/?default_format=JSON&output_format_json_quote_denormals=1&output_format_json_quote_64bit_integers=1&log_queries=1&enable_http_compression=1&add_http_cors_header=1&result_overflow_mode=throw&timeout_overflow_mode=throw&max_result_rows=90000&max_result_bytes=10000000`;
  if (connection.password) {
    url += `&user=${encodeURIComponent(connection.username)}&password=${encodeURIComponent(
      connection.password
    )}`;
  } else {
    url += `&user=${encodeURIComponent(connection.username)}`;
  }

  if (settings) {
    url += settings;
  }

  return url;
}

export function query(
  sql?: string,
  settings?: string,
  connection?: Connection,
  isLogin = false,
  noFormat = false
): Promise<QueryRes> {
  const loginStore = useLioginOutsideStore();
  const connectionData = connection ?? loginStore.connection;
  const url = getRequestUrl(connectionData, settings);
  return request({ method: isLogin ? 'get' : 'post', url, data: sql });
}
