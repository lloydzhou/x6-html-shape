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
        utils: "./src/utils.ts",
        react: "./src/react.tsx",
        react17: "./src/react17.tsx",
        portal: "./src/portal.tsx",
      },
      external: ['@antv/x6', 'react', 'react-dom'],
      output: {
        globals: {
          '@antv/x6': 'X6',
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
