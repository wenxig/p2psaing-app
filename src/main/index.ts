import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { ElectronAppInstance } from './hook/useWindow';
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.whenReady().then(() => {
  const baseInstans = new ElectronAppInstance('index')
  electronApp.setAppUserModelId('com.__APP_NAME__')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  baseInstans.createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length == 0 && baseInstans.createWindow())
  app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
})

