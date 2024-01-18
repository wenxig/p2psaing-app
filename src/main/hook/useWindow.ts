import { join } from 'path';
import appIcon from '../../../resources/icon.png?asset'
import { BrowserWindow, shell, app as App } from 'electron';
import { is } from '@electron-toolkit/utils';
const mainHtml = '../renderer/index.html'
import { isUrlMatched, createMessageCenterRouterUrl, MessageCenterRouterUrl } from '../utils/url';
export type MessageCenterRouterRowFn<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any> = (url: MessageCenterRouterUrl<P, Q>, data: T) => any
export interface MessageCenterRouterRow<P extends Record<string, string> = any, Q extends Record<string, string> = any> {
  path: string,
  fn: MessageCenterRouterRowFn<P, Q>,
  key: symbol
}
const remove = <T>(arr: T[], rule: (val: T, index: number) => boolean) => {
  arr.forEach((val, i) => {
    if (rule(val, i)) {
      arr.splice(i, 1)
    }
  })
}

export interface WindowConfig extends Electron.BrowserWindowConstructorOptions {
  url: string
  parent?: Window
}
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
    const window = new Window(opt, this)
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
          root: win.root.id
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
        port_main.on('message', ({ data }: { data: MessageInstance }) => {
          console.log('message', data);
          const cb = new Array<any>()
          console.log(data);
          // 遍历执行该窗口的符合url的处理函数
          for (const { fn, path } of this.windows.find(({ window }) => window.id == win.id)!.router.filter(({ path }) => isUrlMatched(path, data.path))) cb.push(fn(createMessageCenterRouterUrl(path, data.path), data.body))
          const sendData: MessageInstance = {
            path: `${data.path}#callback`,
            body: cb
          } as const
          console.log(sendData);
          port_main.postMessage(sendData)
        })
        port_main.start()
        ok()
      })
    })
  }
  public addRoute<T = any>(win: Window, path: string, fn: MessageCenterRouterRowFn<T>): () => void {
    const key = Symbol(path)
    const window = this.windows[this.windows.findIndex(({ window }) => window.id == win.id)]
    window.router.push({ path, fn, key })
    return () => remove(window.router, val => val.key == key)
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
        continue
      }
    }).call(this)) port.postMessage(msg)
  }
}
class Window extends BrowserWindow {
  public root: Window
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
      this.addRoute<any[], { method: string }>('/run/window/:method', ({ params }, data) => this[params.method](...(data ?? [])))
      this.addRoute<any[], { method: string }>('/run/app/:method', ({ params }, data) => App[params.method](...(data ?? [])))
      this.addRoute<any[], { method: string }>('/run/instanes/:method', ({ params }, data) => app[params.method](...(data ?? [])))
      this.addRoute<string | undefined, { method: 'get' | 'set', key: string }>('/state/:method/:key', ({ params }, data) => {
        switch (params.method) {
          case 'get': {
            return this.app.state(this.root.id)!.get(params.key)
          }
          case 'set': {
            this.app.state(this.root.id)!.set(params.key, data!)
            return
          }
        }
      })
      this.addRoute<void, { id: string }>('/reload', (_, path) => {
        this.app.msgChannel.send({
          path: `/reload${path}`,
          body: null
        })
      })
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
  public addRoute<T = any, P extends Record<string, string> = any, Q extends Record<string, string> = any>(path: string, fn: MessageCenterRouterRowFn<T, P, Q>): () => void {
    return this.app.msgChannel.addRoute<T>(this, path, fn)
  }
}

