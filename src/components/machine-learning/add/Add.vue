<script lang="ts" setup>
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts/core'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

import sqls from '@/components/metrics/dataAnalysis/sqls'
import { query } from '@/utils/http'
import { formatBarOptions, generateBarInstance } from '@/components/metrics/charts/useBar'
import { addTraining as addTrainingQuery } from '../query'
import { useLoginStore } from '@/store'
import { timeIntervalOps } from '../data'
import i18n from '@/i18n'

type List = { name: string }[]

const emit = defineEmits(['toResult', 'toList'])
const loginStore = useLoginStore()

const t = i18n.global.t
const renderer = ref<HTMLElement>()
const ruleFormRef = ref<FormInstance>()
const database = ref<List>([])
const tables = ref<List>([])
const timeField = ref<List>([])
const step = ref<number>(1)
const timeIntervalUnit = ref<string>('day')
const timeInterval = ref<string>('1')
const formLabelAlign = reactive<{
  database: string
  table: string
  timeField: string
  timeRange: any
  jobName: string
  timeInterval: string
}>({
  database: '',
  table: '',
  timeField: '',
  timeRange: '',
  jobName: '',
  timeInterval: '1 day',
})

const validateTimeRange = (rule: any, value: any, callback: any) => {
  const isCorrect = isCorrectTime(value)
  if (!isCorrect) {
    callback(new Error(t('Start date cannot be later than end date')))
  } else {
    callback()
  }
}

