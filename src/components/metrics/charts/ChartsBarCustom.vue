<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

import Card from '../Card.vue'
import { dealWithLineData, getCurrentChart, dealCustomBarData } from './utils'
import { CommonData, CommonObj, DataQueryFunc } from '../types'

const props = defineProps<{
  title: string
  height?: number
  queryFunc: DataQueryFunc
  type: 'pie' | 'bar' | 'line'
  grid?: CommonObj
  legend?: CommonObj
  index?: string
  sqlFuncName: string
  database?: string
  table?: string
  timeRange?: string[]
  user?: string
  sqltype?: string
  queryKind?: string
  timeDuration?: string
}>()

// Vue3 下 echarts 的 tooltip 不显示
// 原因 Vue3 中使用了 Proxy 对象代理，但 echarts 中使用了大量的 ‘===’ 造成对比失败
// 处理办法1：对Proxy对象进行拆箱。见 https://blog.csdn.net/xy109/article/details/113869790
// 处理办法2：如下，不使用响应式 ，直接赋值，由于没有使用响应式，‘===’ 成立，tooltip成功显示
let chartInstanceOuter: echarts.ECharts | null = null
const formatOptionouter =
  ref<(data: CommonData, grid?: CommonObj, legend?: CommonObj) => echarts.EChartsOption>()

watch(
  [
    () => props.database,
    () => props.table,
    () => props.timeRange,
    () => props.type,
    () => props.user,
    () => props.queryKind,
    () => props.timeDuration,
  ],
  () => {
    getData()
  },
)

onMounted(() => {
  //需要获取到element,所以是onMounted的Hook
  const { chartInstance, formatOption } = getCurrentChart(
    'custom',
    document.querySelector(`.chart-render-container-${props.index}`) as HTMLElement,
  )
  chartInstanceOuter = chartInstance as unknown as echarts.ECharts
  formatOptionouter.value = formatOption as any
  getData()
})

const getData = () => {
  const { database, table, sqltype, user, queryKind, timeDuration, timeRange = [] } = props
  props
    .queryFunc(props.sqlFuncName, {
      database,
      table,
      type: sqltype,
      initial_user: user,
      query_kind: queryKind,
      startTime: timeRange[0],
      endTime: timeRange[1],
      timeDuration,
    })
    .then((res) => {
      const { data, interval } = dealCustomBarData(res.data.map((item: any) => +item['Query time']))
      if (!data || !data.length) {
        chartInstanceOuter?.dispose()
      } else {
        if (formatOptionouter.value) {
          chartInstanceOuter?.dispose()
          // if (chartInstanceOuter) {
          const { chartInstance } = getCurrentChart(
            'custom',
            document.querySelector(`.chart-render-container-${props.index}`) as HTMLElement,
          )
          chartInstanceOuter = chartInstance as unknown as echarts.ECharts
          const options = formatOptionouter.value(data, interval)
          chartInstance.setOption(options)
        }

        // }
      }
    })
}
</script>
<template>
  <Card :title="title" :height="height || 310">
    <section class="chart-content">
      <div :class="`chart-render-container-${index}`"></div>
    </section>
  </Card>
</template>
<style lang="scss" scoped>
.chart-content {
  width: 100%;
  height: 100%;
  padding: 30px;
  box-sizing: border-box;

  & > div {
    width: 100%;
    height: 100%;
  }
}
</style>
