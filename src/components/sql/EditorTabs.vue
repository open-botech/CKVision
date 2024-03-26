<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { useSqlStore } from '@/store';

import { TabsType } from './types';

import EditorTabPane from './EditorTabPane.vue';
import TableTabPane from './TableTabPane.vue';

const sqlStore = useSqlStore();

const tabs = computed(() => {
  return sqlStore.tabs;
});

const editableTabsValue = ref<string>();
const tabType = TabsType;

onBeforeMount(() => {
  const currentActive = tabs.value.find((item) => item.name === sqlStore.activeTab);
  if (currentActive) {
    editableTabsValue.value = sqlStore.activeTab;
  } else {
    editableTabsValue.value = tabs.value[0]?.name;
    sqlStore.setActiveTab(tabs.value[0]?.name);
  }
});

const changeTabs = (val: any) => {
  sqlStore.setActiveTab(val);
};

const addTab = () => {
  sqlStore.addEditorTabs();
  const name = tabs.value[tabs.value.length - 1].name;
  sqlStore.setActiveTab(name);
  editableTabsValue.value = name;
};

const removeTab = (val: any) => {
  const index = tabs.value.findIndex((item) => item.name === val);
  if (index >= 0) {
    const activetabIndex = tabs.value.findIndex((item) => item.name === sqlStore.activeTab);
    if (activetabIndex === index && index > 0) {
      const activeTab = tabs.value[index - 1];
      editableTabsValue.value = activeTab.name;
      sqlStore.setActiveTab(activeTab.name);
    }
    sqlStore.removeTabs(index);
  }
};

const setEditableTabsValue = (val: string) => {
  editableTabsValue.value = val;
};

defineExpose({
  setEditableTabsValue,
});
</script>
<template>
  <section class="editor-tabs-container">
    <span class="add-tab-btn" @click="addTab">
      <el-icon><Plus /></el-icon>
      {{ $t('Add new tab') }}
    </span>
    <el-tabs
      v-model="editableTabsValue"
      type="card"
      editable
      class="editor-tabs"
      @tab-remove="removeTab"
      @tab-change="changeTabs"
    >
      <el-tab-pane
        v-for="item in tabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        :class="`tabs-${item.name}`"
        lazy
      >
        <EditorTabPane v-if="item.type === tabType.Editor" :tab="item" />
        <TableTabPane v-else :tab="item" />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<style lang="scss" scoped>
.editor-tabs-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .editor-tabs {
    height: 100%;
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__header .el-tabs__nav) {
    border: unset;
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__header .el-tabs__item.is-active) {
    border: unset;
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__header .el-tabs__nav-wrap) {
    background: #f0f0f0;
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__content) {
    width: 100%;
    height: calc(100% - 41px);
  }
  .el-tabs--card.editor-tabs > :deep(.el-tabs__content > .el-tab-pane) {
    height: 100%;
  }
  .el-tabs--card.editor-tabs :deep(.el-tabs__new-tab) {
    margin: 10px 10px 0 110px;
    border: unset;
  }

  .add-tab-btn {
    position: absolute;
    right: 0;
    top: 0;
    display: block;
    height: 40px;
    width: 140px;
    color: #fff;
    line-height: 40px;
    text-align: center;
    background-color: var(--el-color-primary);
    z-index: 10;
    cursor: pointer;
  }
}
</style>
