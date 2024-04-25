<template>
  <div class="graph-details">
    <div class="details-title">
      <span class="title">details</span>
      <SvgIcon
        class="close"
        color="#ffffff"
        name="svg-close"
        @click="emit('closeDetail')"
      ></SvgIcon>
    </div>

    <div class="details-content">
      <div v-for="(value, key) in detailData.nodeInfo" :key="key" class="detail-item">
        <p class="label">
          {{ key }}
        </p>
        <p class="value">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SvgIcon from '@/components/SvgIcon/index.vue'

defineProps({
  detailData: {
    type: Object,
    default() {
      return {
        nodeInfo: {},
      }
    },
  },
})

const emit = defineEmits(['closeDetail'])
</script>
<style lang="scss" scoped>
.graph-details {
  background: #fffaf6;
  box-shadow: 0px 0px 18px 0px rgba(193, 173, 133, 0.3);
  z-index: 1000;
  position: fixed;
  right: 30px;
  bottom: 30px;
  height: 43.6vh;
  display: flex;
  flex-direction: column;
  .details-title {
    width: 268px;
    height: 52px;
    background: #ffb300;
    border: 1px solid #e4e4e4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    .title {
      font-size: 20px;
      color: #ffffff;
      font-weight: bold;
    }
    .close {
      width: 15px;
      height: 15px;
      cursor: pointer;
    }
  }
  .details-content {
    flex: 1;
    overflow: auto;
    padding: 15px 0;

    .detail-item {
      flex-shrink: 0;
      min-height: 46px;
      width: 260px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #efefef;
      text-align: left;
      margin: 0 auto;
      &:last-child {
        border-bottom: none;
      }
      .label {
        display: inline-block;
        width: 105px;
        margin-right: 10px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        flex-shrink: 0;
        overflow: hidden;
      }
      .value {
        display: inline-block;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
}
</style>
