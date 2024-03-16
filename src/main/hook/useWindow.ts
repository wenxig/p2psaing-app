import { join } from 'path';
import appIcon from '../../../resources/icon.png?asset'
import { dependencies, devDependencies } from "../../../package.json"
import { BrowserWindow, shell, app as App, clipboard } from 'electron';
import { is } from '@electron-toolkit/utils';
import { ipc as Ipc } from '../../renderer/globle';
const mainHtml = '../renderer/index.html'
import { useCkeditor } from './useCkeditor';
const ckeditor = useCkeditor()
console.log(App.getAppPath())
export interface WindowConfig extends Electron.BrowserWindowConstructorOptions {
  url: string
  parent?: Window
  props?: Record<string, any>
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
  props: {}
} as const;


export class ElectronAppInstance {
  constructor(public name = 'index') {
  }
  public windows: Window[] = []
  private _state = new Map<number, Map<string, string>>()
  public state(id: number) { return this._state.get(id) }
  public createWindow(opt = baseOpt) {
    const window = new Window({ ...baseOpt, ...opt }, this)
    this._state.set(window.id, new Map())
    return window
  }
}


class Window extends BrowserWindow {
  public root: Window
  public state = new Map<string, string>();
  public onMessage<T extends keyof Ipc>(id: T, fn: (...data: Parameters<Ipc[T]>) => void) {
    const handleMessage = (event: Electron.IpcMainEvent, ...data: any[]) => event.returnValue = fn(...data as Parameters<Ipc[T]>)
    this.webContents.ipc.on(id, handleMessage)
    this.webContents.ipc.handle(id, (_event, ...data) => fn(...data as Parameters<Ipc[T]>))
    return () => {
      this.webContents.ipc.off(id, handleMessage)
      this.webContents.ipc.removeHandler(id)
    }
  }
  public send(id: string, ...data: any[]) {
    this.webContents.send(id, ...data)
  }
  public alert(id: string, ...data: any[]) {
    for (const window of this.childWindows) window.alert(id, ...data)
    this.send(id, ...data)
  }
  constructor(public options = baseOpt, private app: ElectronAppInstance) {
    super(options)
    this.once('ready-to-show', () => {
      this.show()
      if (import.meta.env.DEV) this.webContents.openDevTools()
    })
    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    this.app.windows.push(this)

    this.onMessage('close', this.close)
    this.onMessage('maximize', this.maximize)
    this.onMessage('minimize', this.minimize)
    this.onMessage('relanch', () => App.relaunch())
    this.onMessage('unmaximize', this.unmaximize)
    this.onMessage('createChildWindow', this.createChildWindow)
    this.onMessage('createWindow', this.app.createWindow)
    this.onMessage('getVersion', () => Object.assign(process.versions, dependencies, devDependencies))
    this.onMessage('openExternal', u => shell.openExternal(u))
    this.onMessage('quitApp', App.quit)
    this.onMessage('setResizable', this.setResizable)
    this.onMessage('setSize', v => this.setSize(v.width, v.height))
    this.onMessage('toTop', () => {
      this.moveTop()
      this.center()
      this.focus()
    })
    this.onMessage('copy', (value) => clipboard.writeText(value))
    this.onMessage('setState', ({ key, value }) => this.app.state(this.root.id)!.set(key, value))
    this.onMessage('getState', (key) => this.app.state(this.root.id)!.get(key))
    this.onMessage('setSelfState', ({ key, value }) => this.state.set(key, value))
    this.onMessage('getSelfState', (key) => this.state.get(key))
    this.onMessage('reload', id => this.alert('reload', id))
    this.onMessage('getHttpComponents', () => [{
      name: 'ck', url: `http://localhost:${ckeditor()}`
    }])
    this.on('focus', () => this.send('focus'))
    this.on('blur', () => this.send('blur'))
    this.root = this.options.parent?.root ?? this.options.parent ?? this
    const joinData = `#${options.url}`
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) this.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${joinData}`)
    else this.loadFile(`${join(__dirname, mainHtml)}${joinData}`)
  }
  public childWindows = new Array<Window>()
  public createChildWindow(options: WindowConfig) {
    this.childWindows.push(new Window({
      ...baseOpt,
      ...options,
      parent: this
    }, this.app))
    return true
  }
}
