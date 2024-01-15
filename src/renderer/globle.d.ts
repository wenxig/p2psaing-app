import type { AxiosResponse } from 'axios';
import type { BrowserOptions, ChildBrowserOptions } from '../main/hook/useWindow'

type ipc = {
  setSize(width: number, height: number): void
  setResizable(agree: boolean): void
  minimize(): void
  maximize(): void
  unmaximize(): void
  close(): void
  quitApp(): void
  toTop(): void
  relanch(): void
  setState(key: string, value: string, animate: boolean = false): void
  getState<T = User.WebDbSaveDeep>(key: string): Promise<T>
  createWindow(opt: BrowserOptions): void
  createInstanse(): void
  createChildWindow(opt: ChildBrowserOptions): void
  reload(sth: string): void
  onReload(path: string, fn: Function): () => void
  addRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): () => void
  addOnceRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): void
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
      my: number,
      parent: number
    }
    goHome: () => void
    ipc: ipc
  }
}