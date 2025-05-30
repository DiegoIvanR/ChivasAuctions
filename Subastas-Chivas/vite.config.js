import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // already enabled if you run with --host
    allowedHosts: [
      'density-jeremy-order-wiki.trycloudflare.com',
      'localhost',
      '127.0.0.1',
      // add more if needed
    ],
  },
})
