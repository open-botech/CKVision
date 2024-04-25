<script setup lang="ts">
defineProps<{
  title: string
  height: number
}>()
</script>
<template>
  <section class="card-container" :style="{ height: `${height || 310}px` }">
    <h3 class="title">
      {{ title }}
    </h3>
    <div class="card-content">
      <slot />
    </div>
  </section>
</template>
<style lang="scss" scoped>
.card-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.title {
  width: calc(100% - 40px);
  height: 45px;
  margin: auto;
  line-height: 44px;
  border-bottom: 1px solid #efefef;
}

.card-content {
  height: calc(100% - 45px);
}
</style>
