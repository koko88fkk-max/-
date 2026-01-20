import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // يضمن عمل الروابط والملفات بشكل صحيح على GitHub Pages
})
