import { Connection } from '@/store/modules/login/types'
import dayjs from 'dayjs'
import { formatData, formatDataPredict } from './utils'

export const queryList = async (connection: any = {}) => {
  const { connectionUrl, username, password } = connection
  // http://192.168.202.63
  const res = await fetch(`${import.meta.env.VITE_MACHINELEARNING_URL}/list`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      conn_host: connectionUrl?.replace(':8123', '').replace('http://', ''),
      conn_user: username,
      conn_password: password,
      conn_database: '',
    }), // body data type must match "Content-Type" header
  })
  const data = await res.json()
  const finalData = data.map((item: any) => {
    const other = JSON.parse(item[1])
    return {
      job_id: item[0],
      ...other,
    }
  })
  return finalData
}

export async function addTraining({
  connectionUrl,
  username,
  password,
  database,
  table,
  time_filed,
  start_time,
  end_time,
  job_name,
  time_interval,
}: any) {
  const res = await fetch(`${import.meta.env.VITE_MACHINELEARNING_URL}/train`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      conn_host: connectionUrl?.replace(':8123', '').replace('http://', ''),
      conn_user: username,
      conn_password: password,
      conn_database: '',
      database,
      table,
      time_field: time_filed,
      start_time,
      end_time,
      job_name,
      time_interval,
    }), // body data type must match "Content-Type" header
  })
  const data = await res.json()
  return data
}

export async function queryResultForMl(connection: Connection, finalValue: any) {
  const { connectionUrl, username, password } = connection
  const {
    database,
    table,
    time_field,
    start_time,
    end_time,
    job_name,
    model_path,
    time_interval = '1 day',
  } = finalValue
  // http://192.168.202.63
  const res = await fetch(`${import.meta.env.VITE_MACHINELEARNING_URL}/back_testing`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      conn_host: connectionUrl?.replace(':8123', '').replace('http://', ''),
      conn_user: username,
      conn_password: password,
      conn_database: '',
      database,
      table,
      time_field,
      start_time,
      end_time,
      job_name,
      model_path,
      time_interval,
    }), // body data type must match "Content-Type" header
  })
  const data = await res.json()
  const {
    realData,
    forecastData,
    realKeyFormat: realKey,
    diff,
    lessForecast,
    biggerForecast,
  } = formatData(data)
  return {
    realData,
    forecastData,
    realKey,
    diff,
    lessForecast,
    biggerForecast,
  }
}

export async function queryResultForMlUsePredict(data: any) {
  const {
    model_path,
    steps,
    unit,
    realData: realDataOrigin,
    lessForecast: lessForecastOrigin,
    biggerForecast: biggerForecastOrigin,
    realKey: realKeyOrigin,
    diff: diffOrigin,
  } = data
  const res = await fetch(`${import.meta.env.VITE_MACHINELEARNING_URL}/predict`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      model_path,
      steps,
    }), // body data type must match "Content-Type" header
  })
  const dataRes = await res.json()
  const { realData, realKey, diff, lessForecast, biggerForecast } = formatDataPredict({
    data: dataRes,
    unit,
    realData: realDataOrigin,
    lessForecast: lessForecastOrigin,
    biggerForecast: biggerForecastOrigin,
    realKey: realKeyOrigin,
    diff: diffOrigin,
  })
  return {
    realData,
    realKey,
    diff,
    lessForecast,
    biggerForecast,
  }
}

export async function deleteOne(connection: Connection, data: any) {
  const { connectionUrl, username, password } = connection
  const { job_id, model_path } = data
  const res = await fetch(`${import.meta.env.VITE_MACHINELEARNING_URL}/delete`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      job_id,
      model_path,
      conn_host: connectionUrl?.replace(':8123', '').replace('http://', ''),
      conn_user: username,
      conn_password: password,
      conn_database: '',
    }), // body data type must match "Content-Type" header
  })
}
