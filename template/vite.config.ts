import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { name } from './package.json'
import config from './server/proxy-config.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: name,
  build: {
    outDir: './dist/static'
  },
  server: {
    proxy: config
  }
})
