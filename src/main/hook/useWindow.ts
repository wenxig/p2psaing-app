import { join } from 'path';
import appIcon from '../../../resources/icon.png?asset'
import { BrowserWindow, shell, app as App } from 'electron';
import { is } from '@electron-toolkit/utils';
const mainHtml = '../renderer/index.html'
import { isUrlMatched, createMessageCenterRouterUrl, MessageCenterRouterUrl } from '../utils/url';
import { useCkeditor } from './useCkeditor';
const ckeditor = useCkeditor()

export type MessageCenterRouterRowFn<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any> = (url: MessageCenterRouterUrl<P, Q>, data: T) => any
export interface MessageCenterRouterRow<P extends Record<string, string> = any, Q extends Record<string, string> = any> {
  path: string,
  fn: MessageCenterRouterRowFn<P, Q>,
  key: symbol
}
export interface WindowConfig extends Electron.BrowserWindowConstructorOptions {
  url: string
  parent?: Window
  props?: Record<string, any>
}
const remove = <T>(arr: T[], rule: (val: T, index: number) => boolean) => arr.forEach((val, i) => rule(val, i) && arr.splice(i, 1))
const baseOpt: WindowConfig = {
  width: 280,
  height: 400,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    spellcheck: false,
    webSecurity: false,
    contextIsolation: false
  },
  frame: false,
  resizable: false,
  icon: appIcon,
  url: '/',
  props: {}
} as const;


export class ElectronAppInstance {
  constructor(public name = 'index') {
    const messageCenter = new MessageCenter(this)
    this.msgChannel = messageCenter
  }
  public msgChannel: MessageCenter
  private _state = new Map<number, Map<string, string>>()
  public state(id: number) { return this._state.get(id) }
  public createWindow(opt = baseOpt) {
    const window = new Window({ ...baseOpt, ...opt }, this)
    this._state.set(window.id, new Map())
    return window
  }
}

export interface MessageInstance<T = any> {
  path: string,
  body: T
}
class MessageCenter {
  constructor(protected app: ElectronAppInstance) { }
  public windows: { port: Electron.MessagePortMain, window: Window, router: MessageCenterRouterRow[] }[] = []
  public addWindow(win: Window) {
    return new Promise<void>((ok) => {
      win.webContents.ipc.on('init_sync', (event) => {
        console.log('init_sync');
        event.returnValue = {
          my: win.id,
          root: win.root.id,
          props: win.options.props
        }
      })
      win.webContents.ipc.on(`init_port`, (event) => {
        const port_main = event.ports[0]
        this.windows.push({ port: port_main, window: win, router: [] })
        console.log('window init');
        const cleanUpPort = () => {
          port_main.close()
          remove(this.windows, ({ window }) => win.id == window.id)
        }
        win.once('closed', cleanUpPort)
        const handleMessage = async (data: MessageInstance) => {
          const cb = new Array<any>()
          // 遍历执行该窗口的符合url的处理函数
          for (const { fn, path } of this.windows.find(({ window }) => window.id == win.id)!.router.filter(({ path }) => isUrlMatched(path, data.path))) cb.push(await fn(createMessageCenterRouterUrl(path, data.path), data.body))
          const sendData: MessageInstance = {
            path: `${data.path}#callback`,
            body: cb
          } as const
          console.log(sendData);
          return sendData
        }
        port_main.on('message', async ({ data }: { data: MessageInstance }) => {
          console.log('message', data);
          port_main.postMessage(await handleMessage(data))
        })
        win.webContents.ipc.on(win.id.toString(), async (event, data: MessageInstance) => {
          console.log('sync message', data);
          event.returnValue = await handleMessage(data)
        })
        port_main.start()
        ok()
      })
    })
  }
  public addRoute<T = any>(win: Window, path: string, fn: MessageCenterRouterRowFn<T>, sync: boolean): () => void {
    const key = Symbol(path)
    const window = this.windows[this.windows.findIndex(({ window }) => window.id == win.id)]
    sync && window.router.push({ path: `/sync${path}`, fn, key })
    window.router.push({ path, fn, key })
    return () => remove(window.router, v => v.key == key)
  }
  public send(msg: MessageInstance, to: (number | Window | Electron.MessagePortMain)[] = this.windows.map(v => v.window)) {
    for (const port of (function* (this: MessageCenter): Generator<Electron.MessagePortMain, void, unknown> {
      for (const input of to) {
        if (typeof input == 'number') {
          for (const { port } of this.windows.filter(({ window }) => window.id == input)) yield port
          continue
        }
        if (input instanceof Window) {
          for (const { port } of this.windows.filter(({ window }) => window.id == input.id)) yield port
          continue
        }
        yield input
      }
    }).call(this)) port.postMessage(msg)
  }
}

