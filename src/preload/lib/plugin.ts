import { contextBridge as _cb } from "electron";
const contextBridge = { exposeInMainWorld: import.meta.env.DEV ? (key: string, value: any) => void (window[key] = value) : _cb.exposeInMainWorld }

contextBridge.exposeInMainWorld('plugins', [])