<template>
  <section class="graph-add-wrapper">
    <AddVue @to-result="toResult" @to-list="toList" />
  </section>
</template>

<script lang="ts" setup>
import AddVue from '@/components/graph/add/Add.vue'
import { useGoTo } from '@/layout/hooks'

const goto = useGoTo()

const toResult = (id: string) => {
  goto('GraphResult', { id })
  console.log('跳转关系图')
}
const toList = () => {
  goto('Graph')
}
</script>
<style lang="scss" scoped>
.graph-add-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px 30px;
  background-color: #f8f8f8;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
