import { join } from 'path';
import appIcon from '../../../resources/icon.png?asset'
import { BrowserWindow } from 'electron';
import { is } from '@electron-toolkit/utils';
const mainHtml = '../renderer/index.html'
interface MessageInstance<T = any> {
  path: string,
  body: T
}

interface WindowConfig extends Electron.BrowserWindowConstructorOptions {
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
    webSecurity: false
  },
  frame: false,
  resizable: false,
  icon: appIcon,
  url: '/',
} as const;


class ElectronAppInstance {
  /**  instance to instance communication 实例间通信 */
  public iic = {}
  constructor(public name = 'index') {
    const messageCenter = new MessageCenter(this)
    this.msgChannel = messageCenter
  }
  public msgChannel: MessageCenter
  private _state = new Map<number, Map<string, any>>()
  public state = (id: number) => this._state.get(id)
  createWindow(opt = baseOpt) {
    const window = new Window(opt, this)
    this._state.set(window.id, new Map())
    return window
  }
}

interface MessageCenterRouterUrl{
  
}
interface MessageCenterRouterRow {
  path: string,
  fn: <T = any>(url: MessageCenterRouterUrl, data: T) => any
}
class MessageCenter {
  constructor(protected app: ElectronAppInstance) { }
  private windows: { port: Electron.MessagePortMain, window: Window, router: MessageCenterRouterRow }[] = []
  public addWindow(win: Window) {
    if (this.windows.find(v => v.window.id == win.id)) return false
    win.webContents.ipc.once(`init`, (event) => {
      const ports = event.ports[0]
      ports.postMessage({
        path: '/init',
        body: {
          br: win
        }
      } as MessageInstance)
      ports.on('message', ({ data }) => {
        data
      })
      event.returnValue = win
    })
    return true
  }
}
class Window extends BrowserWindow {
  public root: Window
  constructor(public options = baseOpt, private app: ElectronAppInstance) {
    super(options)
    const joinData = `#${options.url}`
    process.cwd
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) this.loadURL([process.env['ELECTRON_RENDERER_URL'], joinData].join())
    else this.loadFile([join(__dirname, mainHtml), joinData].join())
    this.app.msgChannel.addWindow(this)
    this.root = this
    while (!!this.root.root) {
      this.root = this.root.root
    }
  }
  public createChildWindow(options = baseOpt) {
    const win = new Window({
      ...options,
      parent: this
    }, this.app)
    this.app.msgChannel.addWindow(win)
  }
}

