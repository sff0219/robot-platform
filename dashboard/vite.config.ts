import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/robot": {
        target: "http://robot.local",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/robot/, ""),
      },
      "/api/prometheus": {
        target: "http://localhost:9090",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/prometheus/, ""),
      },
      "/api/loki": {
        target: "http://localhost:3100",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/loki/, "/loki/api/v1"),
      },
    },
  },
});
