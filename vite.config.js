import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://v6.exchangerate-api.com/v6', // Use full API base URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  },
  // Environment configuration for Vercel
  define: {
    'process.env': {
      VITE_API_BASE: JSON.stringify(process.env.VITE_API_BASE),
      VITE_EXCHANGE_API_KEY: JSON.stringify(process.env.VITE_EXCHANGE_API_KEY)
    }
  }
});