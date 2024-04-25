<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue'
import { TabItem } from '@/store/modules/sql/types'
import { queryPropertiesStatistics } from './query'

const tableData = ref<any[]>([])
const columns = ref<any[]>([])
const loading = ref<boolean>(false)

const props = defineProps<{
  tab: TabItem
}>()

onBeforeMount(() => {
  queryData()
})

const queryData = () => {
  loading.value = true
  queryPropertiesStatistics(props.tab.node)
    .then((res) => {
      columns.value = res.columns
      tableData.value = res.tableData
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
<template>
  <section ref="containerRef" class="properties-tab-statistice">
    <el-table
      v-loading="loading"
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
.properties-tab-statistice {
  width: 100%;
  height: 100%;
}
</style>
