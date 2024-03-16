import type { AxiosResponse } from 'axios';
import type { WindowConfig } from '../main/hook/useWindow'
type ipc = {
  setSize(width: number, height: number): Promise<void>
  setResizable(agree: boolean): Promise<void>
  minimize(): Promise<void>
  maximize(): Promise<void>
  unmaximize(): Promise<void>
  close(): Promise<void>
  quitApp(): Promise<void>
  toTop(): void
  relanch(): Promise<void>
  setState(key: string, value: string, animate: boolean = false): Promise<void>
  setSelfState(key: string, value: string, animate: boolean = false): Promise<void>
  getState(key: string): Promise<string>
  getStateSync(key: string): string
  getSelfStateSync(key: string): string
  createWindow(opt: WindowConfig): Promise<void>
  createInstanse(): Promise<void>
  createChildWindow(opt: WindowConfig): Promise<void>
  reload(sth: string): Promise<void>
  onReload(path: string, fn: Function): () => void
  getVersions(): Record<string, string>
  addRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): () => void
  addOnceRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): void
  dragFiles(files: File[]): void
  openExternal(url: string): void
  htmlServer(): { name: string, url: string }[]
  decryptUserData(value: string): string
  copy(value:string):any
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