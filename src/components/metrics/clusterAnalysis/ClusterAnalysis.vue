<script lang="ts" setup>
import Count from '@/components/metrics/Count.vue'
import Progress from '@/components/metrics/progress/Progress.vue'
import FiltersVue from '../filter/Filters.vue'

import versionImg from '@/assets/images/metrics/version.svg'
import serverUptime from '@/assets/images/metrics/server_uptime.svg'
import databaseNumber from '@/assets/images/metrics/database_number.svg'
import tableNumber from '@/assets/images/metrics/table_number.svg'
import totalRow from '@/assets/images/metrics/data_analysis_total_row.svg'
import totalColumn from '@/assets/images/metrics/data_analysis_total_columns.svg'
import { query } from '@/utils/http'
import sqls, { SqlParams } from '../dataAnalysis/sqls'
import { ref, watch } from 'vue'
import { getRealSqlOfArr, getUndefined } from '../dataAnalysis/utils'
import TableBanner from '../TableBanner.vue'
import { ChangeValue, DataQueryFunc } from '../types'

const props = defineProps<{
  activeName: string
}>()

const show = ref<boolean>(false)

const queryFunc = (sql: string) => {
  return query(sql)
}

const databaseReal = ref<string | undefined>(undefined)
const tableReal = ref<string | undefined>(undefined)

const selectChangeData = (data: ChangeValue) => {
  const { database, table } = data
  if (database) {
    databaseReal.value = getRealSqlOfArr(getUndefined(database))
  }
  if (table) {
    tableReal.value = getRealSqlOfArr(getUndefined(table))
  }
}

// Since the el-collapse component does not have lazy loading, all components will load as soon as they enter, even if they are not expanded, other components have no problem
// But echarts, since the component has already been rendered, it will get the dom width and height to render the canvas, but at this time because it is not expanded, its parent element has no width and height, rendering will have problems

// In addition, since all the requests in this component have not been sent when you enter the page, it reduces the number of interface requests on the homepage, which is equivalent to indirectly implementing lazyload
watch(
  () => props.activeName,
  () => {
    if (props.activeName === '2') {
      setTimeout(() => {
        show.value = true
      }, 100)
    }
  },
)

const queryFunction = (sqlFuncName: string, params: SqlParams) => {
  return queryFunc(
    sqls[sqlFuncName as 'queryPerformanceQueryAnalysis'](params),
  ) as unknown as DataQueryFunc
}
</script>
<template>
  <el-collapse-item :title="$t('Cluster Analysis')" name="2">
    <FiltersVue @change="selectChangeData"></FiltersVue>
    <template v-if="show">
      <el-row :gutter="10">
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="versionImg"
            :outer-title="'Version'"
            :number-style="{ 'font-size': '24px' }"
            sql-func-name="queryVersion"
          ></Count>
        </el-col>
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="serverUptime"
            :number-style="{ 'font-size': '24px' }"
            :outer-title="'Server uptime'"
            sql-func-name="queryServerUptime"
            show-type="duration"
          ></Count>
        </el-col>
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="databaseNumber"
            :number-style="{ 'font-size': '24px' }"
            :outer-title="'Number of databases'"
            :database="databaseReal"
            sql-func-name="queryDatabaseNumber"
            show-type="toLocaleString"
          ></Count>
        </el-col>
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="tableNumber"
            :number-style="{ 'font-size': '24px' }"
            :outer-title="'Number of tables'"
            :database="databaseReal"
            sql-func-name="queryTableNumber"
            show-type="toLocaleString"
          ></Count>
        </el-col>
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="totalRow"
            :number-style="{ 'font-size': '24px' }"
            :outer-title="'Number of rows'"
            :database="databaseReal"
            :table="tableReal"
            sql-func-name="queryRowNumber"
            show-type="toLocaleString"
          ></Count>
        </el-col>
        <el-col :span="4">
          <Count
            :query-func="queryFunction"
            :banner="totalColumn"
            :number-style="{ 'font-size': '24px' }"
            :outer-title="'Number of columns'"
            :database="databaseReal"
            sql-func-name="queryColumnNumber"
            show-type="toLocaleString"
          ></Count>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <TableBanner
            title="Cluster Overview"
            :height="470"
            sql-func-name="queryClusterOverview"
            :query-func="queryFunction"
          ></TableBanner>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <Progress
            title="Merge progress per table"
            :height="310"
            back-type="yellow"
            :database="databaseReal"
            sql-func-name="queryMergeProgressPerTable"
            :query-func="queryFunction"
          ></Progress>
        </el-col>
        <el-col :span="16">
          <TableBanner
            title="Current Merges"
            :height="310"
            sql-func-name="queryCurrentMerges"
            :database="databaseReal"
            :query-func="queryFunction"
          ></TableBanner>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <Progress
            title="Muations parts remaining"
            :height="310"
            back-type="yellow"
            sql-func-name="queryMutattionsPartsRemaining"
            :query-func="queryFunction"
          ></Progress>
        </el-col>
        <el-col :span="16">
          <TableBanner
            title="Current Mutations"
            :height="310"
            sql-func-name="queryCurrentMutations"
            :database="databaseReal"
            :query-func="queryFunction"
          ></TableBanner>
        </el-col>
      </el-row>
      <el-row :gutter="10" style="margin-bottom: 0">
        <el-col :span="8">
          <Progress
            title="Replicated tables by delay"
            :height="310"
            back-type="yellow"
            sql-func-name="queryReplicatedTablesByDelay"
            :database="databaseReal"
            :query-func="queryFunction"
          ></Progress>
        </el-col>
        <el-col :span="16">
          <TableBanner
            title="Replicated tables by delay"
            :height="310"
            sql-func-name="queryReplicatedTablesByDelay"
            :database="databaseReal"
            :query-func="queryFunction"
          ></TableBanner>
        </el-col>
      </el-row>
    </template>
  </el-collapse-item>
</template>
<style lang="scss" scoped></style>
