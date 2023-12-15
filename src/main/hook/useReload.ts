import { ipcMain } from 'electron';
const program = [
  'page',
  'store_user'
]
const deal: {
  name: string
  method: () => void
}[] = [

  ]
program.forEach(program => ipcMain.handle(`reload_${program}`, () => deal.filter(val => val['name'] == `reload_${program}`).forEach(val => val['method']())))

export function useReload(ipc: Electron.WebContents) {
  program.forEach(program => deal.push({
    name: `reload_${program}`,
    method: () => ipc.send(`reload_${program}`)
  }))
}