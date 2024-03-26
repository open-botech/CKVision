<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

import SimpleEditorVue from './SimpleEditor.vue';
import EditorTabPaneTableVue from './EditorTabPaneTable.vue';
import { TabItem } from '@/store/modules/sql/types';
import { useSqlStore } from '@/store';
import { query } from '@/utils/http';
import { Statistics } from './types';
import { ExportData } from './ExportData';
const sqlStore = useSqlStore();

const props = defineProps<{
  tab: TabItem;
}>();

const columns = ref<{ name: string }[]>([]);
const tableData = ref<any[]>([]);
const statistics = ref<Statistics>();
const editorContainerRef = ref<HTMLElement>();
const reloadSomeElement = ref<boolean>(true);
const addFullScreenClass = ref<boolean>(false);
const editorTabPaneTableInstance = ref<any>();
const simpleEditorInstance = ref<any>();
const loadingForTableData = ref<boolean>(false);
const queryTableDataErrorMsg = ref<string>();

onMounted(() => {
  const dragElement = editorTabPaneTableInstance.value.getDragElement() as HTMLElement;
  const editorContainer = simpleEditorInstance.value.getEditorContainer() as HTMLElement;
  const container = editorContainerRef.value as HTMLElement;
  dragElement.onmousedown = (e) => {
    const oldY = e.clientY;
    const editorHight = editorContainer.getBoundingClientRect().height;
    document.onmousemove = (e) => {
      const currentY = e.clientY;
      const result = currentY - oldY;
      container.style.cssText = `grid-template-rows: ${editorHight + result}px 1fr;`;
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
  document.addEventListener('fullscreenchange', exitFullScreenFunc);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', exitFullScreenFunc);
});

function exitFullScreenFunc(e: any) {
  if (!document.fullscreenElement) {
    addFullScreenClass.value = false;
  }
}

const changeValue = (val: string) => {
  sqlStore.setCurrentTab({
    ...props.tab,
    sql: val,
  });
};

const queryTableData = (rows = 100) => {
  const selectionValue = simpleEditorInstance.value.getSelectionValue();

  loadingForTableData.value = true;
  const selectedSql = selectionValue ? selectionValue : props.tab.sql;

  selectedSql && sqlStore.addHistorySql(selectedSql);

  //  '&max_result_rows=' + rows
  query(selectedSql)
    .then((res) => {
      queryTableDataErrorMsg.value = undefined;
      columns.value = [];
      tableData.value = [];
      const { bytes_read, elapsed, rows_read } = res.statistics;
      statistics.value = {
        bytes_read: +(bytes_read / 1024).toFixed(1),
        elapsed: elapsed.toFixed(2),
        rows_read,
      };
      if (typeof res.data !== 'string') {
        columns.value = res.meta;
        tableData.value = res.data;
      } else {
        queryTableDataErrorMsg.value = res.data;
      }
    })
    .catch((e) => {
      queryTableDataErrorMsg.value = e.message;
      tableData.value = [];
    })
    .finally(() => {
      loadingForTableData.value = false;
    });
};
const exportDataFunc = (command: string) => {
  ExportData(tableData.value, command, props.tab.title as string);
};

const fullScreen = async () => {
  reloadSomeElement.value = false;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    addFullScreenClass.value = false;
    // editorContainerRef.value?.classList.remove('editor-tab-pane-container-fullscreen')
  } else {
    // await editorContainerRef.value?.requestFullscreen()
    await document.body.requestFullscreen();
    addFullScreenClass.value = true;
    // editorContainerRef.value?.classList.add('editor-tab-pane-container-fullscreen')
  }
  reloadSomeElement.value = true;
};
</script>
<template>
  <section
    ref="editorContainerRef"
    class="editor-tab-pane-container"
    :class="{ 'editor-tab-pane-container-fullscreen': addFullScreenClass }"
  >
    <template v-if="reloadSomeElement">
      <SimpleEditorVue
        ref="simpleEditorInstance"
        :tab="tab"
        @change="changeValue"
        @query-action="queryTableData"
      />
      <EditorTabPaneTableVue
        ref="editorTabPaneTableInstance"
        :loading="loadingForTableData"
        :columns="columns"
        :table-data="tableData"
        :statistics="statistics"
        :drag-ele="editorContainerRef"
        :error-msg="queryTableDataErrorMsg"
        @change-rows="queryTableData"
        @export="exportDataFunc"
        @full-screen="fullScreen"
      />
    </template>
  </section>
</template>
<style lang="scss" scoped>
.editor-tab-pane-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 330px 1fr;
  height: 100%;
  width: 100%;
}
.editor-tab-pane-container-fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
}
</style>
