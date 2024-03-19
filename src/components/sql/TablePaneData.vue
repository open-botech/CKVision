<script lang="ts" setup>
import { TabItem } from '@/store/modules/sql/types';
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';

import EditorTabPaneTableVue from './EditorTabPaneTable.vue';
import { ExportData } from './ExportData';

import { queryTableDataPaneData } from './query';
import { Statistics } from './types';

const props = defineProps<{
  tab: TabItem;
}>();

const columns = ref<any[]>([]);
const tableData = ref<any[]>([]);
const statistics = ref<Statistics>();
const reloadSomeElement = ref<boolean>(true);
const loading = ref<boolean>(false);
const editorContainerRef = ref<HTMLElement>();

onBeforeMount(() => {
  queryData();
});
onMounted(() => {
  document.addEventListener('fullscreenchange', exitFullScreenFunc);
});
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', exitFullScreenFunc);
});

function exitFullScreenFunc(e: any) {
  if (!document.fullscreenElement) {
    editorContainerRef.value?.classList.remove('table-pane-data-container-fullscreen');
  }
}

const queryData = (rows = 100) => {
  loading.value = true;
  queryTableDataPaneData(props.tab.node, rows)
    .then((res) => {
      console.log('res', res);

      const { bytes_read, elapsed, rows_read } = res.statistics;
      columns.value = res.meta;
      tableData.value = res.data;
      statistics.value = {
        bytes_read: +(bytes_read / 1024).toFixed(1),
        elapsed: elapsed.toFixed(2),
        rows_read,
      };
    })
    .finally(() => {
      loading.value = false;
    });
};
const exportDataFunc = (command: string) => {
  ExportData(tableData.value, command, props.tab.title as string);
};

const fullScreen = async () => {
  reloadSomeElement.value = false;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    editorContainerRef.value?.classList.remove('table-pane-data-container-fullscreen');
  } else {
    await document.body.requestFullscreen();
    editorContainerRef.value?.classList.add('table-pane-data-container-fullscreen');
  }
  reloadSomeElement.value = true;
};
</script>
<template>
  <section ref="editorContainerRef" class="table-pane-data-container">
    <EditorTabPaneTableVue
      :loading="loading"
      :columns="columns"
      :table-data="tableData"
      :statistics="statistics"
      :not-title="true"
      @change-rows="queryData"
      @export="exportDataFunc"
      @full-screen="fullScreen"
    />
  </section>
</template>
<style lang="scss" scoped>
.table-pane-data-container {
  width: 100%;
  height: 100%;
}
.table-pane-data-container-fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
}
</style>
