import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // treat Grasshopper files as assets: importing one gives you its URL
  assetsInclude: ['**/*.gh'],
})