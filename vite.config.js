import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
  
  // Development server configuration
  server: {
    port: 5174,
    host: true,
    // Proxy API calls in development
    proxy: mode === 'development' ? {
      '/api': {
        target: 'https://bank-4-yt2f.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    } : undefined
  },
  
  // Preview configuration for local testing
  preview: {
    port: 4173,
    host: true
  }
}))
