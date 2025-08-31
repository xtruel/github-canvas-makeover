import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/posts': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/media': 'http://localhost:4000',
      '/articles': 'http://localhost:4000',
      '/admin': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
