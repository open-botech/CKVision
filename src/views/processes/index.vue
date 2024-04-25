<script lang="ts" setup>
import { ref } from 'vue'
import { Close, Refresh, ArrowLeft, ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import CommonTableVue from '@/components/CommonTable.vue'
import {
  queryProcessesSelects,
  queryProcessesImports,
  queryMutations,
  queryHistoricalImports,
  queryHistoricalSelects,
} from '@/components/processes/query'
import { query } from '@/utils/http'

type ListItem = {
  name: string
  database: string
  table: string
  query_id: string
  mutation_id: string
}

const processesRef = ref<any>(null)
const mutationsRef = ref<any>(null)
const defaultCard = ref('ProcessesImports')
const rows = ref<string>('100')
const page = ref<number>(0)
const pageTotal = ref<number>(0)
let selectedProcesses: ListItem[] = []
let selectedMutations: ListItem[] = []

const changeProcesses = (val: ListItem[]) => {
  selectedProcesses = val
}
const changeMutations = (val: ListItem[]) => {
  selectedMutations = val
}

const kill = async () => {
  let sql = ''
  if (defaultCard.value === 'Processes') {
    if (!selectedProcesses.length) {
      return ElMessage({
        message: 'Please select at least one piece of "Processes" data.',
        grouping: true,
        type: 'error',
      })
    }
    const idArr = selectedProcesses.map((item) => {
      return `query_id ='${item.query_id}'`
    })
    // KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90' or  query_id='2-857d-4a57-9ee0-327da5d60a90'
    sql = `KILL QUERY WHERE ${idArr?.join(' or ')}`
  } else if (defaultCard.value === 'Mutations') {
    if (!selectedMutations.length) {
      return ElMessage({
        message: 'Please select at least one piece of "Mutations" data.',
        grouping: true,
        type: 'error',
      })
    }
    // KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
    const idArr = selectedMutations.map((item) => {
      return `database = '${item.database}' AND table = '${item.table}' AND mutation_id='${item.mutation_id}'`
    })
    sql = `KILL MUTATION WHERE ${idArr?.join(' or ')}`
  }
  await ElMessageBox.confirm('Kill selected data?', 'Kill', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
    customClass: 'show-custom-primary-color',
  })
  await query(sql)
  if (defaultCard.value === 'Processes') {
    await processesRef.value.refresh()
  } else {
    await mutationsRef.value.refresh()
  }
}

const refresh = () => {
  if (defaultCard.value === 'Processes') {
    processesRef.value.refresh()
  } else {
    page.value = 0
    mutationsRef.value.refresh()
  }
}

const handleChangeRows = (command: string) => {
  page.value = 0
  rows.value = command
  mutationsRef.value.getData(command, +command * page.value)
}

const previousPage = () => {
  if (page.value <= 0) {
    return
  }
  page.value--
  mutationsRef.value.getData(rows.value, +rows.value * page.value)
}

const nextPage = () => {
  if (page.value >= pageTotal.value) {
    return
  }
  page.value++
  mutationsRef.value.getData(rows.value, +rows.value * page.value).then((res: any) => {
    res.rows_before_limit_at_least
  })
}

const getTotal2Computed = (total: number) => {
  pageTotal.value = Math.floor(total / +rows.value)
}
</script>
<template>
  <section class="processes-container">
    <section class="table-btn">
      <div class="btn" @click="kill">
        <el-icon color="#FF4D4F" style="margin-right: 8px">
          <Close />
        </el-icon>
        <span>{{ $t('Kill') }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="btn" @click="refresh">
        <el-icon color="#59595F" style="margin-right: 8px">
          <Refresh />
        </el-icon>
        <span>{{ $t('Refresh') }}</span>
      </div>
      <div v-if="defaultCard === 'Mutations'" style="margin-left: 60px" class="page-box">
        <el-dropdown @command="handleChangeRows">
          <span class="el-dropdown-link">
            {{ rows }} Rows
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="100"> 100 rows </el-dropdown-item>
              <el-dropdown-item command="300"> 300 rows </el-dropdown-item>
              <el-dropdown-item command="500"> 500 rows </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-divider direction="vertical" />
        <div class="pagenigetion-box">
          <el-icon :class="{ disable: page <= 0 }" @click="previousPage">
            <ArrowLeft />
          </el-icon>
          <el-icon :class="{ disable: page >= pageTotal }" @click="nextPage">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </section>
    <el-tabs v-model="defaultCard" type="border-card">
      <el-tab-pane label="Imports - current" name="ProcessesImports">
        <CommonTableVue
          ref="processesImportsRef"
          :query-func="queryProcessesImports"
          :show-selection="true"
        ></CommonTableVue>
      </el-tab-pane>
      <el-tab-pane label="Imports - historical" :lazy="true" name="Historical imports">
        <CommonTableVue ref="importsRef" :query-func="queryHistoricalImports"></CommonTableVue>
      </el-tab-pane>
      <!-- :label="$t('Processes')" -->
      <el-tab-pane label="Selects - current" name="ProcessesSelects">
        <CommonTableVue
          ref="processesRef"
          :query-func="queryProcessesSelects"
          :show-selection="true"
          @selection-change="changeProcesses"
        ></CommonTableVue>
      </el-tab-pane>
      <el-tab-pane label="Selects - historical" :lazy="true" name="Historical selects">
        <CommonTableVue ref="importsRef" :query-func="queryHistoricalSelects"></CommonTableVue>
      </el-tab-pane>
      <!-- :label="$t('Mutations')" -->
      <el-tab-pane label="Mutations" :lazy="true" name="Mutations">
        <CommonTableVue
          ref="mutationsRef"
          :query-func="queryMutations"
          :show-index="true"
          :show-selection="true"
          @firstGetData="getTotal2Computed"
          @selection-change="changeMutations"
        ></CommonTableVue>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<style lang="scss" scoped>
.processes-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px 30px;
  background-color: #f8f8f8;
  box-sizing: border-box;

  .table-btn {
    position: absolute;
    right: 60px;
    top: 20px;
    display: flex;
    height: 39px;
    display: flex;
    align-items: center;
    z-index: 10;

    & > div.btn {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    span {
      font-size: 14px;
      color: rgba(62, 62, 69, 0.65);
    }
  }

  & > .el-tabs--border-card {
    border: unset;
  }
  & > .el-tabs {
    width: 100%;
    height: 100%;
  }

  :deep(.el-tabs--border-card > .el-tabs__header) {
    background-color: #f0f0f0;
  }

  :deep(.el-tabs__content) {
    min-height: calc(100% - 36px);
    height: calc(100% - 36px);
    box-sizing: border-box;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
  :deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item) {
    border: unset;
  }
  :deep(.el-tabs__item) {
    background-color: #e1e0dd;
  }
  :deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
    background-color: #ffb300;
    color: #fff;
  }
  :deep(.el-popper) {
    max-width: 600px;
  }
  :deep(.el-table th.el-table__cell) {
    background-color: #fbfbfb;
  }

  .el-dropdown-link {
    display: flex;
    align-items: center;
    line-height: 20px;
  }

  .pagenigetion-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 44px;

    i {
      cursor: pointer;
      color: rgba(62, 62, 69, 0.65);
    }

    i.disable {
      color: rgba(62, 62, 69, 0.45);
      cursor: not-allowed;
    }
    i.disable:hover {
      color: rgba(62, 62, 69, 0.45);
    }

    i:hover {
      color: var(--el-color-primary);
    }
  }
  .page-box {
    display: flex;
    align-items: center;
  }
}
</style>
