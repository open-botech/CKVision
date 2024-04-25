<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import i18n from '@/i18n'

import ListItemVue from './ListItem.vue'

import { queryList, deleteOne as deleteOneOrigin } from '../query'

const emit = defineEmits(['add', 'toResult'])
const list = ref<any[]>([])
const loading = ref<boolean>(false)
const t = i18n.global.t

const listLengthLess = computed(() => {
  return !list.value.length || list.value.length < 3
})

onBeforeMount(async () => {
  loading.value = true
  const res = await queryList()
  list.value = res.data
  loading.value = false
})

const add = () => {
  emit('add')
}

const toResult = (item: any) => {
  emit('toResult', item)
}

const deleteOne = async (item: any) => {
  await ElMessageBox.confirm(t('Are you sure you want to delete it?'), t('Delete'), {
    confirmButtonText: t('Sure'),
    cancelButtonText: t('Cancel'),
    type: 'warning',
    customClass: 'show-custom-primary-color',
  })
  loading.value = true
  await deleteOneOrigin(item.id)
  const res = await queryList()
  list.value = res.data
  loading.value = false
}
</script>
<template>
  <section
    v-loading="loading"
    class="ml-list-container"
    :style="listLengthLess ? { gridTemplateColumns: 'repeat(auto-fit, 300px)' } : {}"
  >
    <section class="list-box add-btn" @click="add">
      <el-icon :size="18">
        <Plus />
      </el-icon>
      <span class="add-text">{{ $t('NEW') }}</span>
    </section>
    <ListItemVue
      v-for="(item, i) in list"
      :key="i"
      :item="item"
      @to-result="toResult"
      @delete="deleteOne"
    ></ListItemVue>
  </section>
</template>
<style lang="scss" scoped>
.ml-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 160px;
  grid-gap: 20px;
  width: 100%;
}
.list-box {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
}
.list-title-box {
  width: 100%;
  padding: 26px 20px;
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
  width: 276px;
  height: 32px;
  color: var(--color-yellow-text);
  line-height: 32px;
  border: 1px solid var(--tab-bg);
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
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
