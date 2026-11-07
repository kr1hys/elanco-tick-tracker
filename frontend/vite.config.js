import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The dev server proxies /api to the Flask backend, so the browser sees one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5001',
    },
  },
})
