import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])
export interface dataItem {
  name: string
  value: number
}

export function generateBarInstance(root: HTMLElement): echarts.ECharts {
  const echartsInstance = echarts.init(root)
  echartsInstance.setOption(formatBarOptions())
  return echartsInstance
}

export function formatBarOptions(data?: dataItem[]): echarts.EChartsCoreOption {
  const category: string[] = []
  const value: number[] = []
  if (data) {
    data.forEach((item: dataItem) => {
      category.push(item.name)
      value.push(item.value)
    })
  }
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
        data: category,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FFB300' },
            { offset: 1, color: '#FFD778' },
          ]),
        },
      },
    ],
  }
}
