import { ipcRenderer, contextBridge } from 'electron'
import { keysWithValue, keysWithoutValue } from '../../renderer/src/api/ipc'
const injectToRender = (key: string, value: any) => {
  // window[key] = value
  contextBridge.exposeInMainWorld(key, value)
}

const ipcSend = (id: any, ...val: any): void => ipcRenderer.send(id, ...val)
const ipcSendSync = (id: any, ...val: any) => ipcRenderer.sendSync(id, ...val)

const injectValue: any = {}

for (const key of keysWithValue) injectValue[key] = (...val: any[]) => ipcSendSync(key, ...val)
for (const key of keysWithoutValue) injectValue[key] = (...val: any[]) => ipcSend(key, ...val) as any

const reloads = new Set<{ id: string; fn: Function }>()
injectValue.onReload = (id, fn) => {
  const add = { id, fn }
  reloads.add(add)
  return () => reloads.delete(add)
}
ipcRenderer.addListener('reload', (_e, id: string, ...data: any) => reloads.forEach(({ id: _id, fn }) => id == _id && fn(...data)))

injectValue.onMessage = (id, fn) => {

  const handle = (_event: Electron.IpcRendererEvent, ...args: any[]) => fn(...args)
  ipcRenderer.addListener(id, handle)
  return () => ipcRenderer.removeListener(id, handle)
}
injectToRender('ipc', injectValue)
injectToRender('instance_name', ipcSendSync('getInstance'))