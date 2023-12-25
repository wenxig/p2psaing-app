import { ipcMain } from 'electron';
const program = [
  'page',
  'store_user'
]
const deals: {
  name: string
  method: () => void,
  window: string
}[] = []
deals.forEach(deal => program.forEach(program => ipcMain.handle(`reload_${program}_${deal.window}`, () => deals.filter(val => val['name'] == `reload_${program}_${deal.window}`).forEach(val => val.method()))))

export function useReload(ipc: Electron.WebContents, name: string = 'index') {
  program.forEach(program => deals.push({
    name: `reload_${program}_${name}`,
    method: () => ipc.send(`reload_${program}_${name}`),
    window: name
  }))
}