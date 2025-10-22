import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // This tells Vite that the base path for assets is relative
  base: './', 
  // This explicitly sets the project root directory
  root: './', 
  plugins: [react()],
})
