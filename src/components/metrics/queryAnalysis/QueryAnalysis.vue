<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'

import Count from '@/components/metrics/Count.vue'
import ChartsVue from '../charts/Charts.vue'
import FiltersVue from '../filter/Filters.vue'
import TableBannerVue from '../TableBanner.vue'
import ChartsVarCustom from '../charts/ChartsBarCustom.vue'

import { query } from '@/utils/http'
import sqls, { SqlParams } from '../dataAnalysis/sqls'
import { getRealSqlOfArr, getStartAndEndTime, getUndefined } from '../dataAnalysis/utils'

import totalImg from '@/assets/images/metrics/total_query_analysis.svg'
import aveMemory from '@/assets/images/metrics/ave_memory.svg'
import aveTime from '@/assets/images/metrics/ave_time.svg'
import { ChangeValue } from '../types'

const props = defineProps<{
  activeName: string
}>()

const show = ref<boolean>(false)

const queryFunc = (sql: string) => {
  return query(sql)
}

const queryKindReal = ref<string | undefined>(undefined)
const typeReal = ref<string | undefined>(undefined)
const userReal = ref<string | undefined>(undefined)
const timeDuration = ref<string>('1 MINUTE')
const timeReal = ref<string | number>(dayjs.duration(24, 'hours').asMilliseconds())

const selectChangeData = (data: ChangeValue) => {
  const { queryKind, type, time, user, option } = data
  if (queryKind) {
    queryKindReal.value = getRealSqlOfArr(getUndefined(queryKind))
  }
  if (type) {
    typeReal.value = getRealSqlOfArr(getUndefined(type))
  }
  if (user) {
    userReal.value = getRealSqlOfArr(getUndefined(user))
  }
  if (time) {
    timeReal.value = time
    timeDuration.value = option?.duration || '1 MINUTE'
  }
}

const timeRange = computed(() => {
  return getStartAndEndTime(timeReal.value)
})

// 由于 el-collapse 组件没有懒加载，导致所有组件即便是没有展开都会一进来就会加载，其他的组件还没有问题
// 但是 echarts 由于组件已经渲染，他会获取 dom 宽高来进行 canvas 的渲染
// 但此时由于没有展开，导致其父元素没有宽高，渲染就会有问题

// 另外由于一进页面该组件中的所有的请求并未发送，减少了首页的接口请求数量，相当于变相实现了 lazyload
watch(
  () => props.activeName,
  () => {
    if (props.activeName === '3') {
      setTimeout(() => {
        show.value = true
      }, 100)
    }
  },
)

const queryFunction = (sqlFuncName: string, params: SqlParams) => {
  return queryFunc(sqls[sqlFuncName as 'queryPerformanceQueryAnalysis'](params))
}
</script>
<template>
  <el-collapse-item :title="$t('Query Analysis')" name="3">
    <FiltersVue
      :select-type="['type', 'queryKind', 'user']"
      @change="selectChangeData"
    ></FiltersVue>
    <template v-if="show">
      <el-row :gutter="10">
        <el-col :span="8">
          <Count
            :query-func="queryFunction"
            :banner="totalImg"
            :outer-title="'Total queries'"
            :time-range="timeRange"
            :type="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            sql-func-name="queryTotalQueryAnalysis"
            show-type="toLocaleString"
          ></Count>
        </el-col>
        <el-col :span="8">
          <Count
            :query-func="queryFunction"
            :banner="aveMemory"
            :outer-title="'Avg query memory'"
            sql-func-name="queryAveMemoryQueryAnalysis"
            :time-range="timeRange"
            :type="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :time-duration="timeDuration"
            unit="MB"
            show-type="MB"
          ></Count>
        </el-col>
        <el-col :span="8">
          <Count
            :query-func="queryFunction"
            :banner="aveTime"
            :outer-title="'Avg query time'"
            sql-func-name="queryAveTimeQueryAnalysis"
            :time-range="timeRange"
            :type="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :time-duration="timeDuration"
            unit="ms"
          ></Count>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <ChartsVarCustom
            index="3"
            title="Query time distribution"
            sql-func-name="queryTimeDistributionQueryAnalysis"
            :time-range="timeRange"
            :sqltype="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :query-func="queryFunction"
            type="bar"
            :height="310"
          ></ChartsVarCustom>
        </el-col>
        <el-col :span="12">
          <ChartsVue
            index="4"
            title="Top users"
            sql-func-name="queryTopUsersQueryAnalysis"
            :sqltype="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :query-func="queryFunction"
            type="pie"
            :height="310"
          ></ChartsVue>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <ChartsVue
            index="5"
            title="Top query types over time"
            sql-func-name="queryTopOverTimeQueryAnalysis"
            :sqltype="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :time-range="timeRange"
            :time-duration="timeDuration"
            :query-func="queryFunction"
            :legend="{ left: 'top' }"
            :grid="{ height: '65%' }"
            type="line"
            :height="470"
          ></ChartsVue>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <ChartsVue
            index="6"
            title="Query performance by type over time"
            sql-func-name="queryPerformanceQueryAnalysis"
            :sqltype="typeReal"
            :user="userReal"
            :query-kind="queryKindReal"
            :time-range="timeRange"
            :time-duration="timeDuration"
            :query-func="queryFunction"
            :grid="{ height: '55%' }"
            :legend="{ left: 'top' }"
            type="line"
            :height="790"
          ></ChartsVue>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <ChartsVue
            index="7"
            title="Query requests by user"
            sql-func-name="queryRequestsQueryAnalysis"
            :sqltype="typeReal"
            :query-kind="queryKindReal"
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
          <ChartsVue
            index="8"
            title="Memory usage over time"
            sql-func-name="queryMemoryUsageQueryAnalysis"
            :time-range="timeRange"
            :time-duration="timeDuration"
            :query-func="queryFunction"
            type="line"
            :height="310"
            y-axis-axis-label-unit="MB"
          ></ChartsVue>
        </el-col>
        <el-col :span="12">
          <ChartsVue
            index="9"
            title="Read vs Write Rows"
            sql-func-name="queryReadWriteQueryAnalysis"
            :time-range="timeRange"
            :query-func="queryFunction"
            type="line"
            :height="310"
          ></ChartsVue>
        </el-col>
      </el-row>
      <el-row :gutter="10" style="margin-bottom: 0">
        <el-col :span="24">
          <!-- <VirtualizedTableVue
            title="Query overview"
            sql-func-name="queryOverviewQueryAnalysis"
            :query-func="queryFunction"
            :time-range="timeRange"
            :time-duration="timeDuration"
            :height="470"
          ></VirtualizedTableVue> -->
          <TableBannerVue
            title="Query overview"
            sql-func-name="queryOverviewQueryAnalysis"
            :query-func="queryFunction"
            :time-range="timeRange"
            :time-duration="timeDuration"
            :height="470"
          ></TableBannerVue>
        </el-col>
      </el-row>
    </template>
  </el-collapse-item>
</template>
<style lang="scss" scoped></style>
