<script lang="ts" setup>
import { TabItem } from '@/store/modules/sql/types'
import { ref, watch } from 'vue'

import TablePaneData from './TablePaneData.vue'
import TablePaneProperties from './TablePaneProperties.vue'
import TablePaneLIneage from './TablePaneLIneage.vue'

defineProps<{
  tab: TabItem
}>()

const activeName = ref<string>('Data')

const isFirstRender = ref<boolean>(true)

watch(
  () => activeName.value,
  () => {
    if (activeName.value === 'LIneage') {
      isFirstRender.value = false
    }
  },
)
</script>
<template>
  <section class="table-tab-pane-tainer">
    <el-tabs v-model="activeName" type="card" class="table-pane-inner-tab">
      <el-tab-pane label="Properties" name="Properties">
        <TablePaneProperties :tab="tab" />
      </el-tab-pane>
      <el-tab-pane label="Data" name="Data">
        <TablePaneData :tab="tab" />
      </el-tab-pane>
      <el-tab-pane label="Lineage" name="LIneage">
        <TablePaneLIneage :tab="tab" :is-first-render="isFirstRender" />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<style lang="scss" scoped>
.table-tab-pane-tainer {
  width: 100%;
  height: 100%;
}
.table-pane-inner-tab {
  width: 100%;
  height: 100%;
  & > :deep(.el-tabs__header) {
    margin-bottom: 0;
    background-color: #f0f0f0;
    // border-bottom: 0;
  }
  & > :deep(.el-tabs__header .el-tabs__item.is-active) {
    color: #fff;
    background-color: var(--el-color-primary);
  }
  & > :deep(.el-tabs__header .el-tabs__item) {
    border: unset;
  }
  & > :deep(.el-tabs__header .el-tabs__nav) {
    border-top: none;
  }
  & > :deep(.el-tabs__content) {
    height: calc(100% - 40px);
  }
  & > :deep(.el-tabs__content .el-tab-pane) {
    height: 100%;
  }
}
</style>
