import { contextBridge as _cb } from 'electron'
import './lib/ipc';
const contextBridge = { exposeInMainWorld: import.meta.env.DEV ? (key: string, value: any) => void (window[key] = value) : _cb.exposeInMainWorld }

//密钥获取
contextBridge.exposeInMainWorld('getToken', (of: string) => {
  switch (of) {
    case 'github': return import.meta.env.PRELOAD_VITE_GITHUB_KEY
    case 'smms': return import.meta.env.PRELOAD_VITE_SMMS_KEY
    default: return ''
  }
})