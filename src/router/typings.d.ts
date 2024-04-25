declare namespace AppRoute {
  type Route<T = any> = {
    path: string
    name: string
    component?: T
    meta: RouteMeta
    redirect?: string
    children?: Route[]
  }

  type RouteMeta = {
    title?: string
    icon?: string
    hidden?: boolean
    breadcrumb?: boolean
  }
}
