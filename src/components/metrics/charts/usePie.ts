import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { CommonData } from '../types'

echarts.use([PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
const colorList: string[] = ['#5CB9FF', '#4ECBB4', '#FAD337', '#83B3D6']
export function generatePieInstance(root: HTMLElement): echarts.ECharts {
  const echartsInstance = echarts.init(root)
  echartsInstance.setOption(formatPieOptions())
  return echartsInstance
}

export function formatPieOptions(data?: CommonData): echarts.EChartsCoreOption {
  return {
    color: colorList,
    tooltip: {
      trigger: 'item',
    },
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    legend: {
      orient: 'vertical',
      top: 'center',
      right: '20%',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
          width: 100,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data || [],
      },
    ],
  }
}
