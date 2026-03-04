import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
})
