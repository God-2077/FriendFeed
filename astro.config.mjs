import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import serviceWorker from "astrojs-service-worker";
import { serviceWorkerConfig } from "./src/config/config";

export default defineConfig({
  integrations: [
    react(),
    ...(serviceWorkerConfig.enabled ? [serviceWorker({
        ...(serviceWorkerConfig.workbox || {}),
    })] : []),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@config': '/src/config',
        '@components': '/src/components',
      },
    },
  },
});
