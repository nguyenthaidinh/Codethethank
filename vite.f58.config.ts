import { defineConfig, mergeConfig } from "vite";
import base from "./vite.config";

// Isolated integration preview; does not change the dev server used by another chat.
export default mergeConfig(
  base,
  defineConfig({
    optimizeDeps: { entries: ["index.html"] },
    build: { outDir: "backend/proof-f58/game-build" },
    preview: {
      host: "127.0.0.1",
      port: 4198,
      strictPort: true,
      proxy: {
        "/api/v1": { target: "http://127.0.0.1:8057", changeOrigin: true },
      },
    },
    server: {
      host: "127.0.0.1",
      port: 4198,
      strictPort: true,
      watch: {
        ignored: [
          "**/backend/**",
          "**/docs/**",
          "**/dist*/**",
          "**/*-dist/**",
          "**/n4-validation/**",
        ],
      },
      proxy: {
        "/api/v1": { target: "http://127.0.0.1:8057", changeOrigin: true },
      },
    },
  }),
);
