import axios from 'axios'

const resolveBaseURL = () => {
  const envBase = import.meta.env.VITE_API_BASE
  const isHttp = typeof envBase === 'string' && /^https?:\/\//.test(envBase)
  if (isHttp) return envBase
  if (import.meta.env.DEV) return '/api'
  return 'https://backend-production-559d.up.railway.app/api'
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // 在 GitHub Pages 子路径下（例如 /Usstork/），确保跳转到正确的登录地址
      // 使用 BASE_URL 拼接 login，避免跳到根域名的 /login 导致找不到页面
      window.location.href = (import.meta.env.BASE_URL || '/') + 'login'
    }
    return Promise.reject(error)
  }
)

export default api