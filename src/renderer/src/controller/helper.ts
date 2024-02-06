import { reactive, watch, ref } from 'vue';
import { remove } from 'lodash-es';
const fnBuffer = new Array<{
  key: symbol
  life: keyof AppPlugin.PluginFunction,
  fn: Function
}>()
export const runPluginLfe = <K extends keyof AppPlugin.PluginFunction, R = undefined | ReturnType<NonNullable<AppPlugin.PluginFunction[K]>>>(life: K, ...data: Parameters<NonNullable<AppPlugin.PluginFunction[K]>>) => {
  let runningPlugin = ''
  const returns: R[] = []
  nowState.value = life
  try {
    for (const plugin of window.plugins.filter(pg => !!pg[life])) {
      runningPlugin = plugin.name
      returns.push((plugin[life] as Function)!(...data))
    }
  } catch (error) {
    throw new Error(`[Plugin Error] ${error} \n at plugin name:${runningPlugin}`)
  }
  for (const { fn } of fnBuffer.filter(({ life: lf }) => lf == life)) fn(...returns)
}
export const readQuery = () => {
  const query = new Map<string, string>()
  if (/\?/g.test(location.hash)) for (const [key, value] of location.hash.substring(location.hash.indexOf("?") + 1).split('&').map(v => v.split('='))) query.set(key, value)
  return query
}
export const routerMap = {
  onHomeRouter: '/main',
  onChatRouter: '/main/dev/chat',
  onPluginRouter: '/main',
  onSettingRouter: '/main/setting/app',
  onAddressRouter: '/main/address',
  onDevRouter: '/main/dev'
} as const
export const nowState = ref<(keyof AppPlugin.PluginFunction) | 'onSetup'>((readQuery().get("route") ?? 'onSetup') as any)
export const nowRouterState = ref<(keyof AppPlugin.PluginRouterFunction) | 'onSetup'>((readQuery().get("route") ?? 'onSetup') as any)
watch(nowRouterState, (route) => {
  window.ipc.setSelfState('route', route)
}, { flush: 'post' })

const processList = reactive(new Array<{
  ready: boolean,
  task: () => Promise<any>,
  waiting: boolean,
  sync: boolean
}>())
export function addAsyncProcess(task: () => Promise<any>) {
  processList.push({
    ready: false,
    task,
    waiting: false,
    sync: false
  })
}
export function addSyncProcess(task: () => any) {
  processList.push({
    ready: false,
    task,
    waiting: false,
    sync: true
  })
}
watch(processList, (val) => {
  if (val[0]?.ready) processList.shift()
  if (!!val[0] && !val[0].waiting && (val[0].waiting = true)) val[0].sync ? (() => val[0].ready = (!!val[0].task() || true))() : (val[0].task().finally(() => val[0].ready = true))
})
export function on<K extends keyof AppPlugin.PluginFunction>(life: K, fn: (...data: (ReturnType<NonNullable<AppPlugin.PluginFunction[K]>>)[]) => any): () => void {
  const key = Symbol(life)
  fnBuffer.push({ life, fn, key })
  return () => remove(fnBuffer, { key })
}