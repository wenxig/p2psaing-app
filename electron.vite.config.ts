import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin, defineViteConfig } from 'electron-vite'
import tailwindcss from 'tailwindcss';
import tailwindcssConfig from './tailwind.config';
import postCssPxToRem from "postcss-pxtorem";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url';

export default defineConfig(() => {
  return {
    main: {
      plugins: [bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }), externalizeDepsPlugin()],
      // build: {
      //   terserOptions: {
      //     compress: {
      //       drop_console: true,
      //       drop_debugger: true,
      //     },
      //   },
      //   minify: "terser",
      // }
    },
    preload: {
      plugins: [bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }), externalizeDepsPlugin()],
      build: {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        minify: "terser",
      }
    },
    renderer: defineViteConfig({
      define: {
        'process.env': {
          NODE_ENV: import.meta.env,
          APP_NAME: 'p2psaing-app',
        },
      },
      resolve: {
        alias: {
          '@t': resolve('src/renderer/src/types'),
          '@': fileURLToPath(new URL('./src/renderer/src', import.meta.url)),
          '@h': fileURLToPath(new URL('./src/renderer/src/hook', import.meta.url)),
          '@l': fileURLToPath(new URL('./src/renderer/src/layout', import.meta.url)),
          '@i': fileURLToPath(new URL('./src/renderer/src/i18n', import.meta.url)),
          '@s': fileURLToPath(new URL('./src/renderer/src/store', import.meta.url)),
          '@p': fileURLToPath(new URL('./src/renderer/src/views', import.meta.url)),
          '@a': fileURLToPath(new URL('./src/renderer/src/api', import.meta.url))
        }
      },
      plugins: [
        {
          apply: 'build' // 仅在生产环境下使用
        },
        vue(),
        vueJsx(),
        AutoImport({
          resolvers: [
            ElementPlusResolver(),
            IconsResolver({
              prefix: "Icon"
            })
          ],
        }),
        Components({
          resolvers: [
            ElementPlusResolver(),
            NaiveUiResolver(),
            IconsResolver({
              enabledCollections: ["ep"]
            })
          ],
        }),
        Icons({
          autoInstall: true
        })
      ],
      css: {
        postcss: {
          plugins: [
            tailwindcss(tailwindcssConfig),
            postCssPxToRem({
              rootValue: 16,
              propList: ["*"], 
            }),
          ]
        }
      }
    }),
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      minify: "terser",
    }
  }
})
