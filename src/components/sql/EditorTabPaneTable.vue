<script lang="ts" setup>
import { ref, toRaw, toRefs, nextTick } from 'vue'
import { ArrowDown, Download, FullScreen, Refresh } from '@element-plus/icons-vue'
import { Statistics } from './types'
import Empty from '../metrics/Empty.vue'

const props = defineProps<{
  columns: any[]
  tableData: any[]
  statistics?: Statistics
  notTitle?: boolean
  dragEle?: HTMLElement
  loading: boolean
  errorMsg?: string
}>()

const { columns } = toRefs(props)

const emit = defineEmits(['changeRows', 'export', 'fullScreen'])

const rows = ref<string>('100')
const containerRef = ref<HTMLElement>()
const dragEle = ref<HTMLElement>()

const handleRefresh = () => {
  emit('changeRows', rows.value)
}
const handleChangeRows = (command: string) => {
  rows.value = command
  emit('changeRows', command)
}
const handleDownload = (command: string) => {
  emit('export', command)
}
const fullScreen = () => {
  emit('fullScreen')
}

const getDragElement = () => {
  return dragEle.value
}

const resetEditMode = () => {
  //reset
  props.tableData.forEach((rowItem) => {
    rowItem.editMode = false
  })
  columns.value.forEach((item) => {
    item.editMode = false
  })
}

const entryEditMode = (row: any, column: any, cell: any) => {
  resetEditMode()

  row.editMode = true
  const { label } = toRaw(column)
  const index = columns.value.findIndex((item) => {
    return toRaw(item).name === label
  })
  columns.value[index].editMode = true

  nextTick(() => {
    const input = cell.querySelector('input')
    input.focus()
  })
}

defineExpose({
  getDragElement,
})
</script>
<template>
  <section ref="containerRef" class="editor-table-container">
    <div class="content-container">
      <div ref="dragEle" class="drag-box"></div>
      <h3 class="table-title">
        <span v-if="!notTitle" class="title-content">Data / Table</span>
      </h3>
      <div v-loading="loading" class="table-container">
        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
        <el-table
          v-if="tableData?.length && columns.length"
          :data="tableData"
          style="width: 100%"
          height="100%"
          tooltip-effect="dark"
          :border="true"
          @cell-dblclick="entryEditMode"
        >
          <el-table-column type="index" width="60" />
          <template v-for="col in columns" :key="col.name">
            <el-table-column
              :show-overflow-tooltip="true"
              :prop="col.name"
              :label="col.name"
              min-width="150"
            >
              <template #default="scope">
                <el-input
                  v-if="col.editMode && scope.row.editMode"
                  v-model="scope.row[col.name]"
                  @blur="scope.row.editMode = false"
                ></el-input>

                <span v-else>{{ scope.row[col.name] }}</span>
              </template>
            </el-table-column>
          </template>
        </el-table>
        <Empty v-if="!errorMsg" style="height: 200px"></Empty>
      </div>
    </div>
    <div class="action-box">
      <el-icon class="el-icon--right" @click="handleRefresh">
        <Refresh />
      </el-icon>
      <el-divider direction="vertical" />
      <template v-if="!!statistics">
        <span>{{ statistics?.elapsed }} sec</span>
        <el-divider direction="vertical" />
        <span>{{ statistics?.rows_read }} rows</span>
        <el-divider direction="vertical" />
        <span class="marginright56">{{ statistics?.bytes_read }} KB</span>
      </template>
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
            <el-dropdown-item command="All"> All </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-divider direction="vertical" />
      <el-dropdown @command="handleDownload">
        <span class="el-dropdown-link">
          <el-icon class="el-icon--right"><Download /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="CSVHeaders"> CSV with headers </el-dropdown-item>
            <el-dropdown-item command="CSV"> CSV without headers </el-dropdown-item>
            <el-dropdown-item command="TSVHeaders"> TSV with headers </el-dropdown-item>
            <el-dropdown-item command="TSV"> TSV without headers </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-divider direction="vertical" />
      <el-icon class="el-icon--right" @click="fullScreen">
        <FullScreen />
      </el-icon>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.editor-table-container {
  position: relative;
  width: 100%;
  height: 100%;
  .action-box {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    height: 36px;
    padding-right: 10px;
    align-items: center;
    font-size: 14px;
  }
  .marginright56 {
    display: block;
    margin-right: 56px;
  }
  .el-dropdown-link {
    display: flex;
    align-items: center;
  }
  .table-container {
    position: absolute;
    left: 0;
    top: 36px;
    width: 100%;
    height: calc(100% - 37px);
    background: #fff;

    .error-msg {
      line-height: 30px;
      text-align: left;
      padding: 10px 20px;
    }
  }
}
.content-container {
  position: relative;
  width: 100%;
  height: 100%;

  .drag-box {
    height: 36px;
    background-color: #f0f0f0;
    cursor: ns-resize;
  }

  .table-title {
    position: absolute;
    left: 0;
    top: 0;
    height: 36px;
    border-top: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
    box-sizing: border-box;
    background-color: #f0f0f0;

    .title-content {
      display: block;
      width: 93px;
      height: 36px;
      margin-top: -1px;
      font-size: 14px;
      font-weight: normal;
      color: #fff;
      line-height: 34px;
      background-color: var(--el-color-primary);
    }
  }
}
</style>
