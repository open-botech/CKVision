<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'
import { number2Other, round2 } from './dataAnalysis/utils'
import { DataQueryFunc } from './types'

const props = defineProps<{
  queryFunc: DataQueryFunc
  numberStyle?: { 'font-size': string }
  banner: string
  outerTitle?: string
  sqlFuncName: string
  database?: string
  table?: string
  timeRange?: string[]
  showType?: 'toLocaleString' | 'duration' | 'MB'
  type?: string
  user?: string
  queryKind?: string
  timeDuration?: string
  unit?: string
}>()

const showData = ref(0)
const title = ref('Version')

const getData = () => {
  const { database, table, type, user, queryKind, timeDuration, timeRange = [] } = props
  return props
    .queryFunc(props.sqlFuncName, {
      database,
      table,
      type,
      initial_user: user,
      query_kind: queryKind,
      startTime: timeRange[0],
      endTime: timeRange[1],
      timeDuration,
    })
    .then((res) => {
      const key = res.meta[0].name as string
      const isUInt64 = res.meta[0].type.includes('UInt64')
      if (isUInt64) {
        showData.value = +(res.data[0] as any)[key]
      } else {
        showData.value = (res.data[0] as any)[key]
      }
    })
}

const showTitle = computed(() => {
  return props.outerTitle ? props.outerTitle : title.value
})

const showDataReal = computed(() => {
  return `${number2Other(round2(showData.value), props.showType)} ${props.unit || ''}`
})

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

onBeforeMount(() => {
  getData()
})
</script>
<template>
  <section class="count-container">
    <p class="show-data" :style="numberStyle">
      {{ showDataReal }}
    </p>
    <p class="title">
      {{ showTitle }}
    </p>
    <img class="banner" :src="banner" :alt="showTitle" :title="showTitle" />
  </section>
</template>
<style lang="scss" scoped>
.count-container {
  position: relative;
  width: 100%;
  height: 150px;
  padding: 37px 0 37px 30px;
  background-color: #fff;
  box-sizing: border-box;

  p {
    text-align: left;
    width: calc(100% - 100px);
  }
}
.show-data {
  margin-bottom: 20px;
  font-size: 32px;
  font-family: 'dinBold';
  line-height: 32px;
  color: var(--el-color-primary);
}
.title {
  font-size: 16px;
  color: #333333;
  line-height: 16px;
}
.banner {
  position: absolute;
  top: calc(50% - 25px);
  right: 40px;
  display: block;
  width: 50px;
}
</style>
