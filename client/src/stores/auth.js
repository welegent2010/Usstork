import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data
      setAuth(user, token)
      return { success: true }
    } catch (error) {
      clearAuth()
      return { 
        success: false, 
        error: error.response?.data?.error || '登录失败' 
      }
    }
  }

  const register = async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password })
      const { user, token } = response.data
      setAuth(user, token)
      return { success: true }
    } catch (error) {
      clearAuth()
      return { 
        success: false, 
        error: error.response?.data?.error || '注册失败' 
      }
    }
  }

  const logout = () => {
    clearAuth()
  }

  const fetchUser = async () => {
    try {
      const response = await api.get('/user/me')
      user.value = response.data.user
      return { success: true }
    } catch (error) {
      clearAuth()
      return { success: false }
    }
  }

  // Initialize auth state if token exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    fetchUser()
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    fetchUser
  }
})