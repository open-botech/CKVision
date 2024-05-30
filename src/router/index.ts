import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
type RouteItem = RouteRecordRaw & { meta: AppRoute.RouteMeta }

export const menuRoutesList = [
  {
    name: 'GraphAdd',
    path: '/graph/add',
    meta: {
      title: 'Graph',
    },
    component: () => import('@/views/graph/add.vue'),
  },
  {
    name: 'Graph',
    path: '/graph',
    props: true,
    meta: {
      title: 'Graph',
    },
    component: () => import('@/views/graph/index.vue'),
  },
  {
    name: 'GraphResult',
    path: '/graph/result',
    props: true,
    meta: {
      title: 'GraphResult',
    },
    component: () => import('@/views/graph/result.vue'),
  },
  {
    name: 'History SQL',
    path: '/history-sql',
    props: true,
    meta: {
      title: 'History SQL',
    },
    component: () => import('@/views/history-sql/index.vue'),
  },
  {
    name: 'Metrics',
    path: '/metrics',
    props: true,
    meta: {
      title: 'Metrics',
    },
    component: () => import('@/views/metrics/index.vue'),
  },
  {
    name: 'Processes',
    path: '/processes',
    props: true,
    meta: {
      title: 'Processes',
    },
    component: () => import('@/views/processes/index.vue'),
  },
  {
    name: 'SQL',
    path: '/sql',
    props: true,
    meta: {
      title: 'SQL',
    },
    component: () => import('@/views/sql/index.vue'),
  },
]

const routes: RouteItem[] = [
  {
    path: '',
    component: () => import('@/layout/index.vue'),
    meta: {},
    redirect: '/sql',
    children: menuRoutesList,
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    meta: {},
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteItem[],
})
