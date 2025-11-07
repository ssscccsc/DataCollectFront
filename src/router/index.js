import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'menu.dashboard', icon: 'Odometer', requiresAuth: true },
      },
    ],
  },
  {
    path: '/region',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Region',
        component: () => import('@/views/region/index.vue'),
        meta: { title: 'menu.region', icon: 'Location' },
      },
    ],
  },
  {
    path: '/network-type',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'NetworkType',
        component: () => import('@/views/network-type/index.vue'),
        meta: { title: 'menu.networkType', icon: 'Connection' },
      },
    ],
  },
  {
    path: '/executor',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Executor',
        component: () => import('@/views/executor/index.vue'),
        meta: { title: 'menu.executor', icon: 'Monitor' },
      },
    ],
  },
  {
    path: '/ue',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Ue',
        component: () => import('@/views/ue/index.vue'),
        meta: { title: 'menu.ue', icon: 'Mobile' },
      },
    ],
  },
  {
    path: '/logic-environment',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'LogicEnvironment',
        component: () => import('@/views/logic-environment/index.vue'),
        meta: { title: 'menu.logicEnvironment', icon: 'Setting' },
      },
    ],
  },
  {
    path: '/test-case-set',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'TestCaseSet',
        component: () => import('@/views/test-case-set/index.vue'),
        meta: { title: 'menu.testCaseSet', icon: 'Document' },
      },
      {
        path: 'detail/:id',
        name: 'TestCaseSetDetail',
        component: () => import('@/views/test-case-set/detail.vue'),
        meta: { title: 'pageTitle.testCaseSetDetail', icon: 'Document' },
        hidden: true,
      },
    ],
  },
  {
    path: '/collect-strategy',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'CollectStrategy',
        component: () => import('@/views/collect-strategy/index.vue'),
        meta: { title: 'menu.collectStrategy', icon: 'Operation' },
      }, 
    ],
  },
  {
    path: '/collect-task',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'CollectTask',
        component: () => import('@/views/collect-task/index.vue'),
        meta: { title: 'menu.collectTask', icon: 'List' },
      },
    ],
  },
  {
    path: '/user',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'index',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth) {
    if (!token) {
      // 需要登录但未登录，跳转到登录页
      next('/login')
    } else {
      // 已登录，确保活跃时间检查已启动
      import('@/utils/request').then(({ startActivityCheck }) => {
        startActivityCheck()
      })
      next()
    }
  } else {
    // 不需要登录的页面（如登录页）
    if (to.path === '/login' && token) {
      // 已登录，跳转到首页
      next('/')
    } else {
      next()
    }
  }
})

export default router
