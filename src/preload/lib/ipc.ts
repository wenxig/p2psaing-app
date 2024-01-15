import { ipcRenderer, contextBridge as _cb } from "electron";
import type { MessageInstance, MessageCenterRouterRowFn, MessageCenterRouterRow, WindowConfig } from '../../main/hook/useWindow';
import type { ipc as Ipc } from '../../renderer/globle';
import { isUrlMatched, createMessageCenterRouterUrl } from "../../main/utils/url";
const contextBridge = { exposeInMainWorld: import.meta.env.DEV ? (key: string, value: any) => void (window[key] = value) : _cb.exposeInMainWorld }
const remove = <T,>(arr: T[], rule: (val: T, index: number) => boolean) => {
  arr.forEach((val, i) => {
    if (rule(val, i)) {
      arr.splice(i, 1)
    }
  })
}
function addRouter<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): () => void {
  const key = Symbol(path)
  routers.push({ path, fn, key })
  return () => remove(routers, val => val.key == key)
}
const addOnceRouter = <T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>) => {
  const remove = addRouter(path, (...val) => {
    remove()
    fn(...val)
  })
}
const { port1, port2: _port } = new MessageChannel()
const { my, root } = ipcRenderer.sendSync('init_sync')
ipcRenderer.postMessage('init_port', null, [_port])
const routers = new Array<MessageCenterRouterRow>()
contextBridge.exposeInMainWorld('instance_name', {
  my,
  parent: root
})
console.log('perload init');
port1.start()
port1.onmessage = ({ data }: { data: MessageInstance }) => {
  console.log('data', data)
  for (const { fn, path } of routers.filter(({ path }) => isUrlMatched(path, data.path))) fn(createMessageCenterRouterUrl(path, data.path), data.body)
}


const send = <T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(msg: MessageInstance) => new Promise<T>((res) => {
  port1.postMessage(msg)
  const stop = addRouter<T, P, Q>(msg.path, ({ hash }, data) => {
    if (hash !== 'callback') return false
    stop()
    res(data)
    return true
  })
})

const minimize = () => send({
  path: '/run/window/minimize',
  body: []
})
const getState = async <T = User.WebDbSaveDeep,>(key: string) => (await send<MessageInstance<T>>({
  path: `/state/get/${key}`,
  body: null
}))[0]
const setState = (key: string, body: string) => send({
  path: `/state/set/${key}`,
  body
})
const close = () => send({
  path: `/run/window/close`,
  body: null
})
const createChildWindow = (body: WindowConfig) => send({
  path: `/run/window/createChildWindow`,
  body: [body]
})
const createWindow = (body: WindowConfig) => send({
  path: `/run/app/createWindow`,
  body: [body]
})
const createInstanse = () => send({ // 待实现
  path: `/run/app/createWindow`,
  body: []
})
const maximize = () => send({
  path: `/run/window/maximize`,
  body: null
})
const setSize = (width: number, height: number, animate: boolean = false) => send({
  path: `/run/window/setSize`,
  body: [width, height, animate]
})
const toTop = () => {
  send({
    path: `/run/window/center`,
    body: null
  })
  send({
    path: `/run/window/moveTop`,
    body: null
  })
}
const quitApp = () => send({
  path: `/run/app/quit`,
  body: null
})
const unmaximize = () => send({
  path: `/run/app/unmaximize`,
  body: null
})
const relanch = () => send({
  path: `/run/app/relanch`,
  body: null
})
const setResizable = (agree: boolean) => send({
  path: `/run/app/relanch`,
  body: [agree]
})

const reload = (body: string) => send({
  path: `/reload`,
  body
})
const onReload = (path: string, fn: MessageCenterRouterRowFn) => addRouter(`/reload${path}`, fn)
contextBridge.exposeInMainWorld('ipc', {
  minimize,
  getState,
  setState,
  close,
  createChildWindow,
  createWindow,
  createInstanse,
  maximize,
  setSize,
  toTop,
  quitApp,
  unmaximize,
  relanch,
  setResizable,
  reload,
  onReload,
  addRouter,
  addOnceRouter
} as Ipc)


