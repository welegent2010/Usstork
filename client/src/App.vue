<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">美股计算器</h1>
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link 
                to="/" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'bg-gray-100 text-gray-900': $route.path === '/' }"
              >
                持仓概览
              </router-link>
              <router-link 
                to="/add-trade" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'bg-gray-100 text-gray-900': $route.path === '/add-trade' }"
              >
                添加交易
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">{{ authStore.user?.email }}</span>
            <button 
              @click="handleLogout"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>