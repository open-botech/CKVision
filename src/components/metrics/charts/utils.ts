import * as echarts from 'echarts/core'
import { generatePieInstance, formatPieOptions } from './usePie'
import { generateBarInstance, formatBarOptions } from './useBar'
import { generateLineInstance, formatLineOptions } from './useLine'
import { generateCustomInstance, formatCustomValue } from './useCustom'
import { CommonObj, CommonResType } from '../types'

type chartsType = 'pie' | 'bar' | 'line' | 'custom'

export function getCurrentChart(type: chartsType, renderer: HTMLElement) {
  let chartInstance: echarts.ECharts | null = null
  let formatOption
  switch (type) {
    case 'pie':
      chartInstance = generatePieInstance(renderer)
      formatOption = formatPieOptions
      break
    case 'bar':
      chartInstance = generateBarInstance(renderer)
      formatOption = formatBarOptions
      break
    case 'line':
      chartInstance = generateLineInstance(renderer)
      formatOption = formatLineOptions
      break
    case 'custom':
      chartInstance = generateCustomInstance(renderer)
      formatOption = formatCustomValue
      break
    default:
      break
  }
  return {
    chartInstance: chartInstance as echarts.ECharts,
    formatOption,
  }
  //
}

export const dealWithLineData = (res: CommonResType) => {
  let category = ''
  if (res.meta.length > 2) {
    category = res.meta[1].name as string
  }
  let nameCol = ''
  let valueCol = ''
  res.meta.forEach((col: CommonObj, index: number) => {
    if (index === 0) {
      nameCol = col.name as string
    } else {
      valueCol = col.name as string
    }
  })
  if (category === 'read_rows') {
    const firstName = res.meta[1].name
    const secondName = res.meta[2].name
    return [
      res.data.map((item: any) => {
        return {
          category: res.meta[1].name,
          name: item[nameCol],
          value: item[firstName],
        }
      }),
      res.data.map((item: any) => {
        return {
          category: res.meta[2].name,
          name: item[nameCol],
          value: item[secondName],
        }
      }),
    ]
  } else {
    const categoryObj: any = {}
    res.data.forEach((item: any) => {
      categoryObj[item[category]] = 1
    })
    const categoryList = Object.keys(categoryObj)
    return categoryList.map((cate) => {
      return res.data.map((row: any) => {
        return {
          name: row[nameCol],
          category: cate,
          value: cate === row[category] ? row[valueCol] : 0,
        }
      })
    })
  }
}

export const dealCustomBarData = (data: number[]) => {
  const max = Math.max.apply(null, data)
  let xMax = 40
  let step = 2
  let unit = 's'
  const secondUnit = max / 1000
  if (secondUnit > 1) {
    // const maxRemainder = Math.ceil(max) % 2 ? Math.ceil(max) + 3 : Math.ceil(max) + 2
    const secondMax = max / 1000
    const secondMaxEnter1 = Math.ceil(secondMax)
    // const gt40 =  ? secondMaxEnter1 : 40
    xMax =
      secondMaxEnter1 > 40 ? (secondMaxEnter1 % 2 ? secondMaxEnter1 + 3 : secondMaxEnter1 + 2) : 40
    step = 2
    unit = 's'
  } else {
    xMax = 1000
    step = 100
    unit = 'ms'
  }
  const minuteUnit = max / 1000 / 60
  if (minuteUnit > 1) {
    const minuteMaxEnter1 = Math.ceil(minuteUnit)
    const remainder = minuteMaxEnter1 % 5
    xMax = remainder ? minuteMaxEnter1 + (5 - remainder) : minuteMaxEnter1 + 5
    step = 5
    unit = 's'
  }

  const scopeMin = 0
  const scopeMax = xMax
  const interval = step
  let tmin = scopeMin
  const edata = []
  const xAxis = ['0ms']
  while (tmin < scopeMax) {
    const x0 = tmin
    const x1 = tmin + (unit === 's' ? interval * 1000 : interval)
    let hasUnitX = ''
    if (unit === 's') {
      hasUnitX = Math.floor(x1 / 1000) + 's'
    } else if (unit === 'ms') {
      hasUnitX = x1 + 'ms'
    }
    xAxis.push(hasUnitX)
    let samplenum = 0
    for (let i = 0; i < data.length; i++) {
      if (x0 <= data[i] && x1 > data[i]) {
        samplenum++
      }
    }
    tmin += interval
    edata.push([x0, x1, samplenum])
  }

  return {
    data: edata,
    interval: xAxis,
  }
}

export const formatHasUnit = (value: number, unit: string) => {
  if (unit === 'MB') {
    return (value / 1024 / 1024).toFixed(2) + 'MB'
  }
}
