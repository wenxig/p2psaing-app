import { session } from 'electron'
import { join } from 'node:path'
import { homedir } from 'node:os'


export function createVueDevtool() {
  const vueDevToolsPath = join(
    homedir(),
    '/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.1_0'
  )
  return session.defaultSession.loadExtension(vueDevToolsPath)
}