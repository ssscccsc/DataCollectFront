import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'menu.dashboard', icon: 'Odometer' },
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
