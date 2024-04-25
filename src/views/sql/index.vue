<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import FilterVue from '@/components/sql/Filter.vue'
// import SimpleEditorVue from '@/components/sql/SimpleEditor.vue'
import EditorTabsVue from '@/components/sql/EditorTabs.vue'
import { useSqlStore } from '@/store'
import { ColumnCommand } from '@/components/sql/types'
import { getSqlDescribe, getMakeSelectSql } from '@/components/sql/utils'

const sqlStore = useSqlStore()

const filterInstance = ref<any>()
const filterContainer = ref<HTMLElement>()
const sqlContainer = ref<HTMLElement>()
const EditorTabsInstance = ref<any>()

onMounted(() => {
  sqlStore.increamentVisitNumber()
  const dragElement = filterInstance.value.getDragEle() as HTMLElement
  const editorContainer = filterContainer.value as HTMLElement
  const container = sqlContainer.value as HTMLElement
  dragElement.onmousedown = (e) => {
    const oldX = e.clientX
    const editorWidth = editorContainer.getBoundingClientRect().width
    document.onmousemove = (e) => {
      const currentX = e.clientX
      const result = currentX - oldX
      container.style.cssText = `grid-template-columns: ${editorWidth + result}px 1fr;`
    }
    document.onmouseup = () => {
      document.onmousemove = null
    }
  }
})

const tableCommand = ({ node, command }: any) => {
  const current = sqlStore.tabs.find((tab) => tab.name === sqlStore.activeTabs)
  // current && (current.sql = '123')
  const oldSql = current?.sql || ''
  let newSql = ''
  switch (command) {
    case ColumnCommand.MakeSelect:
      sqlStore.toggleAddSqlIsCommand()
      newSql = getMakeSelectSql(node.data)
      current && (current.sql = oldSql + newSql)
      setTimeout(() => sqlStore.toggleAddSqlIsCommand())
      break
    case ColumnCommand.OpenTable:
      const key = sqlStore.addTableTabs(node.data)
      EditorTabsInstance.value.setEditableTabsValue(key)
      break
    case ColumnCommand.MakeSqlDescribe:
      sqlStore.toggleAddSqlIsCommand()
      getSqlDescribe(node.data).then((data) => {
        newSql = data
        current && (current.sql = oldSql + newSql)
        setTimeout(() => sqlStore.toggleAddSqlIsCommand())
      })
      break
  }
}
</script>
<template>
  <section ref="sqlContainer" class="SQL-container">
    <aside ref="filterContainer" class="sidebar">
      <FilterVue ref="filterInstance" @table-command="tableCommand" />
    </aside>
    <section class="content">
      <EditorTabsVue ref="EditorTabsInstance" />
    </section>
  </section>
</template>
<style lang="scss" scoped>
.SQL-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 1fr;
  width: 100%;
  height: 100%;

  & > aside.sidebar {
    height: 100%;
    background-color: #10223e;
    overflow-y: auto;
  }
  & > section.content {
    position: relative;
    height: 100%;
    background-color: #fff;
  }
}
</style>
