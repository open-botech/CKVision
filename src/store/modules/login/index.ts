import { defineStore } from 'pinia'
import piniaStore from '@/store/index'
import { Connection } from './types'

export const useLoginStore = defineStore(
  // 唯一ID
  'login',
  {
    state: () => ({
      connection: {
        connectionName: '',
        connectionUrl: '',
        username: '',
        password: '',
        params: '',
      },
      previousConnection: {
        connectionName: '',
        connectionUrl: '',
        username: '',
        password: '',
        params: '',
      },
    }),
    persist: {
      enabled: true,
      strategies: [
        { key: 'connection', storage: localStorage, paths: ['connection'] },
        { key: 'previousConnection', storage: localStorage, paths: ['previousConnection'] },
      ],
    },
    getters: {},
    actions: {
      setConnection(connection: Connection) {
        this.connection = connection
        this.previousConnection = connection
      },
    },
  },
)

export function useLioginOutsideStore() {
  return useLoginStore(piniaStore)
}
