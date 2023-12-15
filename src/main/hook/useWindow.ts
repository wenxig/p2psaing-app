import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain, shell } from "electron";
import { join } from "path";
import { useReload } from './useReload';
export namespace WindowControl {
  const childWindowUrlList: string[] = []
  const childWindowObjList: BrowserWindow[] = []
  export function createMainWindow() {
    const mainWindow = new BrowserWindow({
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
      icon: join(__dirname, '../../build/icon.ico'),
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
    useReload(mainWindow.webContents)
    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    mainWindow.setMenu(null)

    mainWindow.on("focus", () => {
      mainWindow.webContents.send("mainWindow_focus", "focus")
    })
    mainWindow.on("blur", () => {
      mainWindow.webContents.send("mainWindow_blur", "blur")
    })
    ipcMain.handle('mainWindow_close', () => {
      if (process.platform == 'darwin') {
        mainWindow.hide()
        app.once('activate', () => {
          mainWindow.show()
        })
      } else {
        mainWindow.webContents.removeAllListeners()
        app.quit()
      }
    })
    // 最小化
    ipcMain.handle('mainWindow_minimize', () => {
      mainWindow.minimize()
    })
    // 最大化
    ipcMain.handle('mainWindow_maximize', () => {
      if (process.platform == 'darwin') {
        mainWindow.setFullScreen(true)
      } else {
        mainWindow.maximize()
      }
    })
    ipcMain.handle('mainWindow_unmaximize', () => {
      mainWindow.setFullScreen(false)
      mainWindow.unmaximize()
    });
    ipcMain.handle('mainWindow_setSize', (_event, arg: { width: number, height: number }) => {
      mainWindow.setSize(arg.width, arg.height)
    })
    ipcMain.handle('mainWindow_resize', (_event, arg) => {
      mainWindow.setResizable(arg)
    })
    return mainWindow
  }
  export function createChildWindow(param: { width: number; height: number; url: string; name: string; more: boolean }): BrowserWindow | boolean {
    if (!param.more && childWindowUrlList.includes(param.url)) {
      const win = childWindowObjList[childWindowUrlList.indexOf(param.url)]
      win.moveTop()
      win.center()
      return false
    }
    let index = childWindowUrlList.length
    let childWin = new BrowserWindow({
      show: false,
      width: param.width,
      height: param.height,
      autoHideMenuBar: true,
      webPreferences: {
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js'),
        webSecurity: false,
        spellcheck: false
      },
      frame: false,
      resizable: false,
      icon: join(__dirname, '../../build/icon.ico')
    })
    childWindowObjList[index] = childWin
    childWindowUrlList[index] = param.url
    useReload(childWin.webContents)
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      childWin.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '#', param.url, `?name=${param.name}`))
    } else {
      childWin.loadFile(join(__dirname, '../renderer/index.html', '#', param.url, `?name=${param.name}`))
    }
    childWin.on("focus", () => {
      childWin.webContents.send(`${param.name}_focus`, "focus")
    })
    childWin.on("blur", () => {
      childWin.webContents.send(`${param.name}_blur`, "blur")
    })
    childWin.once('ready-to-show', () => {
      childWin.show()
    })
    ipcMain.handleOnce(`${param.name}_close`, () => {
      delete childWindowUrlList[index];
      delete childWindowObjList[index];
      [`${param.name}_minimize`, `${param.name}_maximize`, `${param.name}_unmaximize`, `${param.name}_setSize`].forEach(v => {
        ipcMain.removeHandler(v)
      });
      childWin.webContents.removeAllListeners() //结束监听事件
      childWin.close()
    })
    ipcMain.handle(`${param.name}_minimize`, () => {
      childWin.minimize()
    })
    ipcMain.handle(`${param.name}_maximize`, () => {
      if (process.platform == `darwin`) {
        childWin.setFullScreen(true)
      } else {
        childWin.maximize()
      }
    })
    ipcMain.handle(`${param.name}_unmaximize`, () => {
      childWin.setFullScreen(false)
      childWin.unmaximize()
    });
    ipcMain.handle(`${param.name}_setSize`, (_event, arg: { width: number, height: number }) => {
      childWin.setSize(arg.width, arg.height)
    })
    return childWin
  }
}