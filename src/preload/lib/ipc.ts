import { ipcRenderer, contextBridge as _cb } from "electron";
import { type Ipc, keysWithValue, keysWithoutValue, type withValue, type withoutValue } from '../../renderer/src/api/ipc';
const contextBridge = { exposeInMainWorld: import.meta.env.DEV ? (key: string, value: any) => void (window[key] = value) : _cb.exposeInMainWorld }
const ipcSend = <T extends keyof Ipc>(id: T, ...val: Parameters<Ipc[T]>) => ipcRenderer.send(id, ...val)
const ipcSendSync = <T extends keyof Ipc>(id: T, ...val: Parameters<Ipc[T]>) => ipcRenderer.sendSync(id, ...val)

const injectValue: Partial<Ipc> = {}


for (const key of keysWithValue as (keyof typeof withValue)[]) injectValue[key] = (...val: any[]) => ipcSendSync(key, ...val)
for (const key of keysWithoutValue as (keyof typeof withoutValue)[]) injectValue[key] = (...val: any[]) => ipcSend(key, ...val) as any

const reloads = new Set<{ id: string, fn: Parameters<Ipc['onReload']>[1] }>()
injectValue.onReload = (id, fn) => {
  const add = { id, fn }
  reloads.add(add)
  return () => reloads.delete(add)
}
ipcRenderer.addListener('reload', (_e, id: string) => reloads.forEach(({ id: _id, fn }) => (id == _id) && fn()))

injectValue.onMessage = (id, fn) => {
  const handle = (...data: any[]) => fn(...(data.slice(1)))
  ipcRenderer.addListener(id, handle)
  return () => ipcRenderer.removeListener(id, handle)
}

contextBridge.exposeInMainWorld('ipc', injectValue)