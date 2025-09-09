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
    // Use esbuild for minification instead of terser
    minify: 'esbuild',
    sourcemap: false,
  },
  preview: {
    // Enable SPA routing for preview mode
    historyApiFallback: true,
  },
  // Ensure base URL is correct for deployment
  base: './',
})