import echarts from 'echarts'
import dayjs from 'dayjs'
import { effect } from './data'

type DataType = {
  realData?: number[]
  forecastData?: number[]
  realKey?: string[]
  diff?: number[]
  lessForecast?: number[]
  biggerForecast?: number[]
}

export function formatResultLineOption({
  realData,
  lessForecast,
  biggerForecast,
  realKey,
  diff,
}: DataType): echarts.EChartsCoreOption {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: realKey,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        splitLine: {
          show: false,
        },
        type: 'value',
      },
    ],
    series: [
      {
        name: 'diff with forecast',
        data: diff,
        type: 'scatter',
        z: 10,
        itemStyle: {
          color: '#F53F3F',
          borderColor: '#FFFFFF',
        },
      },
      {
        name: 'real',
        data: realData,
        type: 'line',
        symbol: 'none',
        lineStyle: {
          color: '#4ECBB4',
          width: 2,
        },
        z: 9,
      },
      // {
      //   name: 'forcast',
      //   data: forecastData,
      //   type: 'line',
      //   symbol: 'none',
      //   // lineStyle: {
      //   //   opacity: 0
      //   // }, // 隐藏线
      //   // areaStyle: {
      //   //   color: 'rgba(78, 203, 180, 0.3)'
      //   // },
      //   lineStyle: {
      //     color: 'rgba(78, 203, 180, 0.3)',
      //     width: 0
      //   },
      //   markArea: {
      //     data: lessForecast?.map((item, i) => {
      //       if (!item) {
      //         return undefined
      //       }
      //       return [
      //         {
      //           type: 'min',
      //           x: (realKey as string[])[i],
      //           y: item
      //         },
      //         {
      //           type: 'max',
      //           x: (realKey as string[])[i],
      //           y: (biggerForecast as number[])[i]
      //         }
      //       ]
      //     })
      //   }
      // },
      {
        name: 'forcast max',
        data: biggerForecast,
        type: 'line',
        symbol: 'none',
        lineStyle: {
          opacity: 0,
        }, // 隐藏线
        areaStyle: {
          color: 'rgba(78, 203, 180, 0.3)',
        },
        // lineStyle: {
        //   color: 'rgba(78, 203, 180, 0.3)',
        //   width: 30
        // }
      },
      {
        name: 'forcast min',
        data: lessForecast,
        type: 'line',
        symbol: 'none',
        lineStyle: {
          opacity: 0,
        }, // 隐藏线
        areaStyle: {
          opacity: 1,
          color: '#fff',
        },
        // lineStyle: {
        //   color: 'rgba(78, 203, 180, 0.3)',
        //   width: 30
        // }
      },
    ],
  }
}

export const formatData = (data: { '0': { '0': any; '1': any } }) => {
  const {
    0: { count: real },
    1: { pred: forecast },
  } = data['0']
  const realKey = Object.keys(real).sort()
  const realData = realKey.map((key) => real[key])
  const forecastData: number[] = []
  const lessForecast: number[] = []
  const biggerForecast: number[] = []
  realKey.forEach((key, i) => {
    const effectNum = forecast[i] * effect
    const less = Math.round(forecast[i] - effectNum)
    const bigger = Math.round(forecast[i] + effectNum)
    forecastData.push(forecast[i])
    lessForecast.push(less)
    biggerForecast.push(bigger)
  })
  const diff: any[] = []

  Object.keys(forecast).forEach((key: any) => {
    const effectNum = forecast[key] * effect
    const less = forecast[key] - effectNum
    const bigger = forecast[key] + effectNum
    const realVal = real[realKey[key]]
    if (realVal < less || realVal >= bigger) {
      diff.push([dayjs(+realKey[key]).format('YYYY-MM-DD HH:mm:ss'), real[realKey[key]]])
    }
  })
  const realKeyFormat = realKey.map((item) => {
    return dayjs(+item).format('YYYY-MM-DD HH:mm:ss')
  })
  return {
    realData,
    forecastData,
    realKeyFormat,
    diff,
    lessForecast,
    biggerForecast,
  }
}

export const formatDataPredict = ({
  realData: realDataOrigin,
  lessForecast: lessForecastOrigin,
  biggerForecast: biggerForecastOrigin,
  realKey: realKeyOrigin,
  diff: diffOrigin,
  data,
  unit,
}: any) => {
  const lastDay = realKeyOrigin[realKeyOrigin.length - 1]
  const lastDayMoment = dayjs(lastDay)
  Object.keys(data).forEach((key: string, index) => {
    const effectNum = data[key] * effect
    const less = Math.round(data[key] - effectNum)
    const bigger = Math.round(data[key] + effectNum)
    const next = lastDayMoment.add(index + 1, unit).format('YYYY-MM-DD HH:mm:ss')
    realKeyOrigin[+key] = next
    lessForecastOrigin[+key] = less
    biggerForecastOrigin[+key] = bigger
  })
  return {
    realData: realDataOrigin,
    lessForecast: lessForecastOrigin,
    biggerForecast: biggerForecastOrigin,
    realKey: realKeyOrigin,
    diff: diffOrigin,
  }
}
