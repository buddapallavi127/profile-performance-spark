// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080, // Your frontend will typically run on this port
    proxy: {
      '/api': { // When your frontend makes a request to '/api' (e.g., '/api/analyze-resume')
        target: 'http://localhost:3001', // Vite will forward it to your Node.js backend server
        changeOrigin: true, // Necessary for requests to work correctly across different origins
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // Typically not needed if backend path matches frontend
      },
    },
  },
});