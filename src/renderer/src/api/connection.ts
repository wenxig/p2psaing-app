import { watchOnce } from "@vueuse/core"
import { reactive } from "vue"
import { PeerOnPostHandleFn, isRequest } from "."
import { PeerError } from "peerjs"
import { constant, remove } from "lodash-es"
export class Connection {
  public isOpen = reactive({ value: false })
  public metadata: [starterData: User.WebDbSave, starterUid: number]
  public type: 'chat' | 'server'
  constructor(conn: Peer.Connection) {
    this.conn = conn
    this.type = conn.label as 'chat' | 'server'
    this.metadata = conn.metadata
    const events: ("data" | "open" | "error" | "close")[] = ['data', 'close', 'open', 'error']
    events.forEach(event => this.conn.addListener(event, (data?) => this.default[event].forEach(row => row[0](data))))
  }
  conn: Peer.Connection
  public whenReady() {
    return new Promise<void>(resolve => {
      if (this.isOpen.value) return resolve()
      //@ts-ignore
      watchOnce(this.isOpen, () => resolve())
    })
  }
  public async send<TReturn = Peer.Request.All>(request: Peer.Request.All): Promise<TReturn>
  public async send<TReturn = Peer.Request.All>(path: string, data: Peer.Request.All['body'], config?: { header: Peer.Request.All['headers'] }): Promise<TReturn>
  public async send<TReturn = Peer.Request.All>(value: string | Peer.Request.All, data?: Peer.Request.All['body'], config?: { header: Peer.Request.All['headers'] }): Promise<TReturn> {
    await this.whenReady()
    console.log('post');
    const request = isRequest(value) ? value : {
      path: value,
      body: data,
      headers: config?.header ?? {}
    }
    setTimeout(async () => {
      await this.conn.send(request)
    }, 0)
    return this.listenOnce('data', request.path) as TReturn
  }
  private default: Record<"data" | "open" | "error" | "close", [fn: Function, tag: symbol][]> & {
    onData: PeerOnPostHandleFn[]
  } = {
      data: [],
      close: [[() => {
        this.conn.removeAllListeners()
        this.isOpen.value = false
      }, Symbol('close')]],
      open: [[() => {
        this.isOpen.value = true
      }, Symbol('open')]],
      error: [],
      onData: []
    }
  public listen(event: "close", fn: () => any): () => void
  public listen(event: "open", fn: () => any): () => void
  public listen(event: "error", fn: (err: PeerError<string>) => any): () => void
  public listen(event: "data", fn: (data: Peer.Request.All) => any): () => void
  public listen(event: "data" | "open" | "error" | "close", fn: ((data: Peer.Request.All) => any) | (() => any) | ((err: PeerError<string>) => any)): () => void {
    const tag = Symbol(event)
    this.default[event].push([fn, tag])
    return () => void remove(this.default[event], raw => raw[1] == tag)
  }
  public listenOnce(event: "close"): Promise<void>
  public listenOnce(event: "open"): Promise<void>
  public listenOnce(event: "error"): Promise<PeerError<string>>
  public listenOnce(event: "data", path: string): Promise<Peer.Request.All>
  public listenOnce(event: "data" | "error" | "open" | "close", path?: string): Promise<void | PeerError<string> | Peer.Request.All> {
    return new Promise((resolve) => {
      switch (event) {
        case "data": {
          const close = this.listen(event, (data) => {
            if (path != data.path) {
              return
            }
            close()
            return resolve(data)
          })
          break;
        }
        case "error": {
          const close = this.listen(event, (data) => {
            close()
            return resolve(data)
          })
          break;
        }
        case "open": {
          this.whenReady().then(resolve)
          break;
        }
        case "close": {
          const close = this.listen(event, () => {
            close()
            return resolve()
          })
          break;
        }
        default:
          break;
      }
    })
  }
  public onData(path: string, ...handles: PeerOnPostHandleFn[]): () => void {
    const _next = Symbol('next')
    return this.listen('data', async (data) => {
      await this.whenReady()
      console.log('on data');
      if (!isRequest(data) || data.path != path)
        return
      let beforeData: any[] = []
      handles = this.default.onData.concat(handles, [constant(false)])
      for (const handel of handles) {
        const ret = await handel(data, beforeData, (...data: any[]) => {
          beforeData = data
          return _next
        })
        if (isRequest(ret)) {
          await this.conn.send(ret)
          break;
        }
        if (ret == _next) {
          continue;
        }
        if (ret == false) {
          this.conn.close()
          break;
        }
        if (ret == true) {
          this.conn.send(null)
          break;
        }
        throw new TypeError('void is not a res')
      }
    })
  }
  public close() {
    this.conn.close()
  }
}
