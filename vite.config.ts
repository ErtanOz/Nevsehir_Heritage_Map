import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const cesiumSource = 'node_modules/cesium/Build/Cesium';
    const cesiumBaseUrl = 'cesium';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        viteStaticCopy({
          targets: [
            {
              src: `${cesiumSource}/{Workers,ThirdParty,Assets,Widgets}/**/*`,
              dest: cesiumBaseUrl,
              rename: { stripBase: 4 },
            },
          ],
        }),
      ],
      define: {
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
