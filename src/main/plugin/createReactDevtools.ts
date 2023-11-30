import { session } from 'electron'
import { join } from 'node:path'
import { homedir } from 'node:os'

export function createReactDevtool() {
  const reactDevToolses = [
    session.defaultSession.loadExtension(join(homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.28.5_0')),
    session.defaultSession.loadExtension(join(homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/oddhnidmicpefilikhgeagedibnefkcf/3.5_0')),
    session.defaultSession.loadExtension(join(homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/jofikieipejiceaccabdhlbedbfhogkm/1.0.0_0')),
  ]
  return Promise.any(reactDevToolses)
}