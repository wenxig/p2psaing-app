import { z } from 'zod'
import { webSaveRule } from '@/utils/user'
import { Connection } from './connection'
import { MediaConnection, Peer, PeerError } from 'peerjs'
import { remove } from 'lodash-es'
import { reactive } from 'vue'
import { watchOnce } from '@vueuse/core'
export function isHandShake(value: unknown): value is Peer.Handshake {
  const rule = z.object({
    from: webSaveRule,
    encrypt: z.enum(['base']).or(z.boolean()),
    ok: z.boolean(),
    time: z.number(),
  }).strict()
  return rule.safeParse(value).success
}
export function isHandShakeHeader(value: unknown): value is Peer.HandshakeHeader {
  const rule = z.object({
    syn: z.number().optional(),
    seq: z.number().optional(),
    ack: z.number().optional(),
    _ack: z.number().optional(),
  }).strict()
  return rule.safeParse(value).success
}
export function isMsg(value: unknown): value is Peer.Msg.index {
  const ruls: z.ZodRawShape[] = [{
    type: z.enum(['text']),
    main: z.string()
  }
    , {
    type: z.enum(['img', 'file', 'video']),
    main: z.instanceof(Blob),
    md5: z.string()
  }
    , {
    type: z.enum(['appFunction']),
    main: z.any()
  }
    , {
    type: z.enum(['code']),
    main: z.string(),
    is: z.string()
  }
    , {
    type: z.enum(['equation']),
    main: z.string()
  }, {
    type: z.enum(['callback']),
    main: z.boolean()
  }]
  const baseMsg = z.object({
    from: z.number(),
    time: z.number()
  })
  return ruls.some(fn => {
    return baseMsg.extend(fn).strict().safeParse(value).success
  })
}
export function isRequest(value: unknown): value is Peer.Request {
  const rule = z.object({
    path: z.string().startsWith('/'),
    headers: z.any(),
    body: z.any()
  }).strict()
  return rule.safeParse(value).success
}
export function isResponse(value: unknown): value is Peer.Response {
  const rule = z.object({
    ok: z.boolean()
  })
  return rule.safeParse(value).success
}
export interface PeerPostConfig {
  useEncrypt?: Peer.Handshake['encrypt'],
  connection: Peer.Connection,
  chunk?: boolean
}
export type PeerOnPostHandleNextFn = (...value: any[]) => symbol
export type PeerOnPostHandleFn<T = Peer.Request | symbol | boolean> = (req: Peer.Request, beforeData: any[], next: PeerOnPostHandleNextFn) => Promise<T> | T
export type DefaultOnLinkHandle = (connection: Connection) => boolean | Promise<boolean>

type Event = 'error' | 'call' | 'disconnected' | 'open' | 'close' | 'connection'
export class P2P {
  public peerEvent: Event[] = ['error', 'call', 'disconnected', 'open', 'close', 'connection']
  private default: Record<Event, [fn: Function, tag: symbol][]> & {

  } = {
      connection: [],
      close: [[() => {
        this.peer.removeAllListeners()
        this.isOpen.value = false
      }, Symbol('close')]],
      open: [[() => {
        this.isOpen.value = true
      }, Symbol('open')]],
      error: [],
      call: [],
      disconnected: []
    }
  peer: Peer
  protected whenReady() {
    return new Promise<void>(resolve => {
      if (this.isOpen.value) return resolve()
      //@ts-ignore 
      watchOnce(this.isOpen, () => resolve())
    })
  }
  public isOpen = reactive({ value: false })
  public listen(event: 'connection', fn: (connection: Connection) => any): () => void
  public listen(event: 'close', fn: () => any): () => void
  public listen(event: 'open', fn: () => any): () => void
  public listen(event: 'disconnected', fn: () => any): () => void
  public listen(event: 'error', fn: (err: PeerError<string>) => any): () => void
  public listen(event: 'call', fn: (mid: MediaConnection) => any): () => void
  public listen(event: Event, fn: ((err: PeerError<string>) => any) | ((connection: Connection) => any) | ((mid: MediaConnection) => any)): () => void {
    const tag = Symbol(event)
    this.default[event].push([fn, tag])
    return () => void remove(this.default[event], raw => raw[1] == tag)
  }
  public listenOnce(event: Event) {
    return new Promise((resolve) => {
      const close = this.listen(event as any, (data) => {
        close()
        return resolve(data)
      })
    })
  }

  constructor(lid: string) {
    this.peer = new Peer(lid)
    this.peerEvent.forEach(event => this.peer.addListener(event, (data?) => {
      this.default[event].forEach(row => {
        if (event == 'connection') {
          row[0](new Connection(<Peer.Connection>data))
          return
        }
        row[0](data)
      })
    }))
  }
}