import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { CommonMeta, CommonObj } from '../types'
import { formatHasUnit } from './utils'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
// const colorList: string[] = ['#5CB9FF', '#4ECBB4', '#FAD337', '#83B3D6'];
export function generateLineInstance(root: HTMLElement): echarts.ECharts {
  const echartsInstance = echarts.init(root)
  echartsInstance.setOption(formatLineOptions())
  return echartsInstance
}

export function formatLineOptions(
  data?: CommonMeta[],
  grid?: CommonObj,
  legend?: CommonObj,
  unit?: string,
): echarts.EChartsCoreOption {
  let nameList = []
  let dataList = []
  const isMulLine = Array.isArray(data && data[0])
  if (isMulLine && data) {
    nameList = data[0].map((item: CommonObj) => item.name)
    dataList = data.map((da: CommonMeta) => {
      return {
        name: da[0].category,
        type: 'line',
        data: da.map((item) => item.value),
      }
    })
  } else if (data?.length) {
    dataList = data?.map((item: CommonObj) => item.value)
    nameList = data?.map((item: CommonObj) => item.name)
  } else {
    dataList = []
    nameList = []
  }
  return {
    grid: {
      ...{
        right: 40,
        bottom: 40,
        left: 100,
        height: '70%',
      },
      ...(grid || {}),
    },
    ...(isMulLine && {
      legend: {
        ...{
          left: 'center',
          itemHeight: 12,
          itemWidth: 12,
          icon: 'rect',
          // formatter: (name: string) => {
          //   return (name.length > 4 ? (name.slice(0,4) + '...') : name );
          // }
        },
        ...(legend || {}),
      },
    }),
    tooltip: {
      trigger: 'axis',
      formatter: function (params: CommonObj[]) {
        const pa = params[0]
        let hasUnitVal = pa.value
        if (unit) {
          hasUnitVal = formatHasUnit(pa.value, unit) + 'MB'
        }
        return pa.name + ' ' + hasUnitVal
      },
    },
    xAxis: {
      type: 'category',
      data: nameList,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter(value: number) {
          if (!unit) {
            return value
          }
          return formatHasUnit(value, unit)
        },
      },
    },
    series: !isMulLine
      ? [
          {
            data: dataList,
            type: 'line',
          },
        ]
      : [...dataList],
  }
}