const validateTimeInterval = (rule: any, value: any, callback: any) => {
  const timeInterval = value.replace(` ${timeIntervalUnit.value}`, '')
  if (!timeInterval) {
    return callback(new Error(t('please input time interval')))
  }
  if (!/^[0-9]*$/.test(timeInterval)) {
    callback(new Error(t('please use number')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  database: [{ required: true, message: t('Please select database'), trigger: 'change' }],
  table: [
    {
      required: true,
      message: t('Please select table'),
      trigger: 'change',
    },
  ],
  timeRange: [
    {
      required: true,
      validator: validateTimeRange,
      trigger: 'change',
    },
  ],
  timeField: [
    {
      required: true,
      message: t('Please select time field'),
      trigger: 'change',
    },
  ],
  jobName: [
    {
      required: true,
      message: t('Please input job name'),
      trigger: 'blur',
    },
  ],
  timeInterval: [
    {
      required: true,
      validator: validateTimeInterval,
      trigger: 'change',
    },
  ],
})

watch(step, (newVal) => {
  if (newVal === 2) {
    queryDataForMlSecondStep()
  }
})

let chartInstance: echarts.ECharts

onBeforeMount(() => {
  queryDatabases()
  formLabelAlign.timeRange = [
    dayjs().subtract(7, 'day').startOf('day').toDate(),
    dayjs().endOf('day').toDate(),
  ]
})

onMounted(() => {
  if (renderer.value) {
    chartInstance = generateBarInstance(renderer.value)
    chartInstance.setOption(formatBarOptions())
  }
})

const addTraining = (queryData: any) => {
  const { connectionUrl, username, password } = loginStore.connection
  return addTrainingQuery({
    connectionUrl,
    username,
    password,
    ...queryData,
  })
}

const nextStep = async () => {
  await ruleFormRef.value?.validate((valid, fields) => {
    if (!valid) {
      console.log('error submit!', fields)
    }
  })
  const {
    database,
    table,
    timeField,
    timeRange,
    jobName,
    timeInterval: formTimeInterval,
  } = formLabelAlign

  const queryData = {
    database,
    table,
    time_filed: timeField,
    start_time: dayjs(timeRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    end_time: dayjs(timeRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    job_name: jobName,
    time_interval: formTimeInterval,
  }

  const addReturnData = await addTraining(queryData)
  emit('toResult', addReturnData)
}

const queryDatabases = () => {
  query(sqls.queryAllDatabases()).then((res) => {
    database.value = res.data
  })
}
const queryTables = () => {
  query(sqls.queryTablesByDatabase(formLabelAlign.database)).then((res) => {
    tables.value = res.data
  })
}

const queryTimeField = () => {
  query(sqls.queryTypeIsDate(formLabelAlign.database, formLabelAlign.table)).then((res) => {
    timeField.value = res.data
  })
}

const queryDataForMlSecondStep = () => {
  const isCorrect = isCorrectTime(formLabelAlign.timeRange as any)
  if (!formLabelAlign.timeField || !isCorrect || !timeInterval.value) {
    return
  }
  query(
    sqls.queryDataForMlSecondStep(
      formLabelAlign.database,
      formLabelAlign.table,
      dayjs(formLabelAlign.timeRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      dayjs(formLabelAlign.timeRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      formLabelAlign.timeField,
      formLabelAlign.timeInterval,
    ),
  ).then((res) => {
    const xKey = res.meta[0].name
    const dataKey = res.meta[1].name
    const data = res.data.map((item: any) => {
      return {
        name: item[xKey],
        value: item[dataKey],
      }
    })
    const options = formatBarOptions(data)
    const echartsInstance = echarts.init(renderer.value as HTMLElement)
    echartsInstance.setOption(options)
  })
}

const changeDatabase = () => {
  formLabelAlign.table = ''
  formLabelAlign.timeField = ''
  queryTables()
}

const changeTable = () => {
  formLabelAlign.timeField = ''
  queryTimeField()
}

const changeField = () => {
  queryDataForMlSecondStep()
}

const isCorrectTime = (times: Date[]) => {
  const [startTimeDate, endTimeDate] = times
  const startTime = +startTimeDate
  const endTime = +endTimeDate
  return startTime < endTime
}

const changeTimeRange = () => {
  queryDataForMlSecondStep()
}

const chnageInterval = (val: string) => {
  formLabelAlign.timeInterval = val + ' ' + timeIntervalUnit.value
  queryDataForMlSecondStep()
}

const changeIntervalUnit = (val: string) => {
  formLabelAlign.timeInterval = timeInterval.value + ' ' + val
  queryDataForMlSecondStep()
}

const toList = () => {
  emit('toList')
}
</script>
<template>
  <section class="ml-add-container">
    <h3 class="title">
      <el-icon style="margin-right: 10px" @click="toList">
        <ArrowLeft />
      </el-icon>
      {{ $t('Add') }}
    </h3>
    <el-form
      ref="ruleFormRef"
      label-position="right"
      label-width="110px"
      :rules="rules"
      :model="formLabelAlign"
      class="ml-add-form"
      style="width: 700px"
      status-icon
    >
      <el-form-item :label="$t('Job Name')" prop="jobName">
        <el-input v-model="formLabelAlign.jobName" placeholder="Please input" />
      </el-form-item>

      <el-form-item :label="$t('Database')" prop="database">
        <el-select
          v-model="formLabelAlign.database"
          popper-class="primary-select-dropdown"
          placeholder="Select Database"
          @change="changeDatabase"
        >
          <el-option
            v-for="item in database"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Tables')" prop="table">
        <el-select
          v-model="formLabelAlign.table"
          popper-class="primary-select-dropdown"
          placeholder="Select Table"
          filterable
          style="width: 600px"
          @change="changeTable"
        >
          <el-option
            v-for="item in tables"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('Time  Field')" prop="timeField">
        <el-select
          v-model="formLabelAlign.timeField"
          popper-class="primary-select-dropdown"
          placeholder="Select Time Field"
          filterable
          style="width: 600px"
          @change="changeField"
        >
          <el-option
            v-for="item in timeField"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Time  Range')" prop="timeRange">
        <el-date-picker
          v-model="formLabelAlign.timeRange[0]"
          type="date"
          :clearable="false"
          placeholder="Pick a day"
          size="default"
          @change="changeTimeRange"
        />
        <span class="time-range-divider">--</span>
        <el-date-picker
          v-model="formLabelAlign.timeRange[1]"
          type="date"
          :clearable="false"
          placeholder="Pick a day"
          size="default"
          @change="changeTimeRange"
        />
      </el-form-item>
      <el-form-item :label="$t('Time  Interval')" prop="timeInterval">
        <el-input
          v-model="timeInterval"
          placeholder="Please input"
          class="input-with-select-with-gap width100"
          @input="chnageInterval"
        >
          <template #append>
            <el-select
              v-model="timeIntervalUnit"
              placeholder="Select"
              style="width: 100px"
              @change="changeIntervalUnit"
            >
              <el-option
                v-for="item in timeIntervalOps"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <section ref="renderer" class="charts-renderer-box"></section>

    <section class="btn">
      <!-- <el-button
        class="custom-default-btn"
        @click="previousStep"
      >
        Previous
      </el-button> -->
      <el-button class="custom-primary-btn" type="primary" @click="nextStep">
        {{ 'End' }}
      </el-button>
    </section>
  </section>
</template>
<style lang="scss" scoped>
.ml-add-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 0 30px 30px 30px;
  background-color: #fff;
  box-sizing: border-box;

  .btn {
    position: absolute;
    bottom: 30px;
    width: 100%;
    text-align: center;
  }

  .title {
    display: flex;
    align-items: center;
    height: 60px;
    font-size: 20px;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.85);
    line-height: 60px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  .ml-add-form {
    width: 750px;
    padding-top: 60px;
    margin: auto;
  }

  .charts-renderer-box {
    width: 100%;
    height: 450px;
    margin-bottom: 100px;
  }
  .time-range-divider {
    display: inline-block;
    margin: 0 10px;
    color: #c9c9c9;
  }

  .width100 > :deep(.el-input__wrapper) {
    max-width: 82px;
  }
}
</style>
