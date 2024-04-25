<script lang="ts" setup>
import { ref } from 'vue'

import PropertiesTabColumnsVue from './PropertiesTabColumns.vue'
import PropertiesTabDDLVue from './PropertiesTabDDL.vue'
import PropertiesTabStatisticsVue from './PropertiesTabStatistics.vue'

import { TabItem } from '@/store/modules/sql/types'

defineProps<{
  tab: TabItem
}>()

const activeName = ref<string>('Columns')
</script>
<template>
  <section class="table-pane-properties">
    <el-tabs
      v-model="activeName"
      type="card"
      class="table-pane-properties-inner-tab"
      :tab-position="'left'"
    >
      <el-tab-pane lazy label="Columns" name="Columns">
        <PropertiesTabColumnsVue :tab="tab" />
      </el-tab-pane>
      <el-tab-pane lazy label="Statistics" name="Statistics">
        <PropertiesTabStatisticsVue :tab="tab" />
      </el-tab-pane>
      <el-tab-pane lazy label="DDL" name="DDL">
        <PropertiesTabDDLVue :tab="tab" />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<style lang="scss" scoped>
.table-pane-properties {
  width: 100%;
  height: 100%;
  .table-pane-properties-inner-tab {
    width: 100%;
    height: 100%;

    :deep(.el-tabs__header.is-left) {
      width: 155px;
      margin-right: 0;
      background-color: #f0f0f0;
    }
    :deep(.el-tabs__content) {
      width: calc(100% - 155px);
      height: 100%;
    }
    & > :deep(.el-tabs__header .el-tabs__nav) {
      width: 155px;
      border: unset;
    }
    &.el-tabs--left.el-tabs--card :deep(.el-tabs__item.is-left) {
      padding: 0 45px;
      background-color: #e1e0dd;
      border-right: unset;
      border-top: unset;
      border-bottom: 1px solid #fff;
    }
    &.el-tabs--left.el-tabs--card :deep(.el-tabs__item.is-left:last-of-type) {
      border-bottom: none;
    }
    &.el-tabs--left.el-tabs--card :deep(.el-tabs__item.is-left.is-active) {
      background-color: #fff;
    }
  }
}
</style>
