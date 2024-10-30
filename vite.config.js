import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
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
                target: 'https://together.huhaorui.com/',
                changeOrigin: true
            },
            '/receive': {
                target: 'https://together.huhaorui.com/',
                changeOrigin: true
            },
            '/share': {
                target: 'https://together.huhaorui.com/',
                changeOrigin: true
            },
            '/nas': {
                target: 'https://huhaorui.com:8103/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/nas/, '')
            }
        }
    }
})
