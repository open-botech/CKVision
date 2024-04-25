import * as echarts from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([CustomChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
// const colorList: string[] = ['#5CB9FF', '#4ECBB4', '#FAD337', '#83B3D6'];
export function generateCustomInstance(root: HTMLElement): echarts.ECharts {
  const echartsInstance = echarts.init(root)
  // echartsInstance.setOption(formatCustomValue())
  return echartsInstance
}

export const formatCustomValue = (data: any[] = [], xAxisData: any[] = []) => {
  console.log(data, xAxisData, '9999999999')
  return {
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        return params.data[0] + ' ~ ' + params.data[1]
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
        data: xAxisData,
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
      //   {
      //     name: 'height',
      //     type: 'custom',
      //     renderItem: renderItem,
      //     label: {
      //         normal: {
      //             show: true,
      //             position: 'top'
      //         }
      //     },
      //     encode: {
      //         x: [0, 1],
      //         y: 2,
      //         tooltip: 2,
      //         label: 2
      //     },
      //     // data: data
      //     data: edata
      // },
      {
        name: 'Direct',
        type: 'custom',
        label: {
          normal: {
            show: true,
            position: 'top',
          },
        },
        barWidth: '60%',
        data: data,
        renderItem: renderItem,
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

function renderItem(params: any, api: any) {
  const yValue = api.value(2)
  const start = api.coord([api.value(0), yValue])
  const size = api.size([api.value(1) - api.value(0), yValue])
  const style = api.style()
  return {
    type: 'rect',
    shape: {
      x: start[0] + 1,
      y: start[1],
      width: size[0] - 2,
      height: size[1],
    },
    style: style,
  }
}
