import { defineStore } from 'pinia'
import piniaStore from '@/store/index'
import { AppState } from './types'

export const useAppStore = defineStore(
  // 唯一ID
  'app',
  {
    state: () => ({
      title: 'Fast-admin-vue3,一个快速开箱即用的Vue3+Vite模板',
    }),
    getters: {},
    actions: {
      updateSettings(partial: Partial<AppState>) {
        this.$patch(partial)
      },
    },
  },
)

export function useAppOutsideStore() {
  return useAppStore(piniaStore)
}
