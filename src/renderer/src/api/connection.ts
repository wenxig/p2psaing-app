import { watchOnce } from "@vueuse/core"
import { reactive } from "vue"
import { PeerOnPostHandleFn, isRequest } from "."
import { PeerError } from "peerjs"
import _, { ceil, constant, isEmpty, remove, times } from "lodash-es"
import { isMsg } from "./chat"
import db from "@/db"
export class Connection {
  public isOpen = reactive({ value: false })
  public metadata!: [starterData: User.WebDbSave, starterUid: number]
  public type!: 'chat' | 'server'
  constructor(public conn: Peer.Connection) {
    conn.once('open', () => {
      this.type = conn.label as 'chat' | 'server'
      this.metadata = conn.metadata
    })
    const events: ("data" | "open" | "error" | "close")[] = ['data', 'close', 'open', 'error']
    const dataTemp: Record<string, [main: string, nowChunk: number, max: number, req: Peer.Request.Msg]> = {}
    events.forEach(event => this.conn.addListener(event, async (data?: any) => {
      if (event == 'data' && data && isMsg(data) && (data.body.type == 'article' || data.body.type == 'img' || data.body.type == 'file' || data.body.type == 'video')) {
        const dbDate = await db.assetDB.get(data.body.md5)
        if (!!dbDate) {
          data.body.main = dbDate
          this.default[event].forEach(({ [0]: f }) => f(data))
        } else dataTemp[data.headers.time] = [``, 0, data.body.chunkNumber, data]
      }
      if (event == 'data' && data && isMsg(data) && data.body.type == 'chunk') {
        if (isEmpty(dataTemp[data.headers.time])) return
        dataTemp[data.headers.time][0] += data.body.main
        dataTemp[data.headers.time][1]++
        if (dataTemp[data.headers.time][1] == dataTemp[data.headers.time][2]) {
          await db.assetDB.set((<Peer.Msg.UserFileMsg>dataTemp[data.headers.time][3].body).md5, dataTemp[data.headers.time][0])
          dataTemp[data.headers.time][3].body.main = (<Peer.Msg.UserFileMsg>dataTemp[data.headers.time][3].body).md5
          this.default[event].forEach(({ [0]: f }) => f(dataTemp[data.headers.time][3]))
          delete dataTemp[data.headers.time]
        }
      }
      this.default[event].forEach(({ [0]: f }) => f(data))
    }))
  }
  public get ready() {
    return new Promise<void>(resolve => {
      if (this.isOpen.value) return resolve()
      //@ts-ignore
      watchOnce(this.isOpen, resolve)
    })
  }
  public async send<TReturn = Peer.Request.All>(request: Peer.Request.All): Promise<TReturn>
  public async send<TReturn = Peer.Request.All>(path: string, data: Peer.Request.All['body'], config?: { header: Peer.Request.All['headers'] }): Promise<TReturn>
  public async send<TReturn = Peer.Request.All>(value: string | Peer.Request.All, data?: Peer.Request.All['body'], config?: { header: Peer.Request.All['headers'] }): Promise<TReturn> {
    await this.ready
    const request = isRequest(value) ? value : {
      path: value,
      body: data!,
      headers: config?.header ?? {}
    }
    await Promise.resolve(async () => {
      if (isMsg(request) && (request.body.type == 'article' || request.body.type == 'img' || request.body.type == 'file' || request.body.type == 'video')) { //为什么不array.includeds? 答:ts不识别
        const data = request.body.main!
        request.body.main = undefined
        const CHUNK_SIZE = 5000
        const chunkNumber = ceil(data.length / CHUNK_SIZE)
        request.body.chunkNumber = chunkNumber
        await this.conn.send(request)
        await Promise.resolve(times(chunkNumber, i => this.conn.send({
          ...request,
          boby: <Peer.Msg.Chunk>{
            type: 'chunk',
            main: data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
          }
        })))
      }
      return await this.conn.send(request)
    })
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
            if (path != data.path) return
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
          (async () => {
            await this.ready
            resolve()
          })()
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
      await this.ready
      if (!isRequest(data) || data.path != path) return
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
        if (ret == _next) continue
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
