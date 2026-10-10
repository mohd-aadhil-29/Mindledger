import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const apiProxy = { '/api': 'http://127.0.0.1:3001' }
export default defineConfig({ plugins: [react()], server: { proxy: apiProxy }, preview: { proxy: apiProxy } })
