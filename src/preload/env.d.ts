/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PRELOAD_VITE_GITHUB_KEY: string
  readonly PRELOAD_VITE_SMMS_KEY: string
  readonly PRELOAD_VITE_TINYWEBDB_USER: string
  readonly PRELOAD_VITE_TINYWEBDB_SECRET: string
  readonly PRELOAD_VITE_MONGODB_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}