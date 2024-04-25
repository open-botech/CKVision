<script lang="ts" setup>
import Count from '@/components/metrics/Count.vue'
import Progress from '@/components/metrics/progress/Progress.vue'
import ChartsVue from '../charts/Charts.vue'
import FiltersVue from '../filter/Filters.vue'

import versionImg from '@/assets/images/metrics/version.svg'
import serverUptime from '@/assets/images/metrics/server_uptime.svg'
import totalRow from '@/assets/images/metrics/data_analysis_total_row.svg'
import totalColumns from '@/assets/images/metrics/data_analysis_total_columns.svg'
import { query } from '@/utils/http'
import sqls, { SqlParams } from './sqls'
import { computed, ref } from 'vue'
import { getRealSqlOfArr, getStartAndEndTime, getUndefined } from './utils'
import dayjs from 'dayjs'
import TableBanner from '../TableBanner.vue'
import { ChangeValue } from '../types'

const queryFunc = (sql: string) => {
  return query(sql)
}
const databaseReal = ref<string | undefined>(undefined)
const tableReal = ref<string | undefined>(undefined)
const timeReal = ref<string | number>(dayjs.duration(24, 'hours').asMilliseconds())
const timeDuration = ref<string>('1 MINUTE')

const selectChangeData = (data: ChangeValue) => {
  const { database, table, time, option } = data
  if (database) {
    databaseReal.value = getRealSqlOfArr(getUndefined(database))
  }
  if (table) {
    tableReal.value = getRealSqlOfArr(getUndefined(table))
  }
  if (time) {
    timeReal.value = time
    timeDuration.value = option?.duration || '1 MINUTE'
  }
}

const timeRange = computed(() => {
  return getStartAndEndTime(timeReal.value)
})

const queryFunction = (sqlFuncName: string, params: SqlParams) => {
  return queryFunc(sqls[sqlFuncName as 'queryPerformanceQueryAnalysis'](params))
}
</script>
<template>
  <el-collapse-item :title="$t('Data Analysis')" name="1">
    <FiltersVue @change="selectChangeData"></FiltersVue>
    <el-row :gutter="10">
      <el-col :span="6">
        <Count
          :query-func="queryFunction"
          :banner="versionImg"
          :outer-title="'Version'"
          sql-func-name="queryVersion"
        ></Count>
      </el-col>
      <el-col :span="6">
        <Count
          :query-func="queryFunction"
          :banner="serverUptime"
          :outer-title="'Server uptime'"
          sql-func-name="queryServerUptime"
          show-type="duration"
        ></Count>
      </el-col>
      <el-col :span="6">
        <Count
          :query-func="queryFunction"
          :banner="totalRow"
          :outer-title="'Total rows'"
          sql-func-name="queryTotalRows"
          show-type="toLocaleString"
        ></Count>
      </el-col>
      <el-col :span="6">
        <Count
          :query-func="queryFunction"
          :banner="totalColumns"
          :outer-title="'Total columns'"
          :database="databaseReal"
          :table="tableReal"
          sql-func-name="queryTotalColumns"
          show-type="toLocaleString"
        ></Count>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <ChartsVue
          index="3"
          title="Write rows"
          sql-func-name="queryWriteRowDataAnalysis"
          :time-range="timeRange"
          :time-duration="timeDuration"
          :query-func="queryFunction"
          type="line"
          :height="470"
        ></ChartsVue>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <Progress
          title="Top tables by rows"
          :height="390"
          back-type="yellow"
          :database="databaseReal"
          :table="tableReal"
          sql-func-name="queryTopTablesByRows"
          :query-func="queryFunction"
        ></Progress>
      </el-col>
      <el-col :span="12">
        <Progress
          title="Top tables by columns"
          :height="390"
          back-type="green"
          sql-func-name="queryTopTablesByColumns"
          :database="databaseReal"
          :table="tableReal"
          :query-func="queryFunction"
        ></Progress>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <ChartsVue
          index="0"
          title="Database engines"
          sql-func-name="queryDatabaseEngines"
          :database="databaseReal"
          :query-func="queryFunction"
          type="pie"
        ></ChartsVue>
      </el-col>
      <el-col :span="12">
        <ChartsVue
          index="1"
          title="Table engines"
          sql-func-name="queryTableEngines"
          :database="databaseReal"
          :table="tableReal"
          :query-func="queryFunction"
          type="bar"
        ></ChartsVue>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <TableBanner
          title="Database summary"
          :height="390"
          :database="databaseReal"
          :table="tableReal"
          sql-func-name="queryDatabaseSummary"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <TableBanner
          title="Table summary"
          :height="390"
          :database="databaseReal"
          :table="tableReal"
          sql-func-name="queryTableSummary"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <!-- :grid="{ height: '65%' }" -->
        <ChartsVue
          index="2"
          title="Parts over time with row count"
          sql-func-name="queryPartsOverTimeWithRowCount"
          :database="databaseReal"
          :table="tableReal"
          :time-range="timeRange"
          :query-func="queryFunction"
          type="line"
          :height="470"
        ></ChartsVue>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <TableBanner
          title="Disk usage"
          sql-func-name="queryDiskUsage"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
      <el-col :span="12">
        <TableBanner
          title="Dictionaries"
          sql-func-name="queryDictionaries"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <TableBanner
          title="Detached partitions"
          :height="390"
          sql-func-name="queryDetachedPartitions"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
      <el-col :span="12">
        <Progress
          title="Max parts per partition"
          :height="390"
          back-type="yellow"
          sql-func-name="queryMaxPartsPerPartition"
          :query-func="queryFunction"
        ></Progress>
      </el-col>
    </el-row>
    <!-- <el-row :gutter="10">
      
    </el-row> -->
    <el-row :gutter="10" style="margin-bottom: 0">
      <el-col :span="24">
        <TableBanner
          title="Recent part analysis"
          :height="470"
          :database="databaseReal"
          :table="tableReal"
          sql-func-name="queryRecentPartAnalysis"
          :query-func="queryFunction"
        ></TableBanner>
      </el-col>
    </el-row>
  </el-collapse-item>
</template>
<style lang="scss" scoped></style>
