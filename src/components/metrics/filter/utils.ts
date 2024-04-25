import { query } from '@/utils/http'
import sqls from '../dataAnalysis/sqls'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export const queryListWithKey = {
  database: () => query(sqls.queryAllDatabases()),
  table: (database?: string) => query(sqls.queryTablesByDatabase(database)),
  queryKind: () => query(sqls.queryKindList()),
  type: () => query(sqls.queryTypeList()),
  user: () => query(sqls.queryInitUserList()),
}

const formatStr = 'YYYY-MM-DD HH:mm:ss'

// 昨天
export const getYestoday = () => {
  const day = dayjs().subtract(1, 'days')
  return `${day.startOf('day').format(formatStr)},${day.endOf('day').format(formatStr)}`
}

// 前天
export const getQt = () => {
  const day = dayjs().subtract(2, 'days')
  return `${day.startOf('day').format(formatStr)},${day.endOf('day').format(formatStr)}`
}

// 上周今天
export const getThisDayLatWeek = () => {
  const day = dayjs().subtract(7, 'days')
  return `${day.startOf('day').format(formatStr)},${day.endOf('day').format(formatStr)}`
}

// 上周
export const getLastWeek = () => {
  const day = dayjs().subtract(7, 'days')
  return `${day.startOf('week').format(formatStr)},${day.endOf('week').format(formatStr)}`
}

// 上月
export const getLastMonth = () => {
  const day = dayjs().startOf('month').subtract(1, 'days')
  return `${day.startOf('week').format(formatStr)},${day.endOf('week').format(formatStr)}`
}

// 上季度
export const getLastQuarter = () => {
  const monthLastQuarter = dayjs().month() - 3 + 1
  let startMonth = 0
  let endMonth = 0
  let dayjsSetYear
  if (monthLastQuarter <= 0) {
    startMonth = 10
    endMonth = 12
    dayjsSetYear = dayjs().subtract(1, 'years')
  } else {
    if ([1, 4, 7, 10].includes(monthLastQuarter)) {
      startMonth = monthLastQuarter
      endMonth = monthLastQuarter + 2
    }
    if ([2, 5, 8, 11].includes(monthLastQuarter)) {
      startMonth = monthLastQuarter - 1
      endMonth = monthLastQuarter + 1
    }
    if ([3, 6, 9, 12].includes(monthLastQuarter)) {
      startMonth = monthLastQuarter - 2
      endMonth = monthLastQuarter
    }
    dayjsSetYear = dayjs()
  }

  return `${dayjsSetYear
    .month(startMonth - 1)
    .startOf('month')
    .format(formatStr)},${dayjsSetYear
    .month(endMonth - 1)
    .endOf('month')
    .format(formatStr)}`
}

// 去年
export const getLastYear = () => {
  const day = dayjs().subtract(1, 'years')
  return `${day.startOf('year').format(formatStr)},${day.endOf('year').format(formatStr)}`
}

// 今天
export const getToday = () => {
  const day = dayjs()
  return `${day.startOf('day').format(formatStr)},${day.endOf('day').format(formatStr)}`
}

// 今天截止到目前为止
export const getTodaySoFar = () => {
  const day = dayjs()
  return `${day.startOf('day').format(formatStr)},?`
}

// 本周
export const getThisWeek = () => {
  const day = dayjs()
  return `${day.startOf('week').format(formatStr)},${day.endOf('week').format(formatStr)}`
}

// 本周截止到目前为止
export const getThisWeekSoFar = () => {
  const day = dayjs()
  return `${day.startOf('week').format(formatStr)},?`
}

// 本月
export const getThisMonth = () => {
  const day = dayjs()
  return `${day.startOf('month').format(formatStr)},${day.endOf('month').format(formatStr)}`
}

// 本月截止到目前为止
export const getThisMonthSoFar = () => {
  const day = dayjs()
  return `${day.startOf('month').format(formatStr)},?`
}

// 本年
export const getThisYear = () => {
  const day = dayjs()
  return `${day.startOf('year').format(formatStr)},${day.endOf('year').format(formatStr)}`
}

// 本年截止到目前为止
export const getThisYearSoFar = () => {
  const day = dayjs()
  return `${day.startOf('year').format(formatStr)},?`
}

// 本季度
export const getThisQuarter = () => {
  const monthLastQuarter = dayjs().month() + 1
  let startMonth = 0
  let endMonth = 0
  const day = dayjs()
  if ([1, 4, 7, 10].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter
    endMonth = monthLastQuarter + 2
  }
  if ([2, 5, 8, 11].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter - 1
    endMonth = monthLastQuarter + 1
  }
  if ([3, 6, 9, 12].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter - 2
    endMonth = monthLastQuarter
  }
  return `${day
    .month(startMonth - 1)
    .startOf('month')
    .startOf('day')
    .format(formatStr)},${day
    .month(endMonth - 1)
    .endOf('month')
    .endOf('day')
    .format(formatStr)}`
}

