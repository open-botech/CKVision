<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ScrollbarInstance } from 'element-plus'

import { queryAllDatabases, queryAllColumns, queryAllTables } from './query'
import { createTree } from './utils'
import { ColumnCommand } from './types'
// import { useLoginStore } from '@/store'
import tableImg from '@/assets/images/sql/table.svg'
import databaseImg from '@/assets/images/sql/database.svg'
import SvgIcon from '../SvgIcon/index.vue'

const emit = defineEmits(['tableCommand'])
// const loginStore = useLoginStore()

const treeLoading = ref(false)
const columns = ref<any[]>([])
const selectV2Columns = ref<any[]>([])
const tree = ref<any[]>([])
const defaultExpandKeys = ref<string[]>([])
const seletedColumn = ref<string>()
const selectedColumnObj = ref<any>()
const treeInstance = ref<any>()
const dataloading = ref<boolean>(false)
const dragEle = ref<HTMLElement>()
const treeContainerHeight = ref<number>()
const br = '\n'
const scrollBar = ref<ScrollbarInstance>()

onBeforeMount(() => {
  // dataloading.value = true
  // var worker = new Worker('worker.js');
  // worker.onmessage = (e) => {
  //   const realData = JSON.parse(e.data)
  //   columns.value = realData.columns
  //   tree.value = realData.tree
  //   defaultExpandKeys.value = [tree.value[0].name]
  //   dataloading.value = false
  // }
  // worker.postMessage(JSON.stringify(loginStore.connection))

  getTreeData()
})

onMounted(() => {
  treeContainerHeight.value = document
    .querySelector('.tree-content')
    ?.getBoundingClientRect().height
  // closeTooltip()
})

// const closeTooltip = () => {
// 	// 此处事件源可以替换，按需切换即可
//   (scrollBar.value?.wrap$ as HTMLElement).onscroll = () => {
//     console.log('111111111')
//     let list = document.querySelectorAll('.el-popper.is-dark.click-cat-dark')
//     if (list.length > 0) {
//       (list[list.length - 1] as HTMLElement).style.display = 'none'
//     }
//   }
// }

const getTreeData = () => {
  //dataloading.value = true
  treeLoading.value = true

  Promise.all([queryAllColumns(), queryAllTables(), queryAllDatabases()])
    .then((res) => {
      const dataArr = res.map((item) => item.data)
      columns.value = dataArr[0]
      selectV2Columns.value = dataArr[0].map((item: any) => ({
        label: item.name,
        value: `${item.database}.${item.table}.${item.name}`,
      }))
      tree.value = createTree(dataArr[0], dataArr[1], dataArr[2])
      defaultExpandKeys.value = [tree.value[0].name]
    })
    .finally(() => {
      treeLoading.value = false
    })
}

const clickCommand = (node: any, command: string) => {
  emit('tableCommand', {
    node,
    command,
  })
}

const changeSelected = (val: string) => {
  if (selectedColumnObj.value) {
    selectedColumnObj.value.selected = false
  }
  const [database, table, currentCol] = val.split('.')
  const selectedColumn = columns.value.find((item: any) => item.name === currentCol)
  selectedColumnObj.value = selectedColumn
  selectedColumn.selected = true
  treeInstance.value.store.nodesMap[database].expanded = true
  treeInstance.value.store.nodesMap[table].expanded = true

  // setTimeout(() => {
  //   console.log(`#${database}-${table}-${currentCol}`)
  //   const nodeEle = document.querySelector(`#${database}-${table}-${currentCol}`)
  //   console.log(nodeEle, 'nodeEle')
  //   nodeEle?.scrollIntoView()
  // }, 100)
}

const getDragEle = () => {
  return dragEle.value
}

const refreshTree = () => {
  getTreeData()
}

const shrinkAll = () => {
  Object.keys(treeInstance.value.store.nodesMap).forEach((key) => {
    if (treeInstance.value.store.nodesMap[key].expanded) {
      treeInstance.value.store.nodesMap[key].expanded = false
    }
  })
}

defineExpose({
  getDragEle,
})
</script>

