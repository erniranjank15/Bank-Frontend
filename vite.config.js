import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'react-toastify']
        }
      }
    }
  },
  
  // Preview configuration for local testing
  preview: {
    port: 4173,
    host: true
  },
  
  // Development server configuration
  server: {
    port: 5174,
    host: true
  }
})
