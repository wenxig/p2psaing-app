import { session } from 'electron'
import { join } from 'node:path'
export function createVueDevtool() {
  const vueDevToolsPath = join(
    __dirname,
    '../../resources/vue_devtools'
  )
  
  return session.defaultSession.loadExtension(vueDevToolsPath)
}