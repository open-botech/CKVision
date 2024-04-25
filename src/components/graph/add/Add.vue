<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import UUID from 'uuidjs'

import sqls from '@/components/metrics/dataAnalysis/sqls'
import { query } from '@/utils/http'
import { formatBarOptions, generateBarInstance } from '@/components/metrics/charts/useBar'
import i18n from '@/i18n'
import { addOne, queryColumnByDatabase } from '../query'

type List = { name: string }[]
type Link = {
  source_node: string
  source_link_field: string
  target_node: string
  target_link_field: string
  relationship: string
  source_primary: string
  target_primary: string
}
type Node = { primary: string; table: string; check: boolean; id: string; display_field: string }

const emit = defineEmits(['toResult', 'toList'])

const t = i18n.global.t
const renderer = ref<HTMLElement>()
const ruleFormRef = ref<FormInstance>()
const database = ref<List>([])
const columnsGroupByTable = ref<{ [key: string]: any[] }>({})
const formLabelAlign = reactive<{
  database: string
  jobName: string
  desc: string
  nodes: Node[]
  links: Link[]
}>({
  database: '',
  jobName: '',
  desc: '',
  nodes: [],
  links: [],
})

const validateNodes = (rule: any, value: Node[], callback: any) => {
  const checkedList = value.filter((item) => item.check)
  const noPrimary = checkedList.filter((item) => !item.primary)
  if (!checkedList.length) {
    callback(new Error('please choose Nodes'))
  } else if (noPrimary.length) {
    callback(new Error('please choose primary'))
  } else {
    callback()
  }
}

