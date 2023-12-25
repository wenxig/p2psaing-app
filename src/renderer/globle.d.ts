import type { AxiosResponse } from 'axios';
import type { ElectronAPI } from '@electron-toolkit/preload';
declare module "vue" {
  interface ComponentCustomProperties {
    $electron: ElectronAPI
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
    electronAPI: ElectronAPI
    email: {
      send(to: string, subject: string, msg: string): Promise<AxiosResponse<any, any>>
    };
    windowName: string
    addWindow(name?: string): void
    goHome: () => void
  }

}