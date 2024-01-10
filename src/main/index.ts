import electron,{ app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import colors from 'colors-console';
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.__APP_NAME__')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => BrowserWindow.getAllWindows().length == 0)
  app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
  console.log(Electron.MessagePortMain)
})

