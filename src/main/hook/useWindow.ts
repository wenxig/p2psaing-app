import { is } from '@electron-toolkit/utils';
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import { join } from 'path';
import { useReload } from './useReload';
export namespace WindowControl {
  const childWindowUrlList: Record<string, string[]> = {}
  const childWindowObjList: Record<string, BrowserWindow[]> = {}
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
      icon: join(__dirname, '../../build/icon.ico'),
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
      index.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      index.loadFile(join(__dirname, '../renderer/index.html'))
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
      icon: join(__dirname, '../../build/icon.ico'),
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
      mainlessWindow.loadURL(join(process.env[`ELECTRON_RENDERER_URL`], `?window_base_name=${name}`))
    } else {
      mainlessWindow.loadFile(join(__dirname, `../renderer/index.html`, `?window_base_name=${name}`))
    }

    mainlessWindow.setMenu(null)

    mainlessWindow.on("focus", () => {
      mainlessWindow.webContents.send(`${name}_focus`, `focus`)
    })
    mainlessWindow.on(`blur`, () => {
      mainlessWindow.webContents.send(`${name}_blur`, `blur`)
    })
    ipcMain.handle(`${name}_close`, () => {
      if (process.platform == `darwin`) {
        mainlessWindow.hide()
        app.once(`activate`, () => {
          mainlessWindow.show()
        })
      } else {
        mainlessWindow.webContents.removeAllListeners()
        childWindowUrlList[name].forEach((_v, i) => {
          childWindowObjList[name][i].close()
        })
        mainlessWindow.close()
      }
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

  export function createChildWindow(param: { width: number; height: number; url: string; name: string; more: boolean }, parentWindowName: string): BrowserWindow | boolean {
    if (!param.more && childWindowUrlList[parentWindowName].includes(param.url)) {
      const win = childWindowObjList[parentWindowName][childWindowUrlList[parentWindowName].indexOf(param.url)]
      win.moveTop()
      win.center()
      return false
    }
    let index = childWindowUrlList[parentWindowName].length
    let childWin = new BrowserWindow({
      show: false,
      width: param.width,
      height: param.height,
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
    childWindowObjList[parentWindowName][index] = childWin
    childWindowUrlList[parentWindowName][index] = param.url
    useReload(childWin.webContents)
    if (is.dev && process.env[`ELECTRON_RENDERER_URL`]) {
      childWin.loadURL(join(process.env[`ELECTRON_RENDERER_URL`], `#`, param.url, `?&window_base_name=${parentWindowName}_${param.name}`))
    } else {
      childWin.loadFile(join(__dirname, `../renderer/index.html`, '#', param.url, `?window_base_name=${parentWindowName}_${param.name}`))
    }
    childWin.on(`focus`, () => {
      childWin.webContents.send(`${param.name}_focus`, `focus`)
    })
    childWin.on(`blur`, () => {
      childWin.webContents.send(`${param.name}_blur`, `blur`)
    })
    childWin.once('ready-to-show', () => {
      childWin.show()
    })
    ipcMain.handleOnce(`${param.name}_close`, () => {
      delete childWindowUrlList[parentWindowName][index];
      delete childWindowObjList[parentWindowName][index];
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
