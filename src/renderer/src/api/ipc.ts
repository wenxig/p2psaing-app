import type { WindowConfig } from '../../../main/hook/useWindow'

type WithValue = {
  getState: (key: string) => any
  getSelfState: (key: string) => any
  getHttpComponents: () => { name: string, url: string }[],
  getVersion: () => Record<string, string>
  getInstance: () => {
    my: number,
    parent: number,
    root: number,
  }
}
type Listeners = {
  onReload: (key: string, fn: (...data:any) => any) => () => void;
  onMessage: (key: string, fn: () => any) => () => void;
}

type WithoutValue = {
  minimize: () => void,
  maximize: () => void,
  unmaximize: () => void,
  close: () => void,
  quitApp: () => void,
  toTop: () => void,
  relanch: () => void,
  reload: (key: string, ...value: any) => void,
  openExternal: (url: string) => void,
  setSize: (config: { width: number, height: number }) => void
  setResizable: (mode: boolean) => void,
  setState: (state: { key: string, value: string }) => void
  setSelfState: (state: { key: string, value: string }) => void
  createWindow: (config: WindowConfig) => void,
  createChildWindow: (config: WindowConfig) => void
}
export const keysWithValue: (keyof WithValue)[] = ['getHttpComponents', 'getState', 'getInstance', 'getSelfState', 'getVersion'] as const
export const keysWithoutValue: (keyof WithoutValue)[] = ["minimize", "maximize", "unmaximize", "close", "quitApp", "toTop", "relanch", "reload", "openExternal", "setSize", "setResizable", "setState", "setSelfState", "createWindow", "createChildWindow"]
export const keysListeners: (keyof Listeners)[] = ["onReload", "onMessage"]

export type Ipc = WithValue & Listeners & WithoutValue
