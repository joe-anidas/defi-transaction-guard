import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    historyApiFallback: true, // For dev server SPA routing
  },
  build: {
    rollupOptions: {
      // Ensure assets are properly handled
      external: [],
    },
  },
  preview: {
    // Enable SPA routing for preview mode
    historyApiFallback: true,
  },
})