import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    allowedHosts: ["05c6fbf9a885.ngrok-free.app"], // ngrok domeni shu yerga yoziladi
  },
})
