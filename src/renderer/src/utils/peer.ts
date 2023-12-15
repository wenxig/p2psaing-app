import { z } from 'zod'
import { toUserWebSave, webSaveRule } from './user'
import { Peer as Peerjs } from 'peerjs'
import type { ArgumentMap } from '.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3';
import { searchByUid, getTimeByUid } from '@/db/network';
import { useUserStore } from '@s/user'
import { AsyncConstructor } from './asyncConstructor';
import db from '@/db';
export function isHandShake(value: unknown): value is Peer.Handshake {
  const rule = z.object({
    from: webSaveRule,
    encrypt: z.enum(['base']).or(z.boolean()),
    ok: z.boolean(),
    time: z.number()
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
    headers: z.record(z.string(), z.string()),
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
export class P2P extends AsyncConstructor {
  private me!: User.WebDbSaveDeep
  private peer!: Peerjs
  private isCloseing = false //? "ing"表主动
  public linkList: PeerLinkList[] = []
  constructor(lid?: string) {
    super(async () => {
      this.me = useUserStore().user
      const peer = await this.listenOnce('open', new Peerjs(lid ?? this.me.pid) as any) as unknown as ArgumentMap<object> as Peerjs
      this.peer = peer
      this.peer.on('disconnected', () => {
        if (this.isCloseing) {
          return
        }
        peer.reconnect()
      })
    })
  }
  public async create(uid: number, config: Peer.CreateConfig): Promise<[connection: Peer.Connection, ok: true] | [connection: undefined, ok: false]> {
    const user = await searchByUid(uid)
    const connection = this.peer.connect(user.lid, {
      reliable: true,
      label: 'client',
      metadata: [toUserWebSave(this.me), this.me.uid]
    })
    await this.listenOnce('open', connection)
    const msg: Peer.Handshake = {
      from: toUserWebSave(this.me),
      time: new Date().getTime(),
      encrypt: config.useEncrypt ?? false,
      ok: false
    }
    const { body: handshakeFirst } = await this.post('/handshake', {
      connection,
      body: msg
    })
    if (!isHandShake(handshakeFirst)) {
      connection.close()
      return [undefined, false]
    }
    if (!handshakeFirst.ok || handshakeFirst.encrypt != msg.encrypt || (handshakeFirst.time - msg.time == 0)) {
      connection.close()
      return [undefined, false]
    }
    this.linkList.push({
      connection,
      lid: user.lid,
      uid: user.uid
    })
    db.setTempUserData(user, await getTimeByUid(user.uid))
    return [connection, true]
  }
  private async listenOnce(event: "open", connection: Peer.Connection): Promise<Peer.Connection>
  private async listenOnce(event: "data", connection: Peer.Connection, path: `/${string}`): Promise<Peer.Request>
  private async listenOnce(event: "data" | "open", connection: Peer.Connection, path?: `/${string}`): Promise<Peer.Request | Peer.Connection> {
    return await new Promise(async (resolve, reject) => {
      const sto = setTimeout(() => { reject(new Error('timeout')) }, 1000)
      connection.once(event, (...args: [] | [data: unknown]) => {
        const arg = args[0] as Peer.Request | Peer.Connection
        if (isRequest(arg)) {
          if (!path) {
            throw new Error('"path" is undefined')
          }
          return resolve(arg)
        }
        resolve(arg)
        clearTimeout(sto)
      }).once('error', (err) => {
        connection.off(event)
        reject(err)
      })
    })
  }
  public async post(path: `/${string}`, config: PeerPostConfig) {
    await config.connection.send({
      path,
      body: config.body ?? {},
      headers: config.header ?? {}
    })
    return await this.listenOnce('data', config.connection, path)
  }
  public onPost(connection: Peer.Connection, path: `/${string}`, ...handles: PeerOnPostHandleFn[]): () => void {
    connection.off('data')
    connection.on('data', async (data) => {
      if (!isRequest(data) || data.path != path) {
        return
      }
      let beforeData: any[] = []
      handles = [...handles, this.handleData]
      for (const handel of handles) {
        const ret = await handel(data, beforeData, (...data: any[]) => {
          beforeData = data
        })
        if (isResponse(ret)) {
          await connection.send(ret)
          break;
        }
      }
    })
    return () => {
      connection.off('data')
    }
  }
  private handleData: PeerOnPostHandleFn = () => {
    return {
      ok: true
    }
  }
}
export interface PeerPostConfig {
  body?: any,
  header?: Record<string, string>,
  useEncrypt?: Peer.Handshake['encrypt'],
  connection: Peer.Connection,
  chunk?: boolean
}
export type PeerOnPostHandleNextFn = (...value: any[]) => void
export type PeerOnPostHandleFn = (req: Peer.Request, beforeData: any[], next: PeerOnPostHandleNextFn) => Promise<Peer.Response | void> | Peer.Response | void
export type PeerLinkList = {
  lid: string,
  connection: Peer.Connection,
  uid: number
}