import type { AxiosResponse } from 'axios';
import type { WindowConfig } from '../main/hook/useWindow'
import type { IpcRendererEvent, Clipboard } from 'electron';
export type { Ipc } from './src/api/ipc';
import type { Ipc } from './src/api/ipc';
declare module "vue" {
  interface ComponentCustomProperties {
    $ipc: Ipc
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
    instance_name: ReturnType<Ipc['getInstance']>
    goHome: () => void
    ipc: Ipc
    plugins: AppPlugin.Plugin[]
    props: Record<string, any>
    ck_getData(md: string): void
  }
  interface JSON {
    safetyParse(value: any): any
  }
}