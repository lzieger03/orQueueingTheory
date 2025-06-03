import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          dnd: ['react-dnd', 'react-dnd-html5-backend'],
          ai: ['@tensorflow/tfjs'],
          state: ['xstate'],
          icons: ['lucide-react'],
          utils: ['lodash', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'react-dnd', 'react-dnd-html5-backend']
  }
})
