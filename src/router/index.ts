import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/members',
    name: 'MemberList',
    component: () => import('@/views/MemberList.vue'),
    meta: {
      title: '成员管理',
    },
  },
  {
    path: '/member/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue'),
    meta: {
      title: '成员详情',
    },
  },
  {
    path: '/add-record/:memberId',
    name: 'AddRecord',
    component: () => import('@/views/AddRecord.vue'),
    meta: {
      title: '添加记录',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '设置',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 儿童成长记录`;
  }
  next();
});

export default router;
