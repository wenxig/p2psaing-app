import { app, BrowserWindow, session, protocol, net } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { ElectronAppInstance } from './hook/useWindow';
import { createVueDevtool } from './plugin/createVueDevtool';
import path from 'path';
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.whenReady().then(() => {
  const baseInstans = new ElectronAppInstance('index')
  createVueDevtool()
  electronApp.setAppUserModelId(`com.${__APP_NAME__}`)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  baseInstans.createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length == 0 && baseInstans.createWindow())
  app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
  app.once('ready', () => {
    console.clear()
    // console.log(`${__APP_NAME__} console control system. app version: ${ __APP_VERSION__ }`)
  })
  protocol.handle('atom', request => net.fetch(`file://${request.url.replaceAll('atom://', '')}`))
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['https://cdn.jsdelivr.net/*'] }, (v, callback) => {
    if (v.url.startsWith('https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs')) {
      return callback({ 'redirectURL': `atom://${path.join(__dirname, __RESOURCES_PATH__, './vscode', v.url.split('/').at(-1)!)}` })
    }
    return callback({ cancel: false })
  })
})

