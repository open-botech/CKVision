<script lang="ts" setup>
import { ref } from 'vue'

import DataAnalysisVue from '@/components/metrics/dataAnalysis/DataAnalysis.vue'
import ClusterAnalysisVue from '@/components/metrics/clusterAnalysis/ClusterAnalysis.vue'
import QueryAnalysisVue from '@/components/metrics/queryAnalysis/QueryAnalysis.vue'

const activeName = ref('1')
</script>
<template>
  <div class="metrics">
    <el-collapse v-model="activeName" accordion>
      <DataAnalysisVue :active-name="activeName"></DataAnalysisVue>
      <QueryAnalysisVue :active-name="activeName"></QueryAnalysisVue>
      <ClusterAnalysisVue :active-name="activeName"></ClusterAnalysisVue>
    </el-collapse>
  </div>
</template>
<style lang="scss" scoped>
.metrics {
  padding: 20px 30px;
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
  overflow-y: auto;

  .el-collapse {
    border: unset;
  }
  & :deep(.el-row) {
    margin-bottom: 10px;
  }

  & :deep(.el-collapse-item) {
    margin-bottom: 10px;
  }

  & :deep(.el-collapse-item__header) {
    padding-left: 10px;
    border-bottom: unset;
  }

  & :deep(.el-collapse-item__wrap) {
    margin-top: 10px;
    background-color: unset;
    border-bottom: 0;
  }
  & :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
}
</style>
