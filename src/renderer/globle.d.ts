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
    useServer: () => {
      do<T extends ApiDo>(data: T): Promise<ApiDoResponse<T>>
    }
  }

  type ApiDo =
    | ActionCount
    | ActionGet
    | ActionDelete
    | ActionUpdate
    | ActionSearch;

}

type ActionCount = { action: 'count' };
type ActionGet = { action: 'get'; tag: string | number };
type ActionDelete = { action: 'delete'; tag: string };
type ActionUpdate = { action: 'update'; tag: string | number; value: User.WebDbSaveDeep | User.Red };
type ActionSearch = { action: 'search'; no?: number; count?: number; tag?: string; type?: 'tag' | 'value' | 'both' };


type ApiDoResponse<T extends ApiDo> =
  T extends ActionCount ? AxiosResponse<{ 'count': string }, any> :
  T extends ActionGet ? AxiosResponse<{ [x in string]: any }, any> :
  T extends ActionDelete ? AxiosResponse<{ 'status': string }, any> :
  T extends ActionUpdate ? AxiosResponse<{ 'status': string }, any> :
  T extends ActionSearch ? AxiosResponse<{ [x in string]: any }, any> :
  AxiosResponse<any, any>;