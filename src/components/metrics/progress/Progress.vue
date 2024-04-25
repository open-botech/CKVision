<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'

import Card from '../Card.vue'
import { CommonObj, DataQueryFunc } from '../types'
import Item from './Item.vue'
import EmptyVue from '../Empty.vue'

import { countDataItem } from './types'

const props = defineProps<{
  title: string
  height?: number
  queryFunc: DataQueryFunc
  backType?: 'green' | 'yellow'
  sqlFuncName: string
  database?: string
  table?: string
  timeRange?: string[]
  type?: string
  user?: string
  queryKind?: string
  timeDuration?: string
}>()

const countList = ref<countDataItem[]>([])
const maxValue = ref<number>(0)

const getData = () => {
  const { database, table, type, user, queryKind, timeDuration, timeRange = [] } = props
  props
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
      countList.value = res.data.map((item: CommonObj) => {
        const { total_rows, total_columns, max_parts_per_partition, name, dbTable } = item
        return {
          name: name || dbTable,
          value: total_rows || total_columns || max_parts_per_partition,
        }
      })
      const valueArr = countList.value.map((item) => item.value)
      maxValue.value = Math.max(...(valueArr as number[]))
    })
}

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
  <Card :title="title" :height="height || 390">
    <section class="progress-content">
      <template v-if="countList.length">
        <Item
          v-for="row in countList"
          :key="row.name"
          :max-value="maxValue"
          :item="row"
          :back-type="backType"
        ></Item>
      </template>
      <EmptyVue v-else />
    </section>
  </Card>
</template>
<style lang="scss" scoped>
.card-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.progress-content {
  width: 100%;
  height: 100%;
  padding: 30px 20px;
  box-sizing: border-box;
}
</style>
