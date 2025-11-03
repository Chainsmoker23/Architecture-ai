import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // No 'define' block is needed for VITE_ prefixed variables 
  // when using Vite's standard `import.meta.env`.
});
