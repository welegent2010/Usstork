import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // GitHub Pages 子路径，必须设置为仓库名，确保资源路径正确
  base: '/Usstork/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  // 生产构建输出到仓库根目录的 docs，用于 GitHub Pages 发布
  build: {
    outDir: '../docs', // 将构建产物输出到仓库根的 docs 目录
    emptyOutDir: true  // 构建前清空输出目录
  },
  define: {
    'process.env': {
      VITE_API_BASE: process.env.VITE_API_BASE || 'http://localhost:4000/api'
    }
  }
})