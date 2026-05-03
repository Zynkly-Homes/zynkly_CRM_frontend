import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split core React runtime from router (router is large ~430 KiB)
          'vendor-react':  ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-state':  ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'vendor-forms':  ['formik', 'yup'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns'],
          // lucide-react is intentionally NOT here — Rollup will tree-shake unused icons
          'vendor-ui':     ['clsx', 'framer-motion', '@headlessui/react'],
          'vendor-date':   ['date-fns', 'dayjs'],
          'vendor-http':   ['axios'],
        },
      },
    },
  },
});
