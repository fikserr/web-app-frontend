// vite.config.js
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const username = env.VITE_API_USERNAME;
  const password = env.VITE_API_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: "all",
      proxy: {
        "/api": {
          target: "https://shopick.inmind.uz",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/WEB_PROSYS_BOT/hs/web.app"),
          secure: false,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Authorization", `Basic ${credentials}`);
            });
            proxy.on("proxyRes", (proxyRes) => {
              delete proxyRes.headers["www-authenticate"];
            });
          },
        },
      },
    },
  };
});
