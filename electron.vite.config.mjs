import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('electron/main/index.js')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('electron/preload/index.js')
        }
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist-electron/renderer',
      rollupOptions: {
        input: resolve('index.html')
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [vue()]
  }
})
