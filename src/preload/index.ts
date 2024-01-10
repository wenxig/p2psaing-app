import { contextBridge } from 'electron'
import { ipcChannel } from './lib/ipc';

console.log('perLoad');

contextBridge.exposeInMainWorld('ipc', ipcChannel())
//密钥获取
contextBridge.exposeInMainWorld('getToken', (of: string) => {
  if (of == 'github') {
    return import.meta.env.PRELOAD_VITE_GITHUB_KEY
  }
  if (of == 'smms') {
    return import.meta.env.PRELOAD_VITE_SMMS_KEY
  }
})