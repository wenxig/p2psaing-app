import { z } from 'zod'
import { Connection } from './connection'
import { MediaConnection, Peer, PeerError } from 'peerjs'
import { remove } from 'lodash-es'
import { reactive } from 'vue'
import { watchOnce } from '@vueuse/core'
export function isRequest(value: unknown): value is Peer.Request.Handshake|Peer.Request.Msg {
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
  useEncrypt?: Peer.Handshake.Body['encrypt'],
  connection: Peer.Connection,
  chunk?: boolean
}
export type PeerOnPostHandleNextFn = (...value: any[]) => symbol
export type PeerOnPostHandleFn<T = Peer.Request.All | symbol | boolean> = (req: Peer.Request.All, beforeData: any[], next: PeerOnPostHandleNextFn) => Promise<T> | T
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