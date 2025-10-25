<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创建账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          开始管理您的美股投资组合
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
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
              class="form-input"
              placeholder="密码（至少6位）"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="form-input rounded-b-md"
              placeholder="确认密码"
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
            class="btn-success w-full flex justify-center py-2 px-4 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 disabled:opacity-50"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-primary-600 hover:text-primary-500 text-sm">
            已有账户？立即登录
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const passwordsMatch = computed(() => form.password === form.confirmPassword)

const handleRegister = async () => {
  if (!passwordsMatch.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (form.password.length < 6) {
    error.value = '密码长度至少为6位'
    return
  }

  loading.value = true
  error.value = ''
  
  const result = await authStore.register(form.email, form.password)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>