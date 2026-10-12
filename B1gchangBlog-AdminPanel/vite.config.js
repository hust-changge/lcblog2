import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 部署在 Nginx 子路径 /admin/ 时使用；本地 dev 不受影响
  base: '/admin/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
   server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18080',  // 后端地址
        changeOrigin: true,  // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/twikoo-proxy': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const p = path.replace(/^\/twikoo-proxy/, '')
          return p || '/'
        }
      }
    }
  }
})
