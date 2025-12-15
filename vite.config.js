import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import license from "rollup-plugin-license"
import path from "path"

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    root: path.resolve(__dirname),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
      extensions: [".ts", ".tsx", ".js", ".jsx"]
    },

    server: {
      watch: {
        ignored: ["**/node_modules/**"]
      },
      hmr: {
        overlay: true
      }
    },

    build: {
      outDir: "dist",
      target: "esnext",
      emptyOutDir: true,
      sourcemap: isDev,
      minify: isDev ? false : "terser",
      terserOptions: {
        format: {
          comments: false
        }
      },
      rollupOptions: {
        external: [],
        input: {
          index: path.resolve(__dirname, "src/index.tsx")
        },
        plugins: [
          license({
            thirdParty: {
              output: {
                file: path.join(__dirname, "dist", "LICENSE.txt"),
              }
            },
          }),
        ],
      },
    },

    plugins: [
      react(),
      tailwindcss()
    ]
  }
});