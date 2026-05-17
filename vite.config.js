import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/backend/**', '**/node_modules/**']
    },
    proxy: {
      '/scan': 'http://localhost:8000',
      '/scan-local': 'http://localhost:8000',
      '/bob': 'http://localhost:8000',
      '/bookings': 'http://localhost:8000',
      '/menu': 'http://localhost:8000',
    },
  },
})
