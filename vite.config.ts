import { resolve } from 'path'
import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import proxy from './config/vite/proxy'
import { APP_TITLE, VITE_PORT } from './config/constant'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import checker from 'vite-plugin-checker'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: pathResolve('/src') + '/',
      },
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        // 'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
    ],
  },
  server: {
    hmr: { overlay: true },
    port: VITE_PORT,
    open: true,
    cors: true,
    host: '0.0.0.0',
    proxy,
  },
  plugins: [
    vue(),
    monacoEditorPlugin({}),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
    checker({
      typescript: true,
    }),
  ],
  build: {
    outDir: APP_TITLE,
    rollupOptions: {
      output: {
        manualChunks(id, other) {
          if (!id.includes('node_modules')) {
            if (id.includes('components/sql')) {
              return id.split('components/sql')[1].split('/')[1].replace('.vue', '')
            }
          }
        },
      },
    },
  },
})
