<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue'

import EditorOnlyShowVue from './EditorOnlyShow.vue'

import { TabItem } from '@/store/modules/sql/types'
import { getSqlDescribe } from './utils'

const props = defineProps<{
  tab: TabItem
}>()

const sql = ref<string>('')

onBeforeMount(() => {
  queryData()
})

const queryData = () => {
  getSqlDescribe(props.tab.node).then((res) => {
    sql.value = res
  })
}
</script>
<template>
  <section ref="containerRef" class="properties-tab-ddl">
    <EditorOnlyShowVue :value="sql" />
  </section>
</template>
<style lang="scss" scoped>
.properties-tab-ddl {
  width: 100%;
  height: 100%;
}
</style>
