import db from "@/db";
import { getTimeByUid, searchByUid } from "@/db/network";
import { P2P } from ".";
import { toUserWebSave } from "@/utils/user";
import { isEmpty, isNumber, random } from "lodash-es";
import { useAppStore } from "@/store/appdata";
import { Connection } from './connection';
import { z } from "zod";
import { webSaveRule } from '@/utils/user'
import { actor } from "@/controller";
export const isRequest = (value: unknown): value is Peer.Request.All => z.object({
  path: z.string().startsWith('/'),
  headers: z.object({
    time: z.number(),
    from: webSaveRule.or(z.number())
  }),
  body: z.any()
}).strict().safeParse(value).success
export const isResponse = (value: unknown): value is Peer.Response => z.object({
  ok: z.boolean()
}).safeParse(value).success
export const isHandShakeBody = (value: unknown): value is Peer.Handshake.Body => z.object({
  encrypt: z.boolean().or(z.enum(['base'])),
  ok: z.boolean(),
}).strict().safeParse(value).success
export const isHandShakeHeader = (value: unknown): value is Peer.Handshake.Header => z.object({
  syn: z.number().optional(),
  seq: z.number().optional(),
  ack: z.number().optional(),
  _ack: z.number().optional(),
}).safeParse(value).success
export const isHandShake = (value: unknown): value is Peer.Request.Handshake => isRequest(value) && isHandShakeBody(value.body) && isHandShakeHeader(value.headers)
export const isMsg = (value: unknown): value is Peer.Request.Msg => isRequest(value) && [{
  type: z.enum(['text']),
  main: z.string()
}, {
  type: z.enum(['img', 'file', 'video', 'article']),
  md5: z.string(),
  name: z.string().optional(),
  chunkNumber: z.nan().or(z.number()),
  main: z.string().optional() //仅函数中传递填写
}, {
  type: z.enum(['appFunction']),
  main: z.any()
}, {
  type: z.enum(['code']),
  main: z.string(),
  is: z.number()
}, {
  type: z.enum(['equation']),
  main: z.string()
}, {
  type: z.enum(['callback']),
  main: z.boolean(),
  for: z.string().optional()
}, {
  type: z.enum(['chunk']),
  main: z.string(),
}].some(fn => z.object(fn as any).strict().safeParse(value.body).success)

let me: undefined | User.WebDbSaveDeep = undefined
export class Chat extends P2P {
  public linkList = <Record<number, {
    connection: Connection;
    number: number
  }>>{}
  public get me() {
    if (me) return me
    return me = JSON.parse(window.ipc.getStateSync('user'))
  }
  public isCloseing = false
  public static refs = new Map<number, Chat>()
  constructor(lid?: string) {
    super(lid ?? JSON.parse(window.ipc.getStateSync('user')).lid)
    Chat.refs.set(this.me.uid, this)
    this.peer.on('disconnected', () => {
      Chat.refs.set(this.me.uid, this)
      this.isCloseing && this.peer.reconnect()
    })
    this.listen('connection', (connection) => {
      console.log('/handshake');
      return new Promise(resolve => {
        connection.onData('/handshake', async (req) => {
          console.log('/handshake');
          
          if (!isHandShake(req)) {
            resolve(false)
            return false
          }
          if (req.headers._ack) {
            if (isNumber(req.headers.from)) req.headers.from = await searchByUid(req.headers.from)
            if (req.headers.ack != 1 || req.headers._ack != this.linkList[req.headers.from.uid].number + 1) {
              resolve(false)
              return false
            }
            resolve(true)
            return {
              path: '/handshake',
              body: {
                ...req.body,
                ok: true,
              },
              headers: {
                from: toUserWebSave(this.me),
                time: new Date().getTime()
              }
            }
          }
          if (req.headers.syn != 1) {
            resolve(false)
            return false
          }
          connection.listen('close', () => !isEmpty(this.linkList[connection.metadata[1]]) && delete this.linkList[connection.metadata[1]])
          return {
            path: '/handshake',
            body: req.body,
            headers: {
              syn: 1,
              ack: 1,
              _ack: req.headers.seq! + 1,
              seq: (this.linkList[connection.metadata[1]] = {
                connection,
                number: random(0, 10000)
              }).number,
              from: toUserWebSave(this.me),
              time: new Date().getTime()
            }
          }
        })
      })
    })
  }
  public async connect(uid: number, config: CreateConfig): Promise<[connection: Connection, ok: true] | [connection: undefined, ok: false]> {
    const user = await searchByUid(uid)
    const connection = new Connection(this.peer.connect(user.lid, {
      reliable: true,
      label: 'chat',
      metadata: [toUserWebSave(this.me), this.me.uid]
    }))
    await connection.ready
    // if (!await this.handShake(connection, config)) return [undefined, false]
    await db.tempUserData.set(user, await getTimeByUid(uid))
    useAppStore().links.push(user)
    this.linkList[uid] = {
      connection,
      number: 0
    }
    return [connection, true]
  }

  private async handShake(connection: Connection, config: CreateConfig): Promise<boolean> {
    //todo 首次握手
    const body1: Peer.Handshake.Body = {
      encrypt: config.useEncrypt ?? false,
      ok: false
    }
    const header1: Peer.Handshake.Header = {
      syn: 1,
      seq: random(0, 10000)
    }
    const res1 = await connection.send('/handshake', body1, {
      header: {
        ...header1,
        from: toUserWebSave(this.me),
        time: new Date().getTime(),
      }
    })
    if (!isHandShake(res1) || res1.headers.syn != 1 || res1.headers.ack != 1 || res1.headers._ack != header1.seq! + 1 || !isNumber(res1.headers.seq)) {
      connection.close()
      return false
    }
    //todo 三次握手
    const res2 = await connection.send('/handshake', body1, {
      header: {
        ack: res1.headers.ack,
        _ack: res1.headers.seq + 1,
        from: toUserWebSave(this.me),
        time: new Date().getTime(),
      }
    })
    //todo 校验数据
    if (!isHandShake(res2) || !res2.body.ok || JSON.stringify(await searchByUid((<User.WebDbSave>res2.headers.from).uid)) != JSON.stringify(res2.headers.from)) {
      connection.close()
      return false
    }
    return true
  }
}

export type PeerLinkList = {
  lid: string,
  connection: Peer.Connection,
  uid: number
}


type CreateConfig = {
  useEncrypt?: Peer.Handshake.Body['encrypt'],
  lid?: string,
  type: 'server' | 'chat'
}

export const chatSetup = (lid: string) => new Promise<void>((ok) => {
  const chat = new Chat(lid).then!(() => {
    console.log('peer setup');
    chat.listen('connection', async conn => {
      await conn.ready
      console.log(conn)
      chat.linkList[conn.metadata[1]] = {
        connection: conn,
        number: NaN
      }
      useAppStore().links.push(conn.metadata[0])
      actor.send({ type: 'quit', to: 'goChat', params: { dev: false, type: 'temp', uid: conn.metadata[1] } })
      return true
    })
    ok()
  })
  console.log('chat', chat);
})