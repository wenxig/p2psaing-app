/// <reference types="vitest" />
import path from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin, defineViteConfig } from 'electron-vite'
import tailwindcss from 'tailwindcss';
import postCssPxToRem from "postcss-pxtorem";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url';
import package_json from './package.json';
import fs from "fs"
import { createHtmlPlugin } from 'vite-plugin-html'
import inspect from 'vite-plugin-inspect';
import replace from '@rollup/plugin-replace';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor'
//@ts-ignore  堆栈深度过高
const rendererConfig = defineViteConfig({
  //@ts-ignore  堆栈深度过高
  resolve: {
    alias: {
      '@c': fileURLToPath(new URL('./src/renderer/src/controller', import.meta.url)),
      '@': fileURLToPath(new URL('./src/renderer/src', import.meta.url)),
      '@h': fileURLToPath(new URL('./src/renderer/src/hook', import.meta.url)),
      '@l': fileURLToPath(new URL('./src/renderer/src/layout', import.meta.url)),
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
              style: 'height: 100vh;'
            },
          },
        ],
      },
    }),
    vue(),
    vueJsx(),
    (<any>monacoEditorPlugin).default(<IMonacoEditorOpts>{
      languageWorkers: ['editorWorkerService', 'css'],
      features: ["coreCommands", "find", "format", "folding", 'smartSelect', 'snippets', 'suggest', 'hover']
    }),
    AutoImport({
      resolvers: [
        NaiveUiResolver(),
        ElementPlusResolver()
      ],
    }),
    Components({
      resolvers: [
        NaiveUiResolver(),
        ElementPlusResolver()
      ],
    })
  ],
  //@ts-ignore
  css: {
    postcss: {
      plugins: [
        //@ts-ignore
        tailwindcss,
        //@ts-ignore
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
  }
})

export default defineConfig(({ command: mode }) => {
  const onlyBuild = <T>(buildValue: T, defaultValue?: any): T => mode == 'build' ? buildValue : defaultValue
  const onlyBuildRun = <T extends (...args: any[]) => any>(fn: T, ...props: Parameters<T>): ReturnType<T> | void => mode == 'build' && fn(...props)
  onlyBuildRun(() => [path.join(__dirname, './electron-builder.yml'), path.join(__dirname, './dev-app-update.yml')].forEach(val => fs.writeFileSync(val, fs.readFileSync(val).toString().replace(/__APP_NAME__/g, package_json.name))))
  return {
    main: {
      plugins: [
        replace({
          '__APP_NAME__': `${package_json.name}`,
          '__APP_VERSION__': `${package_json.version}`
        }),
        bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }),
        externalizeDepsPlugin(),
      ],
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
        outDir: 'dist/main',
      }
    },
    preload: {
      plugins: [
        replace({
          '__APP_NAME__': `${package_json.name}`,
          '__APP_VERSION__': `${package_json.version}`
        }), bytecodePlugin({ protectedStrings: ["https://tinywebdb.appinventor.space/api"] }), externalizeDepsPlugin()],
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
    renderer: rendererConfig
  }
})
