import type { AxiosResponse } from 'axios';
import type { ElectronAPI } from '@electron-toolkit/preload';
declare module "vue" {
  interface ComponentCustomProperties {
    $electron: ElectronAPI
    $window: typeof window
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
    useServer: () => {
      do<T extends ApiDo>(data: T): Promise<ApiDoResponse<T>>
    }
     __APP_NAME__: readonly string
     __APP_VERSION__: readonly string
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