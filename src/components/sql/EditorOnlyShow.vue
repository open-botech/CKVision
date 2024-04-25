<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'

import { defaultOptions } from './editorConfig'
import { themeCobalt } from './theme/Cobalt'
import createSqlCompleter from './utils/sql-completion'

let editorInstance: monaco.editor.IStandaloneCodeEditor

monaco.editor.defineTheme('cobalt', themeCobalt)

const global: any = {}

const getHints = (model: any) => {
  let id = model.id.substring(6)
  return (global[id] && global[id].hints) || []
}

monaco.languages.registerCompletionItemProvider('sql', createSqlCompleter(getHints, [], []) as any)

const props = defineProps<{
  value: string
}>()

const editorRenderer = ref<HTMLElement>()

watch(
  () => props.value,
  () => {
    editorInstance.setValue(props.value)
  },
)

onMounted(() => {
  initEditor()
})

const initEditor = () => {
  editorInstance = monaco.editor.create(editorRenderer.value as HTMLElement, {
    ...defaultOptions,
    language: 'sql',
    theme: 'vs',
  })
  editorInstance.setValue(props.value)
}
</script>
<template>
  <section class="simple-editor-container">
    <div ref="editorRenderer" :class="`editor-container`"></div>
  </section>
</template>
<style lang="scss" scoped>
.simple-editor-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  text-align: left;
  background-color: #fff;
  box-sizing: border-box;
}
.editor-container {
  height: 100%;
}
</style>
