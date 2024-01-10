import type { AxiosResponse } from 'axios';
import type { BrowserOptions, ChildBrowserOptions } from '../main/hook/useWindow'

type ipc = {
  listen(path: string, fn: (...data: any[]) => any | Promise<any>): Promise<() => void>
  beforeListen(fn: (data: any[]) => any | Promise<any>): () => void
  beforeAddListen(fn: (path: string) => string | Promise<any>): () => void
  listenOnce(path: string): Promise<any>
  removeAllListens(path?: string): void
  setSize(width: number, height: number): void
  setResizable(agree: boolean): void
  minimize(): void
  maximize(): void
  unmaximize(): void
  close(): void
  quitApp(): void
  toTop(): void
  relanch(): void
  setState(key: string, value: string): void
  getState<T = User.WebDbSaveDeep>(key: string): Promise<T>
  getStateSync<T = User.WebDbSaveDeep>(key: string): T
  createMainlessWindow(opt: BrowserOptions): void
  createChildWindow(opt: ChildBrowserOptions): void
  reload(sth: string): void
}
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
    shouldRetry: (err: AxiosError) => boolean
  }
  interface InternalAxiosRequestConfig {
    retry: number,
    retryDelay: number,
    shouldRetry: (err: AxiosError) => boolean,
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
      my: string,
      parent?: string
    }
    goHome: () => void
    ipc: ipc
  }
}