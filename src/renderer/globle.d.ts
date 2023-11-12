import { AxiosResponse } from 'axios';

declare module "vue" {
  interface ComponentCustomProperties {
    $ipc: {
      send: (msg: string, ...data?: any) => any;
      invoke: (channel: string, val?: any) => Promise<any>;
    }
    $window: typeof window
  }
}

declare global {
  type MethodType<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];
  interface Window {
    getToken(of: 'github' | 'smms'): string
    ipcRenderer: {
      send(channel: string, ...val: any): any;
      on(channel: string, listener: (arg0: any) => void): void;
      once(channel: string, listener: (arg0: any) => void): void;
      invoke(channel: string, val?: any): Promise<any>;
    };
    useDatabase(user: string): {
      set(key: string, value: any): void;
      get<T>(key: string, defaultValue?: T | undefined): T;
      has(key: string): boolean;
      delete(key: string): void;
      clear(): void;
      size(): number;
      path(): string;
    };
    email: {
      send(to: string, subject: string, msg: string): Promise<AxiosResponse<any, any>>
    };
  }
}