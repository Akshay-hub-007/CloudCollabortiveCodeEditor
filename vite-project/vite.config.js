import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: process.env.PORT || 4173, // Use the PORT environment variable
    host: true, // Allow network access
  },
  plugins: [react()],
})
