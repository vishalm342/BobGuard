import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/scan': 'http://localhost:5000',
      '/scan-local': 'http://localhost:5000',
      '/bookings': 'http://localhost:5000',
      '/menu': 'http://localhost:5000',
    },
  },
})
