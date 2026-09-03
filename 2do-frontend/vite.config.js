import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    // Emit source maps only in dev; keep prod bundle clean
    sourcemap: false,
    // Warn when a chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split vendor code from app code for better long-term caching
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          icons: ["lucide-react", "react-icons"],
        },
      },
    },
  },
});
