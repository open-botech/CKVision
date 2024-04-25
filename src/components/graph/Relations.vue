<template>
  <div class="relation-details">
    <el-radio-group v-model="type">
      <el-radio-button label="Tables" />
      <el-radio-button label="RelationShips" />
    </el-radio-group>

    <div class="type-list">
      <div
        v-for="item of typeList[type]"
        :key="item.name"
        class="type-item"
        @click="handleClickType(item.name)"
      >
        <span
          class="type-name"
          :style="{
            color: item.color,
            border: `1px solid ${item.color}`,
            opacity: active.indexOf(item.name) === -1 ? 0.4 : 1,
          }"
          >{{ item.name }} {{ item.count }}</span
        >
        <span
          class="type-color"
          :style="{ background: item.color, opacity: active.indexOf(item.name) === -1 ? 0.4 : 1 }"
        ></span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const type = ref('Tables')
const active = ref<string[]>([])

const emit = defineEmits<{
  (e: 'updateGraph', active: string[]): void
}>()

const handleClickType = (typeName: string) => {
  const index = active.value.indexOf(typeName)

  if (index === -1) {
    active.value.push(typeName)
  } else {
    active.value.splice(index, 1)
  }

  emit('updateGraph', active.value)
}

defineProps({
  typeList: {
    type: Object,
    default() {
      return {
        Tables: [],
        RelationShips: [],
      }
    },
  },
})
</script>
<style lang="scss" scoped>
.relation-details {
  --el-button-bg-color: rgba(255, 179, 0, 0.2);
  --el-button-text-color: rgba(62, 62, 69, 0.45);
  background: #fffaf6;
  box-shadow: 0px 0px 18px 0px rgba(193, 173, 133, 0.3);
  z-index: 1000;
  position: fixed;
  right: 30px;
  bottom: calc(43.6vh + 60px);
  width: 298px;
  height: 33.6vh;
  display: flex;
  flex-direction: column;
  :deep(.el-radio-button__inner) {
    width: 149px;
  }
  .type-list {
    height: calc(33.6vh - 32px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    .type-item {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 16px;
      .type-color {
        width: 22px;
        height: 22px;
        border-radius: 11px;
        margin: 0 19px 0 12px;
        background: #f4aa3a;
        flex-shrink: 0;
      }
      .type-name {
        max-width: 190px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        padding: 0 20px;
        background: rgba(244, 170, 58, 0.16);
        color: #f4aa3a;
        border-radius: 114px;
        cursor: pointer;
        flex-grow: 0;
        overflow: hidden;
      }
    }
  }
}
</style>
