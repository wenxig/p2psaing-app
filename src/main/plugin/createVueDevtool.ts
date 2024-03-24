import { session } from 'electron'
import { join } from 'node:path'
export function createVueDevtool() {
  const vueDevToolsPath = join(
    __dirname,
    __RESOURCES_PATH__,
    'vue_devtools'
  )

  return session.defaultSession.loadExtension(vueDevToolsPath)
}