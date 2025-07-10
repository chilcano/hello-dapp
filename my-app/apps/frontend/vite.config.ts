import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Only proxy for getLastBlock to backend local in dev
        '/api/getLastBlock': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
