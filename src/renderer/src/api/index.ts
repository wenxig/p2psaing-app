import { z } from 'zod'
import { Connection } from './connection'
import { MediaConnection, Peer, PeerError } from 'peerjs'
import { remove } from 'lodash-es'
export const isRequest = (value: unknown): value is Peer.Request.Handshake | Peer.Request.Msg => z.object({
  path: z.string().startsWith('/'),
  headers: z.any(),
  body: z.any()
}).strict().safeParse(value).success
export const isResponse = (value: unknown): value is Peer.Response => z.object({
  ok: z.boolean()
}).safeParse(value).success
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
  constructor(lid: string) {
    this.peer = new Peer(lid)
    this.setUpPeer(lid)
    
    for (const event of this.peerEvent) this.peer.addListener(event, (data?) => this.default[event].forEach(row => event == 'connection' ? row[0](new Connection(<Peer.Connection>data)) : row[0](data)))
  }
  private setUpPeer(lid: string) {
    (<WebSocket>(<any>this.peer.socket)._socket).onerror = () => {
      this.peer.off('open')
      this.peer = new Peer(lid)
      this.setUpPeer(lid)
    };
    this.peer.once('open', () => {
      console.log('then')
      this.peer.off('open')
      this.thenList?.forEach(f => f());
      (<WebSocket>(<any>this.peer.socket)._socket).onerror = undefined as any
      delete this.thenList
      delete this.then
    })
  }
  private thenList? = new Array<() => void>()
  public then?(resolve: () => void) {
    this.thenList?.push(resolve)
    return this
  }
  public peerEvent: Event[] = ['error', 'call', 'disconnected', 'open', 'close', 'connection']
  private default: Record<Event, [fn: Function, tag: symbol][]> & {} = {
    connection: [],
    close: [[() => {
      this.peer.removeAllListeners()
    }, Symbol('close')]],
    open: [],
    error: [],
    call: [],
    disconnected: []
  }
  public peer!: Peer
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
}