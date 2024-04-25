<script lang="ts" setup>
import NodeTemp from './nodeTemplate.vue'

const props = defineProps<{
  opts: any
  css: any
  node: any
}>()

function viewMonitor(params: any) {
  props.node.emit('viewMonitor', params)
}
function viewStreamTask(params: any) {
  props.node.emit('viewStreamTask', params)
}
</script>
<template>
  <div :id="opts.id" class="relation-node" :style="css">
    <div class="logo-container">
      <NodeTemp
        :opts="opts.options"
        @view-stream-task="viewStreamTask"
        @view-monitor="viewMonitor"
      />
    </div>
  </div>
</template>
<style lang="scss"></style>
