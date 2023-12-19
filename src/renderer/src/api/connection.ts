import { watchOnce } from "@vueuse/core"
import { ref } from "vue"
import { PeerOnPostHandleFn, isRequest } from "."
import { PeerError } from "peerjs"
import { constant, remove } from "lodash-es"

export class Connection {
  public isOpen = ref(false)
  constructor(conn: Peer.Connection) {
    this.conn = conn
    const events = ['data', 'close', 'open', 'error']
    //@ts-ignore 不想标注类型
    events.forEach(event => this.conn.on(event, (data: any) => this.default[event].forEach(row => row[0](data))))
  }
  conn: Peer.Connection
  public whenReady() {
    return new Promise<void>(resolve => {
      if (this.isOpen.value) return resolve()
      watchOnce(this.isOpen, () => resolve())
    })
  }
  public async send(path: `/${string}`, data: Pick<Peer.Request, 'body'>, config?: { header: Pick<Peer.Request, 'headers'> }): Promise<Peer.Request> {
    await this.whenReady()
    console.log('post');
    setTimeout(async () => {
      await this.conn.send({
        path,
        body: data,
        headers: config?.header ?? {}
      })
    }, 0)
    return this.listenOnce('data', path)
  }
  private default: {
    data: [fn: Function, tag: symbol][];
    close: [fn: Function, tag: symbol][];
    open: [fn: Function, tag: symbol][];
    error: [fn: Function, tag: symbol][];
    onData: PeerOnPostHandleFn[]
  } = {
      data: [],
      close: [[() => {
        ["data", "close", "open", "error"].forEach(en => this.conn.off(en as any))
        this.isOpen.value = false
      }, Symbol('close')]],
      open: [],
      error: [],
      onData: []
    }
  public listen(event: "close", fn: () => any): () => void
  public listen(event: "open", fn: () => any): () => void
  public listen(event: "error", fn: (err: PeerError<string>) => any): () => void
  public listen(event: "data", fn: (data: Peer.Request) => any): () => void
  public listen(event: "data" | "open" | "error" | "close", fn: ((data: Peer.Request) => any) | (() => any) | ((err: PeerError<string>) => any)): () => void {
    const tag = Symbol(event)
    this.default[event].push([fn, tag])
    return () => void remove(this.default[event], raw => raw[1] == tag)
  }
  public listenOnce(event: "close"): Promise<void>
  public listenOnce(event: "open"): Promise<void>
  public listenOnce(event: "error"): Promise<PeerError<string>>
  public listenOnce(event: "data", path: string): Promise<Peer.Request>
  public listenOnce(event: "data" | "error" | "open" | "close", path?: string): Promise<void | PeerError<string> | Peer.Request> {
    return new Promise((resolve, reject) => {
      switch (event) {
        case "data": {
          const close = this.listen(event, (data) => {
            if (!isRequest(data)) {
              close()
              return reject()
            }
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
  public onData(path: `/${string}`, ...handles: PeerOnPostHandleFn[]): () => void {
    const _next = Symbol('next')
    return this.listen('data', async (data) => {
      await this.whenReady()
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
          break;
        }
        throw new TypeError('void is not a res')
      }
    })
  }
}
