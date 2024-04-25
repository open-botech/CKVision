<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue'
import { TabItem } from '@/store/modules/sql/types'
import { queryPropertiesColumns } from './query'

const tableData = ref<any[]>([])
const columns = ref<any[]>([])

const props = defineProps<{
  tab: TabItem
}>()

onBeforeMount(() => {
  queryData()
})

const queryData = () => {
  queryPropertiesColumns(props.tab.node).then((res) => {
    columns.value = res.meta
    tableData.value = res.data
  })
}
</script>
<template>
  <section ref="containerRef" class="properties-tab-columns">
    <el-table
      :data="tableData"
      style="width: 100%"
      height="100%"
      tooltip-effect="dark"
      :border="true"
    >
      <template v-for="col in columns" :key="col.name">
        <el-table-column
          :show-overflow-tooltip="true"
          :prop="col.name"
          :label="col.name"
          min-width="150"
        />
      </template>
    </el-table>
  </section>
</template>
<style lang="scss" scoped>
.properties-tab-columns {
  width: 100%;
  height: 100%;
}
</style>