function decryptBykaisa(str: string, iv: number) {
  let outStr = "";
  for (let i = 0; i < str.length; i++)  if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 90) outStr += String.fromCharCode((str.charCodeAt(i) - 65 - iv + 26) % 26 + 65)
  else if (str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) outStr += String.fromCharCode((str.charCodeAt(i) - 97 - iv + 26) % 26 + 97)
  else outStr += String.fromCharCode(str.charCodeAt(i));
  return outStr;
}

class Window extends BrowserWindow {
  public root: Window
  public state = new Map<string, string>();
  constructor(public options = baseOpt, private app: ElectronAppInstance) {
    super(options)
    this.once('ready-to-show', () => {
      console.log('show');
      this.show()
    })
    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    this.app.msgChannel.addWindow(this).then(() => {
      this.addRoute<string[]>('/crypto/decrypt/aes512', (_, { [0]: value }) => decryptBykaisa(value, import.meta.env.MAIN_VITE_API_AES_KEY), true)
      this.addRoute<any[], { method: string }>('/run/shell/:method', ({ params }, data) => shell[params.method](...(data ?? [])))
      this.addRoute<any[], { method: string }>('/run/window/:method', ({ params }, data) => this[params.method](...(data ?? [])))
      this.addRoute<any[], { method: string }>('/run/app/:method', ({ params }, data) => App[params.method](...(data ?? [])))
      this.addRoute<any[], { method: string }>('/run/instanes/:method', ({ params }, data) => app[params.method](...(data ?? [])))
      this.addRoute<string | undefined, { method: 'get' | 'set', key: string }>('/state/:method/:key', ({ params }, data) => {
        switch (params.method) {
          case 'get': return this.app.state(this.root.id)!.get(params.key)
          case 'set': return void this.app.state(this.root.id)!.set(params.key, data!)
        }
      }, true)
      this.addRoute<string | undefined, { method: 'get' | 'set', key: string }>('/state/self/:method/:key', ({ params }, data) => {
        switch (params.method) {
          case 'get': return this.state.get(params.key)
          case 'set': return void this.state.set(params.key, data!)
        }
      }, true)
      this.addRoute<void, { id: string }>('/reload', (_, path) => {
        this.app.msgChannel.send({
          path: `/reload${path}`,
          body: null
        })
      })
      this.addRoute('/sync/httpServer', () => {
        return [{
          name: 'ck', url: `http://localhost:${ckeditor()}`
        }]
      }, true)

      this.on('focus', () => this.app.msgChannel.send({
        path: `/emit/focus`,
        body: null
      }, [this]))
      this.on('blur', () => this.app.msgChannel.send({
        path: `/emit/blur`,
        body: null
      }, [this]))

    })
    this.root = this.options.parent?.root ?? this.options.parent ?? this
    const joinData = `#${options.url}`
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) this.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${joinData}`)
    else this.loadFile(`${join(__dirname, mainHtml)}${joinData}`)
  }
  public createChildWindow(options: WindowConfig) {
    new Window({
      ...baseOpt,
      ...options,
      parent: this
    }, this.app)
  }
  public addRoute<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>, sync = false): () => void {
    return this.app.msgChannel.addRoute<T>(this, path, fn, sync)
  }
}
