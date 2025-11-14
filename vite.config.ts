import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This will load all variables from the relevant .env file.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // The define option allows us to replace global variables at build time.
    // We are creating a process.env object on the client-side that mirrors
    // the VITE_ prefixed variables from our .env file. This makes configuration
    // access consistent and robust.
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_DODO_PUBLISHABLE_KEY': JSON.stringify(env.VITE_DODO_PUBLISHABLE_KEY),
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'process.env.VITE_DODO_HOBBYIST_PRODUCT_ID': JSON.stringify(env.VITE_DODO_HOBBYIST_PRODUCT_ID),
      'process.env.VITE_DODO_PRO_PRODUCT_ID': JSON.stringify(env.VITE_DODO_PRO_PRODUCT_ID),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});