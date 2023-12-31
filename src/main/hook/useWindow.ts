import { is } from '@electron-toolkit/utils';
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import { join } from 'path';
import { useReload } from './useReload';
import appIcon from '../../../resources/icon.png?asset'
import mainHtml from '../../renderer/index.html?asset'
export namespace WindowControl {
  const childWindows: { window: BrowserWindow, father: string, name: string }[] = []
  export function createindex() {
    const index = new BrowserWindow({
      width: 280,
      height: 400,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true,
        spellcheck: false,
        webSecurity: false,
        nodeIntegrationInWorker: true
      },
      frame: false,
      resizable: false,
      icon: appIcon,
    })

    index.once('ready-to-show', () => {
      index.show()
    })
    useReload(index.webContents)
    index.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      index.loadURL(join(process.env['ELECTRON_RENDERER_URL'],`?{"my":"index"}`))
    } else {
      index.loadFile(join(mainHtml, `?{"my":"index"}`))
    }

    index.setMenu(null)

    index.on(`focus`, () => {
      index.webContents.send(`index_focus`, `focus`)
    })
    index.on(`blur`, () => {
      index.webContents.send("index_blur", "blur")
    })
    ipcMain.handle('index_close', () => {
      if (process.platform == 'darwin') {
        index.hide()
        app.once('activate', () => {
          index.show()
        })
      } else {
        index.webContents.removeAllListeners()
        app.quit()
      }
    })
    // 最小化
    ipcMain.handle('index_minimize', () => {
      index.minimize()
    })
    // 最大化
    ipcMain.handle('index_maximize', () => {
      if (process.platform == 'darwin') {
        index.setFullScreen(true)
      } else {
        index.maximize()
      }
    })
    ipcMain.handle('index_unmaximize', () => {
      index.setFullScreen(false)
      index.unmaximize()
    });
    ipcMain.handle('index_setSize', (_event, arg: { width: number, height: number }) => {
      index.setSize(arg.width, arg.height)
    })
    ipcMain.handle('index_resize', (_event, arg) => {
      index.setResizable(arg)
    })
    return index
  }
  export function createMainlessWindow(name: string) {
    const mainlessWindow = new BrowserWindow({
      width: 280,
      height: 400,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true,
        spellcheck: false,
        webSecurity: false,
        nodeIntegrationInWorker: true
      },
      frame: false,
      resizable: false,
      icon: appIcon,
    })

    mainlessWindow.once('ready-to-show', () => {
      mainlessWindow.show()
    })
    useReload(mainlessWindow.webContents)
    mainlessWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainlessWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], `?{"my":"${name}"}`))
    } else {
      mainlessWindow.loadFile(join(mainHtml, `?{"my":"${name}"}`))
    }

    mainlessWindow.setMenu(null)

    mainlessWindow.on("focus", () => {
      mainlessWindow.webContents.send(`${name}_focus`, `focus`)
    })
    mainlessWindow.on(`blur`, () => {
      mainlessWindow.webContents.send(`${name}_blur`, `blur`)
    })
    ipcMain.handle(`${name}_close`, () => {
      mainlessWindow.webContents.removeAllListeners()
      childWindows.filter(v => v.father == name).forEach(v => v.window.close())
      mainlessWindow.close()
    })
    // 最小化
    ipcMain.handle(`${name}_minimize`, () => {
      mainlessWindow.minimize()
    })
    // 最大化
    ipcMain.handle(`${name}_maximize`, () => {
      if (process.platform == `darwin`) {
        mainlessWindow.setFullScreen(true)
      } else {
        mainlessWindow.maximize()
      }
    })
    ipcMain.handle(`${name}_unmaximize`, () => {
      mainlessWindow.setFullScreen(false)
      mainlessWindow.unmaximize()
    });
    ipcMain.handle(`${name}_setSize`, (_event, arg: { width: number, height: number }) => {
      mainlessWindow.setSize(arg.width, arg.height)
    })
    ipcMain.handle(`${name}_resize`, (_event, arg) => {
      mainlessWindow.setResizable(arg)
    })
    return mainlessWindow
  }

  export function createChildWindow(options: { width: number; height: number; url: string; name: string; more: boolean }, parentWindowName: string): BrowserWindow | boolean {
    if (options.more == false) {
      const _window = childWindows.find(v => v.father == parentWindowName && v.name == options.url)
      if (!!_window) {
        const win = _window.window
        win.moveTop()
        win.center()
        return false
      }
    }
    let childWin = new BrowserWindow({
      show: false,
      width: options.width,
      height: options.height,
      autoHideMenuBar: true,
      webPreferences: {
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true,
        preload: join(__dirname, `../preload/index.js`),
        webSecurity: false,
        spellcheck: false
      },
      frame: false,
      resizable: false,
      icon: join(__dirname, `../../build/icon.ico`)
    })
    options.name = `${parentWindowName}_${options.name}`

    childWindows.push({
      father: parentWindowName,
      name: options.name,
      window: childWin
    })
    useReload(childWin.webContents)    
    if (is.dev && process.env[`ELECTRON_RENDERER_URL`]) {
      childWin.loadURL(join(process.env[`ELECTRON_RENDERER_URL`], `?{"parent":"${parentWindowName}","my":"${options.name}"}`, '#', options.url))
    } else {
      childWin.loadFile(join(__dirname, `../renderer/index.html`, `?{"parent":"${parentWindowName}","my":"${options.name}"}`, '#', options.url))
    }
    childWin.on(`focus`, () => {
      childWin.webContents.send(`${options.name}_focus`, `focus`)
    })
    childWin.on(`blur`, () => {
      childWin.webContents.send(`${options.name}_blur`, `blur`)
    })
    childWin.once('ready-to-show', () => {
      childWin.show()
    })
    ipcMain.handleOnce(`${options.name}_close`, () => {
      childWindows.slice(childWindows.findIndex(v => v.father == parentWindowName && v.name == options.name), 1);
      [`${options.name}_minimize`, `${options.name}_maximize`, `${options.name}_unmaximize`, `${options.name}_setSize`].forEach(v => {
        ipcMain.removeHandler(v)
      });
      childWin.webContents.removeAllListeners() //结束监听事件
      childWin.close()
    })
    ipcMain.handle(`${options.name}_minimize`, () => {
      childWin.minimize()
    })
    ipcMain.handle(`${options.name}_maximize`, () => {
      if (process.platform == `darwin`) {
        childWin.setFullScreen(true)
      } else {
        childWin.maximize()
      }
    })
    ipcMain.handle(`${options.name}_unmaximize`, () => {
      childWin.setFullScreen(false)
      childWin.unmaximize()
    });
    ipcMain.handle(`${options.name}_setSize`, (_event, arg: { width: number, height: number }) => {
      childWin.setSize(arg.width, arg.height)
    })
    return childWin
  }
}
