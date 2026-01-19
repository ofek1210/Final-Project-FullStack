import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../server/certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../server/certs/localhost.pem')),
    },
  },
})