const validateLinks = (rule: any, value: Link[], callback: any) => {
  const noValue = value.filter((item: any) => {
    return Object.keys(item).some((key: any) => !item[key])
  })
  if (!value.length) {
    callback(new Error('please choose Links'))
  } else if (noValue.length) {
    callback(new Error('Please complete all links options'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  database: [{ required: true, message: t('Please select database'), trigger: 'change' }],
  jobName: [{ required: true, message: t('Please input job name'), trigger: 'blur' }],
  nodes: [{ validator: validateNodes, required: true, trigger: 'change' }],
  links: [{ validator: validateLinks, required: true, trigger: 'change' }],
})

let chartInstance: echarts.ECharts

const checkedList = computed(() => {
  return formLabelAlign.nodes.filter((item) => item.check)
})

onBeforeMount(async () => {
  await queryDatabases()
})

onMounted(() => {
  if (renderer.value) {
    chartInstance = generateBarInstance(renderer.value)
    chartInstance.setOption(formatBarOptions())
  }
})

const nextStep = async () => {
  await ruleFormRef.value?.validate(async (valid, fields) => {
    if (!valid) {
      console.log('error submit!', fields)
    } else {
      const data = {
        name: formLabelAlign.jobName,
        desc: formLabelAlign.desc,
        nodes: checkedList.value.map((item) => {
          return {
            database: formLabelAlign.database,
            table: item.table,
            primary: item.primary,
            display_field: item.display_field,
          }
        }),
        links: formLabelAlign.links.map((item) => ({ ...item, database: formLabelAlign.database })),
      }
      const currentId: string = UUID.generate()
      try {
        await addOne(currentId, JSON.stringify(data))
        ElMessage.success('Add successful')
        emit('toResult', currentId)
      } catch (error) {
        ElMessage.error('Add failed')
      }
    }
  })
}

const queryDatabases = () => {
  return query(sqls.queryAllDatabases()).then((res) => {
    database.value = res.data
  })
}

const queryTableByDatabaseInPage = (val: string) => {
  return query(sqls.queryTablesByDatabase(val))
}

const changeDatabase = async (val: string) => {
  const tableByDatabase = await queryTableByDatabaseInPage(val)
  const columnsByDatabase = await queryColumnByDatabase(val)
  columnsGroupByTable.value = tableByDatabase.data.reduce((total: any, table: any) => {
    if (!total[table.name]) {
      total[table.name] = columnsByDatabase.data.filter(
        (column: any) => column.table === table.name,
      )
    }
    return total
  }, {})
  formLabelAlign.nodes = tableByDatabase.data.map((item: any, index: number) => {
    return {
      table: item.name,
      id: index + '',
      check: false,
      primary: columnsGroupByTable.value[item.name][0].name,
      display_field: columnsGroupByTable.value[item.name][0].name,
    }
  })
}

const toList = () => {
  emit('toList')
}

const addLinks = () => {
  formLabelAlign.links.push({
    source_node: '',
    source_link_field: '',
    target_node: '',
    target_link_field: '',
    relationship: '',
    source_primary: '',
    target_primary: '',
  })
}
const deleteLink = (i: number) => {
  formLabelAlign.links.splice(i, 1)
}

const changeSourceNode = (val: string, i: number) => {
  const chooedNode = checkedList.value.find((item) => item.table === val)
  formLabelAlign.links[i].source_primary = chooedNode?.primary || ''
  formLabelAlign.links[i].source_link_field = ''
  formLabelAlign.links[i].relationship = val + '_' + formLabelAlign.links[i].target_node
}

const changeTargetNode = (val: string, i: number) => {
  const chooedNode = checkedList.value.find((item) => item.table === val)
  formLabelAlign.links[i].target_primary = chooedNode?.primary || ''
  formLabelAlign.links[i].target_link_field = ''
  formLabelAlign.links[i].relationship = formLabelAlign.links[i].source_node + '_' + val
}
</script>
<template>
  <section class="graph-add-container">
    <h3 class="title">
      <el-icon style="margin-right: 10px; cursor: pointer" @click="toList">
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
      style="width: 100%"
      status-icon
    >
      <el-form-item :label="$t('Job Name')" prop="jobName">
        <el-input
          v-model="formLabelAlign.jobName"
          style="width: 600px"
          placeholder="Please input"
        />
      </el-form-item>

      <el-form-item :label="$t('Describe')" prop="desc">
        <el-input
          v-model="formLabelAlign.desc"
          style="width: 600px"
          type="textarea"
          placeholder="Please input"
        />
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

      <el-form-item :label="$t('Nodes')" prop="nodes">
        <el-table :data="formLabelAlign.nodes" style="width: 100%">
          <el-table-column prop="check" label="Check">
            <template #default="scope">
              <el-checkbox v-model="scope.row.check" />
            </template>
          </el-table-column>
          <el-table-column prop="table" label="Table"> </el-table-column>
          <el-table-column prop="primary" label="Primary">
            <template #default="scope">
              <el-select
                v-model="scope.row.primary"
                popper-class="primary-select-dropdown"
                placeholder="Select Field"
                filterable
              >
                <el-option
                  v-for="item in columnsGroupByTable[scope.row.table]"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="display_field" label="display_field">
            <template #default="scope">
              <el-select
                v-model="scope.row.display_field"
                popper-class="primary-select-dropdown"
                placeholder="Select Field"
                filterable
              >
                <el-option
                  v-for="item in columnsGroupByTable[scope.row.table]"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item :label="$t('Links')" prop="links">
        <el-table :data="formLabelAlign.links" style="width: 100%">
          <el-table-column prop="source_node" label="source_node">
            <template #default="scope">
              <el-select
                v-model="scope.row.source_node"
                popper-class="primary-select-dropdown"
                placeholder="Select source_node"
                filterable
                @change="(val) => changeSourceNode(val, scope.$index)"
              >
                <el-option
                  v-for="item in checkedList"
                  :key="item.table"
                  :label="item.table"
                  :value="item.table"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="source_link_field" label="source_link_field">
            <template #default="scope">
              <el-select
                v-model="scope.row.source_link_field"
                popper-class="primary-select-dropdown"
                placeholder="Select Field"
                filterable
              >
                <el-option
                  v-for="item in columnsGroupByTable[scope.row.source_node]"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="target_node" label="target_node">
            <template #default="scope">
              <el-select
                v-model="scope.row.target_node"
                popper-class="primary-select-dropdown"
                placeholder="Select Field"
                filterable
                @change="(val) => changeTargetNode(val, scope.$index)"
              >
                <el-option
                  v-for="item in checkedList"
                  :key="item.table"
                  :label="item.table"
                  :value="item.table"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="target_link_field" label="target_link_field">
            <template #default="scope">
              <el-select
                v-model="scope.row.target_link_field"
                popper-class="primary-select-dropdown"
                placeholder="Select Field"
                filterable
              >
                <el-option
                  v-for="item in columnsGroupByTable[scope.row.target_node]"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="relationship" label="relationship">
            <template #default="scope">
              <el-input v-model="scope.row.relationship" placeholder="Please input" />
              <!-- <el-select
                v-model="scope.row.relationship"
                popper-class="primary-select-dropdown" 
                placeholder="Select Field"
                filterable
              >
                <el-option
                  v-for="item in checkedList"
                  :key="item.table"
                  :label="item.table"
                  :value="item.table"
                />
              </el-select> -->
            </template>
          </el-table-column>
          <el-table-column label="operation">
            <template #default="scope">
              <span class="link-del-btn" @click="deleteLink(scope.$index)">{{ $t('delete') }}</span>
            </template>
          </el-table-column>
        </el-table>
        <span class="add-link-btn" @click="addLinks">
          <el-icon :size="14" color="#FFB300">
            <Plus />
          </el-icon>
        </span>
      </el-form-item>
    </el-form>

    <section class="btn">
      <el-button class="custom-primary-btn" type="primary" @click="nextStep">
        {{ 'End' }}
      </el-button>
    </section>
  </section>
</template>
<style lang="scss" scoped>
.graph-add-container {
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
    padding-bottom: 70px;
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

  .add-link-btn {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 40px;
    margin-top: 20px;
    background-color: #fbfbfb;
    border: 1px solid #f4f4f4;
    cursor: pointer;
  }

  .link-del-btn {
    display: inline-block;
    text-align: center;
    color: var(--el-color-primary);
    cursor: pointer;
  }
}
</style>
