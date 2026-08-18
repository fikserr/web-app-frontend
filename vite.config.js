// vite.config.js
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // bind to all addresses so ngrok can reach the dev server
      host: true,
      port: 5173,
      strictPort: false,
      allowedHosts: true,
      // local proxy to bypass CORS in development. Configure VITE_API_PROXY_TARGET to change target.
      proxy: (() => {
        const target = process.env.VITE_API_PROXY_TARGET || 'https://ssglink.uz'
        return {
          // forward any request starting with /SERVER to the backend host
          '/SERVER': {
            target,
            changeOrigin: true,
            secure: false,
          },
        }
      })(),
      // HMR / websocket settings — if you expose via ngrok set NGROK_HOST env to the ngrok hostname
      hmr: (() => {
        const ngrokHost = process.env.NGROK_HOST || process.env.VITE_HMR_HOST
        if (ngrokHost) {
          return {
            protocol: 'wss',
            host: ngrokHost,
            // ngrok HTTPS tunnels use port 443 for wss
            clientPort: 443,
          }
        }
        return undefined
      })(),
    },
  };
});
