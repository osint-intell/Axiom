import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: 'src/main/index.js'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: 'src/preload/index.js'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: false
    },
    build: {
      rollupOptions: {
        input: {
          index: 'src/renderer/index.html'
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})
