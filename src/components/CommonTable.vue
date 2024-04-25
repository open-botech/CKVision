<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { CommonObj } from './metrics/types'

const props = defineProps<{
  queryFunc: (limit: number, offset: number) => Promise<any>
  showIndex?: boolean
  showSelection?: boolean
}>()
console.log('showSelection')
const showSelection = computed(() => props.showSelection !== false)
const emit = defineEmits(['selectionChange', 'firstGetData'])

const columns = ref<{ name: string }[]>([])
const tableData = ref<CommonObj[]>([])
const loading = ref<boolean>(true)

const getData = (limit = 100, offset = 0) => {
  loading.value = true
  return props
    .queryFunc(limit, offset)
    .then((res) => {
      columns.value = res.meta.map((item: { name: string }) => {
        return {
          name: item.name,
        }
      })
      tableData.value = res.data
      return res
    })
    .finally(() => {
      loading.value = false
    })
}

onBeforeMount(() => {
  getData().then((res: any) => {
    emit('firstGetData', res.rows_before_limit_at_least)
  })
})

const handleSelectionChange = (val: any[]) => {
  emit('selectionChange', val)
}

const refresh = (limit = 100, offset = 0) => {
  getData(limit, offset)
}

defineExpose({
  refresh,
  getData,
})
</script>
<template>
  <section v-loading="loading" class="common-table-container">
    <el-table
      v-if="!loading"
      :data="tableData"
      style="width: 100%"
      height="100%"
      tooltip-effect="dark"
      :border="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="showSelection" fixed="left" type="selection" width="55" />
      <el-table-column v-if="showIndex" type="index" width="50" />
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
.common-table-container {
  width: 100%;
  height: 100%;
}
</style>
