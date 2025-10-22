import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'; // Import path module

export default defineConfig({
  // Use a relative path for deployment
  base: './', 
  
  // Explicitly tell Vite where the root is
  root: path.resolve(__dirname, './'),

  plugins: [react()],
})
