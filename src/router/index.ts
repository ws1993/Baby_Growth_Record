import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/babies',
    name: 'Babies',
    component: () => import('../views/Babies.vue')
  },
  {
    path: '/babies/:id',
    name: 'BabyDetail',
    component: () => import('../views/BabyDetail.vue')
  },
  {
    path: '/growth/:id',
    name: 'GrowthRecords',
    component: () => import('../views/GrowthRecords.vue')
  },
  {
    path: '/milestones/:id',
    name: 'Milestones',
    component: () => import('../views/Milestones.vue')
  },
  {
    path: '/photos/:id',
    name: 'Photos',
    component: () => import('../views/Photos.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router