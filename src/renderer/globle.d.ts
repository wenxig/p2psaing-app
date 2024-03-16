import type { AxiosResponse } from 'axios';
import type { WindowConfig } from '../main/hook/useWindow'
import type { IpcRendererEvent } from 'electron';
import type { Ipc } from './src/api/ipc';
type ipc = Ipc
declare module "vue" {
  interface ComponentCustomProperties {
    $ipc: ipc
    $window: typeof window
  }
}
declare module 'axios' {
  interface AxiosDefaults {
    retry: number,
    retryDelay: number,
  }
  interface InternalAxiosRequestConfig {
    retry: number,
    retryDelay: number,
    __retryCount?: number
  }
}
declare global {
  type MethodType<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];
  interface Window {
    getToken(of: 'github' | 'smms'): string
    instance_name: {
      my: number,
      parent: number
    }
    goHome: () => void
    ipc: ipc
    plugins: AppPlugin.Plugin[],
    props: Record<string, any>,
    ck_getData(md: string): void
  }
}