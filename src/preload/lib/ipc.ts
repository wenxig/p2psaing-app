import { ipcRenderer, contextBridge } from "electron";
import type { BrowserOptions } from "src/main/hook/useWindow";
type EventRow = { fn: (...data: any[]) => any | Promise<any>, tag: symbol }
const remove = <T>(arr: T[], rule: (val: T, index: number) => boolean) => {
  arr.forEach((val, i) => {
    if (rule(val, i)) {
      arr.splice(i, 1)
    }
  })
}
export const ipcChannel = () => {
  let name: {
    my: string;
    parent?: string | undefined;
  }
  const nameString = location.search.substring(1).replace(/%22/g, '"')
  if (nameString.endsWith('/')) name = window.instance_name = JSON.parse(nameString.replace(/\//g, ''))
  else name = window.instance_name = JSON.parse(nameString)
  contextBridge.exposeInMainWorld('instance_name', name)
  ipcRenderer.on(`/${name.parent ?? name.my}/reload/page`, () => location.reload())
  const defaultEmit: {
    listen: (EventRow & { path: string })[]
    beforeListen: EventRow[]
    beforeAddListen: EventRow[]
  } = {
    listen: ((_this) => new Proxy(new Array<EventRow & { path: string }>(), {
      set: (t) => !t.map(({ path }) => ipcRenderer.removeAllListeners(path)) || !!t.map(p => ipcRenderer.addListener(p.path, async (_e, ...data) => {
        for (const { fn } of defaultEmit.beforeListen) data = await fn(...data)
        return await p.fn(data)
      }))
    }))(this),
    beforeListen: [],
    beforeAddListen: [{
      fn(path: string) {
        return `/${name.my ?? 'index'}${path}`
      }, tag: Symbol('path_process')
    }],
  }
  const sendWithID = <TRes = any>(path: string, ...data: any[]): Promise<TRes> => {
    return ipcRenderer.invoke(`/${name.my}${path}`, ...data)
  }
  const sendWithoutID = <TRes = any>(path: string, ...data: any[]): Promise<TRes> => {
    return ipcRenderer.invoke(path, ...data)
  }
  const sendWithoutIDSync = <TRes = any>(path: string, ...data: any[]): TRes => {
    return ipcRenderer.sendSync(path, ...data)
  }
  const _this = {
    setSize(width: number, height: number) {
      sendWithID('/setSize', width, height)
    },
    setResizable() {
      sendWithID('/resize')
    },
    minimize() {
      sendWithID('/minimize')
    },
    maximize() {
      sendWithID('/maximize')
    },
    unmaximize() {
      sendWithID('/unmaximize')
    },
    toTop() {
      sendWithID('/top')
    },
    close() {
      sendWithID('/close')
    },
    appQuit() {
      sendWithoutID('/app/quit')
    },
    relanch() {
      sendWithoutID('/app/relanch')
    },
    reload(path: string) {
      sendWithoutID(`/${name.parent ?? name.my}/reload${path}`)
    },
    setState(key: string, value: string) {
      sendWithoutID('/state/set', key, value, name.parent ?? name.my)
    },
    async getState(key: string) {
      return JSON.parse((await sendWithoutID('/state/get', key, name.parent ?? name.my)) ?? '{}')
    },
    getStateSync(key: string) {
      return JSON.parse((sendWithoutIDSync('/state/get', key, name.parent ?? name.my)) ?? '{}')
    },
    createMainlessWindow(opt: BrowserOptions) {
      sendWithoutID('/create/mainlessWindow', opt)
    },
    createChildWindow(opt: BrowserOptions) {
      sendWithoutID('/create/childWindow', opt)
    },
    async listen(path: string, fn: (...data: any[]) => any | Promise<any>) {
      for (const { fn } of defaultEmit.beforeAddListen) path = await fn(path)
      const tag = Symbol(path)
      defaultEmit.listen.push({ fn, tag, path })
      return () => void remove(defaultEmit.listen, raw => raw.tag == tag)
    },
    beforeListen(fn: (data: any[]) => any | Promise<any>) {
      const tag = Symbol('beforeListen')
      defaultEmit.beforeListen.push({ fn, tag })
      return () => void remove(defaultEmit.beforeListen, raw => raw.tag == tag)
    },
    beforeAddListen(fn: (path: string) => string | Promise<any>) {
      const tag = Symbol('beforeAddListen')
      defaultEmit.beforeListen.push({ fn, tag })
      return () => void remove(defaultEmit.beforeListen, raw => raw.tag == tag)
    },
    listenOnce(path: string): Promise<any[]> {
      return new Promise(r => {
        const clear = this.listen(path, async (...da: any[]) => {
          r(da);
          (await clear)()
        })
      })
    },
    removeAllListens(path?: string) {
      if (path) return void remove(defaultEmit.listen, ({ path: p }) => p == path)
      defaultEmit.listen.splice(0, Infinity)
    }
  }
  return _this
}