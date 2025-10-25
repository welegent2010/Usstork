import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/detail/:code',
    name: 'StockDetail',
    component: () => import('../views/StockDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-trade',
    name: 'AddTrade',
    component: () => import('../views/AddTrade.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  // 使用 import.meta.env.BASE_URL 以适配 GitHub Pages 子路径（例如 /Usstork/）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 未登录跳转到仓库子路径下的 login，createWebHistory 已自动处理 BASE_URL
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router