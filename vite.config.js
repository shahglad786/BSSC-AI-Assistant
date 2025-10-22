import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // FIX: Force relative paths for deployment on services like Vercel/Netlify
  base: './', 
  plugins: [react()],
})
