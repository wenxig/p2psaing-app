import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { WindowControl } from './hook/useWindow';
import { UserDataStore } from './temp/state';

const { createChildWindow, createMainWindow } = WindowControl

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  ipcMain.handle('app_quit', () => {
    app.quit()
  })

  ipcMain.on('createChildWindow', (event, val) => {
    createChildWindow(val)
    event.returnValue = undefined
  })

  // 应用状态管理
  ipcMain.on('getState', (event) => {
    console.log(UserDataStore);
    
    event.returnValue = UserDataStore.data
  })
  ipcMain.on('setState', (event, value) => {
    UserDataStore.data = value
    event.returnValue = undefined
  })

  
  createMainWindow()
})

