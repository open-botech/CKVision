<template>
  <div class="layout-container">
    <Header></Header>
    <div class="route-container">
      <!-- <router-view v-slot="{ Component, route }" id="pageWrapper">
        <keep-alive :include="['SQL']">
          <component :is="Component" />
        </keep-alive>
      </router-view> -->
      <router-view />
    </div>
  </div>
</template>
<script lang="ts" setup>
import Header from './Header.vue'
</script>
<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100%;
}
.route-container {
  width: 100%;
  height: calc(100% - 64px);
  * {
    box-sizing: border-box;
  }
}
</style>
