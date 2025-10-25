<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          美股持仓成本计算器
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input rounded-t-md"
              placeholder="邮箱地址"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form-input rounded-b-md"
              placeholder="密码"
            />
          </div>
        </div>

        <div v-if="error" class="text-danger text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full flex justify-center py-2 px-4 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/register" class="text-primary-600 hover:text-primary-500 text-sm">
            还没有账户？立即注册
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(form.email, form.password)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>