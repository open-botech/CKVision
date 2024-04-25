import dayjs from 'dayjs'

export const getUndefined = (val: string) => {
  return val?.includes('All') ? undefined : val
}

export const getRealSqlOfArr = (val?: string) => {
  if (!val) {
    return val
  }
  // ('COLUMNS','SCHEMATA')
  // const addMarksVal = val.map(str => `'${str}'`)
  // return `(${addMarksVal.join(',')})`
  return `'${val}'`
}
export const isType = (val: any) => {
  return Object.prototype.toString.call(val)
}

export const isNumber = (val: any) => {
  const typeStr = isType(val)
  return typeStr === '[object Number]'
}

export const isString = (val: any) => {
  const typeStr = isType(val)
  return typeStr === '[object String]'
}

const formatStr = 'YYYY-MM-DD HH:mm:ss'

export const getStartAndEndTime = (time: string | number) => {
  // 2022-01-10 00:00:00
  const isNum = isNumber(time)
  const isStr = isNumber(time)
  const current = dayjs().valueOf()
  if (isNum) {
    return [dayjs(current - +time).format(formatStr), dayjs().format(formatStr)]
  } else if (isStr) {
    const [start, end] = (time as string).split(',')
    let endTime = end
    if (end === '?') {
      endTime = dayjs().format(formatStr)
    }
    return [start, endTime]
  }
  return []
}

// 保留两位小数
export const round2 = (val: any) => {
  if (!isNumber(val)) {
    return val
  }
  return Math.round(val * 100) / 100
}

export const number2Other = (val: number, type?: string): number | string => {
  // 利用 toLocaleString 的特性将数字转成带 , 的字符串
  if (type === 'toLocaleString') {
    return val.toLocaleString()
  }
  // 将时间转换为天数
  if (type === 'duration') {
    // return moment.utc().startOf('year').add({ seconds: val }).format('D[Day]HH[Hour]');
    const duration = dayjs.duration(val, 'seconds')
    const days = duration.days()
    const hours = duration.hours()
    if (days === 0 && hours === 0) {
      const minute = duration.minutes()
      const second = duration.seconds()
      return `
        ${minute ? minute + 'Minute' : ''}
        ${second ? second + 'Second' : ''}
      `
    }
    return `
      ${days ? days + ' day' : ''}
      ${hours ? hours + ' hour' : ''}
    `
  }
  if (type === 'MB') {
    return (val / 1024 / 1024).toFixed(2)
  }
  // 不传 type ，直接返回
  return val
}
