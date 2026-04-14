import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT || 5174),
      strictPort: true
    },
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      target: 'es2019',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('echarts') || id.includes('zrender')) {
              return 'vendor-echarts';
            }

            if (id.includes('@toast-ui/editor')) {
              return 'vendor-editor';
            }

            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'vendor-element-plus';
            }

            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue';
            }

            if (id.includes('axios') || id.includes('dayjs')) {
              return 'vendor-utils';
            }

            return 'vendor-misc';
          }
        }
      }
    }
  };
});
