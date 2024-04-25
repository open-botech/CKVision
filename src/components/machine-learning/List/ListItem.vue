<script lang="ts" setup>
defineProps<{
  item: { job_name: string }
}>()

const emit = defineEmits(['toResult', 'delete'])

const toResult = (item: any) => {
  emit('toResult', item)
}

const deleteOne = (item: any) => {
  emit('delete', item)
}
</script>
<template>
  <section key="{i}" class="list-box">
    <div class="list-title-box">
      <p class="list-title">
        {{ item.job_name }}
      </p>
    </div>
    <div class="list-btn-box">
      <span class="list-btn" @click="deleteOne(item)">{{ $t('Delete') }}</span>
      <span class="list-btn" @click="toResult(item)">{{ $t('View Results') }}</span>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.list-box {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
}
.list-title-box {
  width: 100%;
  padding: 26px 20px;
  text-align: left;
  box-sizing: border-box;
}
.list-title {
  margin-bottom: 26px;
  font-size: 16px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.85);
}
.list-btn-box {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.list-btn {
  width: 129px;
  height: 32px;
  color: var(--el-color-primary);
  line-height: 30px;
  border: 1px solid var(--el-color-primary);
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
}
.list-btn + .list-btn {
  margin-left: 17px;
}
.list-btn:hover {
  color: #fff;
  background-color: var(--el-color-primary);
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1.6px dashed #ababab;
  cursor: pointer;
}

.add-btn .add-text {
  color: rgba(0, 0, 0, 0.85);
}
.add-icon {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.85);
}
.empty {
  width: 100%;
  height: 300px;
  text-align: center;
  line-height: 300px;
  color: rgba(0, 0, 0, 0.85);
}
</style>
