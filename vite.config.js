import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/send': {
        target: 'http://127.0.0.1:7799/',
        changeOrigin: true
      },
      '/receive': {
        target: 'http://127.0.0.1:7799/',
        changeOrigin: true
      },
      '/nas': {
        target: 'https://nas.huhaorui.com:8103/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nas/, '')
      }
    }
  }
})
