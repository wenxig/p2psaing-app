import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createHmac } from 'crypto';
import ElectronStore from 'electron-store';
import useChildWindow from './hook/useChildWindow';
const childWindowUrlList: string[] = []
const childWindowObjList: BrowserWindow[] = []
const { createChildWindow } = useChildWindow(childWindowUrlList, childWindowObjList)
ElectronStore.initRenderer()
function createWindow(): BrowserWindow {
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
      webSecurity: false
    },
    frame: false,
    resizable: false,
    icon: join(__dirname, '../../build/icon.ico'),
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

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
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  function cryptoCreateHmac(value: string, key: string) {
    return createHmac('sha1', key).update(value).digest("hex");
  }

  ipcMain.handle('crypto_hmac', (_event, val) => {
    return cryptoCreateHmac(val[0], val[1])
  })

  ipcMain.handle('app_quit', () => {
    app.quit()
  })

  ipcMain.on('createChildWindow', (event, val: any) => {
    event.returnValue = void createChildWindow(val)
  })

  createWindow()
})

