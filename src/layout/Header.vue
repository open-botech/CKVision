<script setup lang="ts">
import logo from '@/assets/images/logo.svg'
import logout from '@/assets/images/login/logout.svg'
import { useRoute, useRouter } from 'vue-router'
import { useGoTo } from './hooks'
import { RouteName } from './types'
import i18n from '@/i18n'

const router = useRouter()
const route = useRoute()
const goTo = useGoTo()

const nvaList = [
  RouteName.Metrics,
  RouteName.SQL,
  RouteName.Processes,
  RouteName.Graph,
  RouteName.HistorySQL,
]

const hasRouteName = (item: string) => {
  return (route.name as string)?.startsWith(item)
}

const logoutFunc = () => {
  router.push({
    path: '/login',
  })
}
const goMetrics = () => {
  goTo(RouteName.Metrics)
}

const handleChangeLocale = (locale: 'zh' | 'en') => {
  localStorage.setItem('locale', locale)
  i18n.global.locale = locale
}
</script>

<template>
  <div class="header">
    <div class="logo-container" @click="goMetrics">
      <img :src="logo" alt="ClickCat" title="ClickCat" />
      <span>ClickCat</span>
    </div>
    <div class="nav-container">
      <nav class="nav">
        <span
          v-for="item in nvaList"
          :key="item"
          :class="{ active: hasRouteName(item) }"
          @click="goTo(item)"
        >
          {{ $t(item) }}
        </span>
      </nav>
      <div class="logout">
        <img
          :src="logout"
          alt="logout"
          style="margin-left: 15px"
          title="logout"
          @click="logoutFunc"
        />
        <span @click="logoutFunc">{{ $t('Sign out') }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  width: 100%;
  height: 64px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  z-index: 10;
}
.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;

  span {
    font-size: 20px;
    color: #10223e;
  }
}
.nav-container {
  display: flex;
  height: 100%;
}
.nav {
  margin-right: 30px;

  span {
    display: inline-block;
    margin-left: 10px;
    padding: 0 20px;
    font-weight: bold;
    line-height: 62px;
    cursor: pointer;
    box-sizing: border-box;

    &.active {
      color: #ffb300;
      border-bottom: #ffb300 2px solid;
    }
  }
}
.logout {
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    width: 20px;
  }
  img:hover + span {
    color: var(--el-color-primary);
  }
  span:hover {
    color: var(--el-color-primary);
  }
  span {
    display: inline-block;
    padding-left: 10px;
    font-size: 14px;
    color: rgba(62, 62, 69, 0.65);
  }
}
</style>