<template>
  <section v-loading="treeLoading" class="siderbar-content">
    <div ref="dragEle" class="drag-box"></div>
    <div v-if="dataloading" v-loading="true" class="loading"></div>
    <div class="search-box">
      <el-select-v2
        v-model="seletedColumn"
        filterable
        :options="selectV2Columns"
        placeholder="Please select"
        class="filter-select"
        @change="changeSelected"
      />
      <!-- <el-select
        v-model="seletedColumn"
        filterable
        placeholder="Select"
        class="filter-select"
        @change="changeSelected"
      >
        <el-option
          v-for="item in columns"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        >
          <span>{{ item.name }}</span>
        </el-option>
      </el-select> -->
      <div class="search-btn">
        <el-icon color="#fff">
          <Search />
        </el-icon>
      </div>
    </div>
    <div class="tree-content">
      <el-scrollbar ref="scrollBar">
        <!-- , class: () => 'no-back' -->
        <!-- :height="treeContainerHeight" -->
        <!-- <el-tree-v2 -->
        <el-tree
          ref="treeInstance"
          :data="tree"
          node-key="name"
          :default-expanded-keys="defaultExpandKeys"
          render-after-expand
          auto-expand-parent
          :props="{ children: 'children', label: 'name' }"
          :expand-on-click-node="false"
        >
          <template #default="{ node }">
            <template v-if="node.data.database && !node.data.table">
              <!-- append-to=".tree-content .el-scrollbar" -->
              <el-tooltip
                class="box-item"
                effect="dark"
                popper-class="click-cat-dark"
                :content="`${node.data.engine}${br}${node.data.size}`"
                placement="right"
              >
                <el-dropdown
                  trigger="contextmenu"
                  popper-class="dark"
                  @command="(command) => clickCommand(node, command)"
                >
                  <span
                    class="custom-tree-node has-dropdown"
                    @dblclick="() => clickCommand(node, ColumnCommand.OpenTable)"
                  >
                    <img :src="tableImg" alt="" />
                    <span>{{ node.label }}</span>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="ColumnCommand.OpenTable">
                        Open table
                      </el-dropdown-item>
                      <el-dropdown-item :command="ColumnCommand.MakeSelect">
                        Make SELECT
                      </el-dropdown-item>
                      <el-dropdown-item :command="ColumnCommand.MakeSqlDescribe">
                        Make SQL Describe
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-tooltip>
            </template>
            <template v-else-if="node.data.database && node.data.table">
              <!-- append-to=".tree-content .el-scrollbar" -->
              <el-tooltip
                class="box-item"
                effect="dark"
                popper-class="click-cat-dark"
                :content="`${node.data.name}${br}${node.data.type}${node.data.defaultType ? `${br}${node.data.defaultType}` : ''}`"
                placement="right"
              >
                <span
                  :id="`${node.data.database}-${node.data.table}-${node.label}`"
                  class="custom-tree-node has-dropdown"
                >
                  <span>{{ node.label }}</span>
                </span>
              </el-tooltip>
              <span class="column-type">{{ node.data.type }}</span>
              <div :class="`absolute-back ${node.data.selected ? 'active' : ''}`"></div>
            </template>
            <template v-else>
              <span class="custom-tree-node">
                <img :src="databaseImg" alt="" />
                <span>{{ node.label }}</span>
              </span>
              <span v-if="!node.data.isRoot" class="suffix">{{ node.data.children.length }}</span>
              <span v-else class="root-btn">
                <el-icon color="#C4C4C4" :size="16" @click="refreshTree"><Refresh /></el-icon>
                <SvgIcon
                  name="svg-shrink"
                  color="#C4C4C4"
                  size="smaller"
                  @click="shrinkAll"
                ></SvgIcon>
              </span>
            </template>
          </template>
          <!-- </el-tree-v2> -->
        </el-tree>
      </el-scrollbar>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.siderbar-content {
  position: relative;
  height: 100%;
  padding: 30px 10px;
  box-sizing: border-box;
  --el-mask-color: #10223e;
  .drag-box {
    position: absolute;
    right: 4px;
    top: calc(50% - 15px);
    width: 8px;
    height: 30px;
    border-left: 3px solid rgba(255, 255, 255, 0.2);
    border-right: 3px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    cursor: ew-resize;
  }
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: rgba(0,0,0, .6);
    z-index: 3000;

    // :deep(.el-loading-mask) {
    //   background-color: unset;
    // }
  }
  .el-tree {
    background-color: unset;
  }
  .custom-tree-node {
    display: flex;
    color: rgba(255, 255, 255, 0.85);
    img {
      margin-right: 3px;
    }
  }
  // :deep(.no-back > .el-tree-node__content){
  //   height: 56px;
  //   background-color: unset;
  // }
}
.filter-select :deep(.el-select-v2__wrapper) {
  border-radius: unset;
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: unset;
  border-color: rgba(255, 255, 255, 0.2);
}
.filter-select :deep(.el-select-v2__suffix) {
  display: none;
}
.filter-select :deep(.el-select-v2__combobox-input) {
  color: #fff;
}
.search-box {
  display: flex;
  width: 100%;
}
.filter-select {
  flex-grow: 1;
}
.el-select.filter-select :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: unset !important;
}
.search-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 32px;
  background-color: var(--el-color-primary);
  border-bottom-right-radius: 4px;
  border-top-right-radius: 4px;
}
.custom-tree-node {
  position: relative;
  font-size: 16px;
  line-height: 56px;
  z-index: 2;
}
.tree-content {
  height: calc(100% - 32px);
  overflow-y: auto;

  :deep(.el-tree-node__content) {
    position: relative;
    height: 56px;
    background-color: unset;
  }
  .suffix {
    position: absolute;
    top: 17px;
    right: 10px;
    color: rgba(255, 255, 255, 0.45);
    z-index: 2;
  }
  .column-type {
    margin-left: 20px;
    color: rgba(255, 255, 255, 0.45);
  }

  .root-btn {
    position: absolute;
    top: 17px;
    right: 10px;
    display: flex;
    z-index: 2;

    *:hover {
      color: var(--el-color-primary) !important;
    }
  }
  .absolute-back {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .absolute-back.active {
    background: rgba(255, 179, 0, 0.1);
  }
  :deep(.el-tree-node__content i) {
    position: relative;
    z-index: 2;
  }
}
</style>
