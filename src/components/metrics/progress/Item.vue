<script setup lang="ts">
import { computed } from 'vue'
import { countDataItem } from './types'
const props = defineProps<{
  backType?: 'green' | 'yellow'
  item: countDataItem
  maxValue: number
}>()
const value = computed(() => {
  return props.item.value ?? 0
})
const name = computed(() => {
  return props.item.name
})

const rate = computed(() => {
  return (value.value / props.maxValue) * 100
})
</script>
<template>
  <section class="item-container">
    <div class="name">
      {{ name }}
    </div>
    <div class="item-line">
      <div :class="`line ${backType}`" :style="`width: ${rate}%`"></div>
    </div>
    <div class="number">
      {{ value }}
    </div>
  </section>
</template>
<style lang="scss" scoped>
.item-container {
  width: 100%;
  display: flex;
  align-items: center;
  color: rgba(62, 62, 69, 0.85);
  font-size: 14px;
  height: 28px;
}
.name {
  width: 240px;
  flex-shrink: 0;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
}
.item-line {
  height: 14px;
  width: 55%;
  flex-grow: 1;
  border-radius: 7px;
  margin: 0 10px;
  background: #f8f8f8;
  overflow: hidden;
}
.item-line .line {
  height: 100%;
  border-radius: 0px 8px 8px 0px;
}
.item-line .line.yellow {
  background: linear-gradient(270deg, #ffb300 0%, rgba(255, 179, 0, 0) 91.43%);
}

.item-line .line.green {
  background: linear-gradient(270deg, #55dca9 0%, rgba(85, 220, 169, 0) 91.43%);
}
</style>
