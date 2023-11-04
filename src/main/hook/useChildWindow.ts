import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain } from "electron";
import { join } from "path";

export default function useW(childWindowUrlList: string[], childWindowObjList: BrowserWindow[]) {
  return {
    createChildWindow(param: { width: number; height: number; url: string; name: string; more: boolean }): BrowserWindow | boolean {
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
        childWin.removeAllListeners() //结束监听事件
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
}