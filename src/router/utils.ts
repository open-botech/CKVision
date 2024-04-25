import { Router } from 'vue-router'
import { menuRoutesList } from './index'

export function addRouteHooks(router: Router) {
  router.beforeEach((to, from, next) => {
    const notLogin = menuRoutesList.find((item: any) => to.name === item.name)
    if (notLogin) {
      const connection = localStorage.getItem('connection')
      if (connection) {
        next()
      } else {
        localStorage.removeItem('connection')
        router.push('/login')
      }
    } else {
      localStorage.removeItem('connection')
      next()
    }
  })

  return router
}