// 本季度截止到目前为止
export const getThisQuarterSoFar = () => {
  const monthLastQuarter = dayjs().month() + 1
  let startMonth = 0

  const day = dayjs()
  if ([1, 4, 7, 10].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter
  }
  if ([2, 5, 8, 11].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter - 1
  }
  if ([3, 6, 9, 12].includes(monthLastQuarter)) {
    startMonth = monthLastQuarter - 2
  }
  return `${day
    .month(startMonth - 1)
    .startOf('month')
    .startOf('day')
    .format(formatStr)},?`
}

export const getTimeFilterList = () => {
  return [
    {
      name: 'Last 5 minutes',
      value: dayjs.duration(5, 'minutes').asMilliseconds(),
      duration: '1 SECOND',
    },
    {
      name: 'Last 15 minutes',
      value: dayjs.duration(15, 'minutes').asMilliseconds(),
      duration: '3 SECOND',
    },
    {
      name: 'Last 30 minutes',
      value: dayjs.duration(30, 'minutes').asMilliseconds(),
      duration: '5 SECOND',
    },
    {
      name: 'Last 1 hour',
      value: dayjs.duration(1, 'hours').asMilliseconds(),
      duration: '6 SECOND',
    },
    {
      name: 'Last 3 hour',
      value: dayjs.duration(3, 'hours').asMilliseconds(),
      duration: '10 SECOND',
    },
    {
      name: 'Last 6 hour',
      value: dayjs.duration(6, 'hours').asMilliseconds(),
      duration: '15 SECOND',
    },
    {
      name: 'Last 12 hour',
      value: dayjs.duration(12, 'hours').asMilliseconds(),
      duration: '30 SECOND',
    },
    {
      name: 'Last 24 hour',
      value: dayjs.duration(24, 'hours').asMilliseconds(),
      duration: '1 MINUTE',
    },
    {
      name: 'Last 2 days',
      value: dayjs.duration(2, 'days').asMilliseconds(),
      duration: '2 MINUTE',
    },
    {
      name: 'Last 7 days',
      value: dayjs.duration(7, 'days').asMilliseconds(),
      duration: '5 MINUTE',
    },
    {
      name: 'Last 30 days',
      value: dayjs.duration(30, 'days').asMilliseconds(),
      duration: '30 MINUTE',
    },
    {
      name: 'Last 90 days',
      value: dayjs.duration(90, 'days').asMilliseconds(),
      duration: '2 HOUR',
    },
    {
      name: 'Last 6 months',
      value: dayjs.duration(6, 'months').asMilliseconds(),
      duration: '3 HOUR',
    },
    {
      name: 'Last 1 year',
      value: dayjs.duration(1, 'years').asMilliseconds(),
      duration: '6 HOUR',
    },
    {
      name: 'Last 2 year',
      value: dayjs.duration(2, 'years').asMilliseconds(),
      duration: '12 HOUR',
    },
    {
      name: 'Last 5 year',
      value: dayjs.duration(5, 'years').asMilliseconds(),
      duration: '1 DAY',
    },
    {
      name: 'Yesterday',
      value: getYestoday(),
      duration: '1 MINUTE',
    },
    {
      name: 'Day before yesterday',
      value: getQt(),
      duration: '1 MINUTE',
    },
    {
      name: 'This day last week',
      value: getThisDayLatWeek(),
      duration: '1 MINUTE',
    },
    {
      name: 'Previous week',
      value: getLastWeek(),
      duration: '5 MINUTE',
    },
    {
      name: 'Previous month',
      value: getLastMonth(),
      duration: '30 MINUTE',
    },
    {
      name: 'Previous fiscal quarter',
      value: getLastQuarter(),
      duration: '2 HOUR',
    },
    {
      name: 'Previous year',
      value: getLastYear(),
      duration: '6 HOUR',
    },
    {
      name: 'Today',
      value: getToday(),
      duration: '1 MINUTE',
    },
    {
      name: 'Today so far',
      value: getTodaySoFar(),
      duration: '1 MINUTE',
    },
    {
      name: 'This week',
      value: getThisWeek(),
      duration: '5 MINUTE',
    },
    {
      name: 'This week so far',
      value: getThisWeekSoFar(),
      duration: '5 MINUTE',
    },
    {
      name: 'This month',
      value: getThisMonth(),
      duration: '30 MINUTE',
    },
    {
      name: 'This month so far',
      value: getThisMonthSoFar(),
      duration: '30 MINUTE',
    },
    {
      name: 'This year',
      value: getThisYear(),
      duration: '6 HOUR',
    },
    {
      name: 'This year so far',
      value: getThisYearSoFar(),
      duration: '6 HOUR',
    },
    {
      name: 'This fiscal quarter',
      value: getThisQuarter(),
      duration: '2 HOUR',
    },
    {
      name: 'This fiscal quarter so far',
      value: getThisQuarterSoFar(),
      duration: '2 HOUR',
    },
  ]
}

export const getRealVal = (val: string[]) => {
  let realVal
  if (val.length > 1) {
    const last = val[val.length - 1]
    if (last === 'All') {
      realVal = ['All']
    } else {
      realVal = val.filter((item) => item !== 'All')
    }
  }
  return realVal
}
