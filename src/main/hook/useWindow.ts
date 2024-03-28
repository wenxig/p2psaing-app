import { join } from 'path'
import appIcon from '../../../resources/icon.png?asset'
import { dependencies, devDependencies } from '../../../package.json'
import { BrowserWindow, shell, app as App,clipboard } from 'electron'
import { is } from '@electron-toolkit/utils'
import { Ipc } from '../../renderer/globle'
import { useCkeditor } from './useCkeditor'
const ckeditor = useCkeditor()
console.log(process)
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
    contextIsolation: true,
    nodeIntegration: false,
    
  },
  frame: false,
  resizable: false,
  icon: appIcon,
  url: '/',
  props: {}
} as const

export class ElectronAppInstance {
  constructor(public name = 'index') { }
  public windows: Window[] = []
  private _state = new Map<number, Map<string, string>>()
  public state(id: number) {
    return this._state.get(id)
  }
  public createWindow(opt = baseOpt) {
    const window = new Window({ ...baseOpt, ...opt }, this)
    this._state.set(window.id, new Map())
    return window
  }
  public allSend(id: string, ...data: any[]) {
    for (const window of this.windows) window.send(id, ...data)
  }
}

class Window extends BrowserWindow {
  public root: Window
  public state = new Map<string, string>()
  public onMessage<T extends keyof Ipc>(id: T, fn: (...data: Parameters<Ipc[T]>) => ReturnType<Ipc[T]>) {
    this.webContents.ipc.on(id, (event, ...data) => event.returnValue = fn(...(data as Parameters<Ipc[T]>)))
    this.webContents.ipc.handle(id, (_event, ...data) => fn(...(data as Parameters<Ipc[T]>)))
  }
  public send(id: string, ...data: any[]) {
    this.webContents.send(id, ...data)
  }
  public alert(id: string, ...data: any[]) {
    for (const window of this.childWindows) window.alert(id, ...data)
    this.send(id, ...data)
  }

  constructor(
    public options = baseOpt,
    private app: ElectronAppInstance
  ) {
    super(options)
    this.root = this.options.parent?.root ?? this.options.parent ?? this
    this.once('ready-to-show', () => {
      this.show()
      if (import.meta.env.DEV) this.webContents.openDevTools()
    })
    this.webContents.setVisualZoomLevelLimits(1, 1)
    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    this.app.windows.push(this)
    this.onMessage('close', () => this.close())
    this.onMessage('maximize', () => this.maximize())
    this.onMessage('minimize', () => this.minimize())
    this.onMessage('relanch', () => App.relaunch())
    this.onMessage('unmaximize', () => this.unmaximize())
    this.onMessage('createChildWindow', config => this.createChildWindow(config))
    this.onMessage('createWindow', config => this.app.createWindow(config))
    this.onMessage('getVersion', () => ({ ...process.versions, ...dependencies, ...devDependencies }))
    this.onMessage('openExternal', u => shell.openExternal(u))
    this.onMessage('quitApp', () => App.quit())
    this.onMessage('setResizable', size => this.setResizable(size))
    this.onMessage('setSize', (v) => this.setSize(v.width, v.height))
    this.onMessage('toTop', () => {
      this.moveTop()
      this.center()
      this.focus()
    })
    this.onMessage('setState', ({ key, value }) => this.app.state(this.root.id)!.set(key, value))
    this.onMessage('getState', (key) => this.app.state(this.root.id)!.get(key))
    this.onMessage('setSelfState', ({ key, value }) => this.state.set(key, value))
    this.onMessage('getSelfState', (key) => this.state.get(key))
    this.onMessage('getInstance', () => ({
      my: this.id,
      parent: this.getParentWindow()?.id ?? this.id,
      root: this.root.id
    }))
    this.onMessage('copy', v => clipboard.writeText(v))
    this.onMessage('reload', (id, ...value) => this.app.allSend('reload', id, ...value))
    this.onMessage('getHttpComponents', () => [{
      name: 'ck',
      url: `http://localhost:${ckeditor()}`
    }])
    this.on('focus', () => this.send('focus'))
    this.on('blur', () => this.send('blur'))
    const joinData = `#${options.url}`
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) this.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${joinData}`)
    else this.loadFile(`${join(__dirname, __RENDER_PATH__, 'index.html')}${joinData}`)
    super.addListener('close', () => this.options.parent?.childWindows.splice(this.options.parent?.childWindows.indexOf(this), 1))
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