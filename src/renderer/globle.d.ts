import type { AxiosResponse } from 'axios';
import type { BrowserOptions, ChildBrowserOptions } from '../main/hook/useWindow'
import { actor } from "./src/controller";
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
  setSelfState(key: string, value: string, animate: boolean = false): void
  getState(key: string): Promise<string>
  getStateSync(key: string): string
  getSelfStateSync(key: string): string
  createWindow(opt: BrowserOptions): void
  createInstanse(): void
  createChildWindow(opt: ChildBrowserOptions): void
  reload(sth: string): void
  onReload(path: string, fn: Function): () => void
  getVersions(): Record<string, string>
  addRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): () => void
  addOnceRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): void
}
declare module "vue" {
  interface ComponentCustomProperties {
    $ipc: ipc
    $window: typeof window
    $actor: typeof actor
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
    plugins: AppPlugin.Plugin[]
  }
}