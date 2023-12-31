import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { WindowControl } from './hook/useWindow';
import { UserDataStore } from './temp/state';
import { createVueDevtool } from './plugin/createVueDevtool';
import colors from 'colors-console';
// import { createReactDevtool } from './plugin/createReactDevtools';
const { createChildWindow, createindex, createMainlessWindow } = WindowControl

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createindex()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  ipcMain.handle('app_quit', () => {
    app.quit()
  })

  ipcMain.on('createChildWindow', (event, val, parentWindowName: string) => {
    createChildWindow(val, parentWindowName)
    event.returnValue = undefined
  })
  ipcMain.on('createMainlessWindow', (event, val) => {
    createMainlessWindow(val)
    event.returnValue = undefined
  })
  // 应用状态管理
  ipcMain.on('getState', (event, key: string, wid: string = 'index') => {
    console.log(colors('bright', `---------${new Date()}---------`));
    console.log(colors('green', `getState${colors('white', '(')}${colors('magenta', wid)}${colors('white', ')')}`), colors('green', '<=='), `${key}_${wid}`, ':', UserDataStore.getData(`${key}_${wid}`));
    event.returnValue = UserDataStore.getData(`${key}_${wid}`)
  })
  ipcMain.on('setState', (event, key: string, value, wid: string = 'index') => {
    console.log(colors('bright', `---------${new Date()}---------`));
    console.log(colors('yellow', `setState${colors('white', '(')}${colors('magenta', wid)}${colors('white', ')')}`), colors('yellow', '==>'), `${key}_${wid}`, ':', value);
    UserDataStore.setData(`${key}_${wid}`, value)
    event.returnValue = undefined
  })
  // createReactDevtool()
  createVueDevtool()
  createindex()
})

