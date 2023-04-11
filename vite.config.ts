import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/*.ts',
      fileName: "[name]",
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      input: {
        index: "./src/index.ts",
        utils: "./src/utils.ts"
      },
      external: ['@antv/x6'],
      output: {
        globals: {
          '@antv/x6': 'X6'
        }
      }
    }
  }
})
