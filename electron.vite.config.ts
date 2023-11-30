import path, { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin, defineViteConfig } from 'electron-vite'
import tailwindcss from 'tailwindcss';
import postCssPxToRem from "postcss-pxtorem";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url';
import package_json from './package.json';
import fs from "fs"
import { createHtmlPlugin } from 'vite-plugin-html'
import inspect from 'vite-plugin-inspect';
import replace from '@rollup/plugin-replace';
export default defineConfig(({ command: mode }) => {
  function onlyBuild(buildValue: any, defaultValue?: any) {
    if (mode == 'build') {
      if (buildValue instanceof Function && defaultValue instanceof Array) {
        return buildValue(...defaultValue)
      }
      return buildValue
    }
    if (defaultValue instanceof Array) {
      return defaultValue[0]
    }
    return defaultValue
  }
  onlyBuild(() => [path.join(__dirname, './electron-builder.yml'), path.join(__dirname, './dev-app-update.yml')].forEach(val => fs.writeFileSync(val, fs.readFileSync(val).toString().replace(/__APP_NAME__/g, package_json.name))))
  return {
    main: {
      plugins: [bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }), externalizeDepsPlugin()],
      build: {
        ...onlyBuild({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
          minify: "terser",
        }, {}),
        outDir: 'dist/main'
      }
    },
    preload: {
      plugins: [bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }), externalizeDepsPlugin()],
      build: {
        ...onlyBuild({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
          minify: "terser",
        }, {}),
        outDir: 'dist/preload'
      }
    },
    renderer: defineViteConfig({
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
        inspect(),
        replace({
          'process.env': JSON.stringify({
            NODE_ENV: import.meta.env,
          }),
          '__APP_NAME__': `${package_json.name}`,
          '__APP_VERSION__': `${package_json.version}`
        }),
        createHtmlPlugin({
          minify: true,
          entry: 'src/main.ts',
          inject: {
            data: {
              title: package_json.name,
            },
            tags: [
              {
                injectTo: 'body-prepend',
                tag: 'div',
                attrs: {
                  id: 'app',
                  style: 'height: 100vh;z'
                },
              },
            ],
          },
        }),
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
            tailwindcss,
            postCssPxToRem,
          ]
        }
      },
      build: {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        minify: "terser",
        outDir: 'dist/renderer'
      },

    }),
  }
})
