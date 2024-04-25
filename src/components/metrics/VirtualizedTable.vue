<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'

import Card from './Card.vue'
import { CommonObj, DataQueryFunc } from './types'

const props = defineProps<{
  title: string
  height?: number
  queryFunc: DataQueryFunc
  sqlFuncName: string
  database?: string
  table?: string
  timeRange?: string[]
  type?: string
  user?: string
  queryKind?: string
  timeDuration?: string
}>()

const columns = ref<any[]>([])
const tableData = ref<CommonObj[]>([])

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
      columns.value = res.meta.map((item) => {
        return {
          key: item.name,
          dataKey: item.name,
          title: item.name,
        }
      })
      tableData.value = res.data
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
  <Card :title="title" :height="height || 310">
    <section class="table-content">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 :columns="columns" :data="tableData" :width="width" :height="height" fixed />
        </template>
      </el-auto-resizer>
    </section>
  </Card>
</template>
<style lang="scss" scoped>
.card-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.table-content {
  width: 100%;
  height: 100%;
  padding: 30px 20px;
  box-sizing: border-box;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
