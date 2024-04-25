import { ProxyOptions } from 'vite'
type ProxyTargetList = Record<string, ProxyOptions>

const init: ProxyTargetList = {
  '/ml': {
    target: 'http://172.16.1.192:8080/',
    changeOrigin: true,
    rewrite: (path) => {
      return path.replace(/^\/ml/, '')
    },
  },
}

export default init
