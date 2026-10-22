import { defineConfig } from 'electron-vite';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  main: {
    build: {
      // https://electron-vite.org/guide/dev#dependencies-vs-devdependencies
      // For the main process and preload, the best practice is to externalize dependencies and only bundle our own code.
      target: 'node24.15',
      sourcemap: true,
    },
  },
  preload: {
    build: {
      target: 'node24.15',
      sourcemap: true,
      rollupOptions: {
        output: {
          format: 'cjs',
        },
      },
    },
  },
  renderer: {
    plugins: [
      react(),
      process.env['ANALYZE'] === 'true' && (visualizer({
        filename: 'out/renderer/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }) as unknown as PluginOption),
    ].filter(Boolean) as PluginOption[],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import'],
        },
      },
    },
    build: {
      target: 'chrome148',
      sourcemap: true,
      chunkSizeWarningLimit: 1.5e6,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'vendor-leaflet';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port: 3001,
      host: '127.0.0.1',
    },
  },
});
