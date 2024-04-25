<script lang="ts" setup>
import { computed } from 'vue'

import ListItemVue from '@/components/history-sql/ListItem.vue'

import { useSqlStore } from '@/store'
import emptyImg from '@/assets/images/empty.svg'

const sqlStore = useSqlStore()

const sqlList = computed(() => {
  return sqlStore.historySqls
})
</script>
<template>
  <section class="history-sql-container">
    <div v-if="!sqlList.length" class="empty-container">
      <div class="empty-box">
        <img :src="emptyImg" alt="" />
        <p>No data</p>
      </div>
    </div>
    <div v-else class="list-container">
      <ListItemVue v-for="(item, index) in sqlList" :key="index" :sql="item" />
    </div>
  </section>
</template>
<style lang="scss" scoped>
.history-sql-container {
  width: 100%;
  height: 100%;
  padding: 20px 30px;
  background-color: #f8f8f8;
  box-sizing: border-box;
  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .empty-box p {
      margin-top: 16px;
    }
  }

  .list-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
</style>
