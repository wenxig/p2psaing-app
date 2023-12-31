import db from "@/db";
import { getTimeByUid, searchByUid } from "@/db/network";
import { useUserStore } from "@/store/user";
import { P2P } from ".";
import { toUserWebSave } from "@/utils/user";
import { isEmpty, isNumber, random } from "lodash-es";
import { ref } from "vue";
import { useAppStore } from "@/store/appdata";
import { Connection } from './connection';
import { z } from "zod";
import { webSaveRule } from '@/utils/user'
export function isRequest(value: unknown): value is Peer.Request.All {
  const rule = z.object({
    path: z.string().startsWith('/'),
    headers: z.object({
      time: z.number(),
      from: webSaveRule.or(z.number())
    }),
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
export function isHandShakeBody(value: unknown): value is Peer.Handshake.Body {
  return z.object({
    encrypt: z.boolean().or(z.enum(['base'])),
    ok: z.boolean(),
  }).strict().safeParse(value).success
}
export function isHandShakeHeader(value: unknown): value is Peer.Handshake.Header {
  return z.object({
    syn: z.number().optional(),
    seq: z.number().optional(),
    ack: z.number().optional(),
    _ack: z.number().optional(),
  }).safeParse(value).success
}
export function isHandShake(value: unknown): value is Peer.Request.Handshake {
  if (!isRequest(value)) return false
  return isHandShakeBody(value.body) && isHandShakeHeader(value.headers)
}
export function isMsg(value: unknown): value is Peer.Request.Msg {
  if (!isRequest(value)) return false
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
  return ruls.some(fn => {
    return z.object(fn).strict().safeParse(value.body).success
  })
}

const chat_ref = ref<Chat>()
const isReady = ref(false)
let me: undefined | User.WebDbSaveDeep = undefined
export class Chat extends P2P {
  public linkList = <Record<number, {
    connection: Connection;
    number: number
  }>>{}
  public get me() {
    if (me) {
      return me
    }
    const user = useUserStore().user
    return me = user
  }
  isCloseing = false
  public static get ref() {
    return chat_ref.value!
  }
  public async setup() {
    if (isReady.value == true) return this
    console.log('setup');
    await this.whenReady()
    console.log('ready');
    chat_ref.value = this
    isReady.value = true
    this.peer.on('disconnected', () => {
      if (this.isCloseing)
        return
      this.peer.reconnect()
    })
    return this
  }
  constructor(lid?: string) {
    const user = useUserStore().user
    super(lid ?? user.lid)
    this.listen('connection', (connection) => {
      return new Promise(resolve => {
        console.log('first handshake');
        connection.onData('/handshake', async (req) => {
          if (!isHandShake(req)) {
            console.log('isn`t handShake', req);

            resolve(false)
            return false
          }
          if (req.headers._ack) {
            if (isNumber(req.headers.from)) {
              req.headers.from = await searchByUid(req.headers.from)
            }
            if (req.headers.ack != 1 || req.headers._ack != this.linkList[req.headers.from.uid].number + 1) {
              resolve(false)
              return false
            }
            this.linkList[req.headers.from.uid]
            const res: Peer.Handshake.Body = {
              ...req.body,
              ok: true,
            }
            console.log('finally handshake');
            resolve(true)
            return {
              path: '/handshake',
              body: res,
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
          connection.listen('close', () => {
            if (!isEmpty(this.linkList[connection.metadata[1]]))
              delete this.linkList[connection.metadata[1]]
          })
          this.linkList[connection.metadata[1]] = {
            connection,
            number: random(0, 10000)
          }
          return {
            path: '/handshake',
            body: req.body,
            headers: {
              syn: 1,
              ack: 1,
              _ack: req.headers.seq! + 1,
              seq: this.linkList[connection.metadata[1]].number,
              from: toUserWebSave(this.me),
              time: new Date().getTime()
            }
          }
        })
      })
    })
  }
  public async connect(uid: number, config: CreateConfig): Promise<[connection: Connection, ok: true] | [connection: undefined, ok: false]> {
    await this.whenReady()
    console.log('search user');
    const user = await searchByUid(uid)
    const connection = new Connection(this.peer.connect(user.lid, {
      reliable: true,
      label: 'chat',
      metadata: [toUserWebSave(this.me), this.me.uid]
    }) as Peer.Connection)
    await this.whenReady()
    console.log('connection opened');
    if (!await this.handShake(connection, config))
      return [undefined, false]
    db.tempUserData.set(user, await getTimeByUid(uid))
    const app = useAppStore()
    app.links.push(user)
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

    console.log('before first handshaked');
    const res1 = await connection.send('/handshake', body1, {
      header: {
        ...header1,
        from: toUserWebSave(this.me),
        time: new Date().getTime(),
      }
    })
    console.log('first handshaked', res1.body, isHandShakeBody(res1.body), res1.headers, isHandShakeHeader(res1.headers));
    if (!isHandShake(res1)) {
      connection.close()
      return false
    }
    if (res1.headers.syn != 1 || res1.headers.ack != 1 || res1.headers._ack != header1.seq! + 1 || !isNumber(res1.headers.seq)) {
      connection.close()
      return false
    }

    //todo 三次握手
    console.log('before handshake');
    const res2 = await connection.send('/handshake', body1, {
      header: {
        ack: res1.headers.ack,
        _ack: res1.headers.seq + 1,
        from: toUserWebSave(this.me),
        time: new Date().getTime(),
      }
    })
    console.log('finally handshaked');

    //todo 校验数据
    if (!isHandShake(res2) || !res2.body.ok) {
      connection.close()
      return false
    }
    if (JSON.stringify(await searchByUid((<User.WebDbSave>res2.headers.from).uid)) != JSON.stringify(res2.headers.from)) {
      connection.close()
      return false
    }
    console.log('handshaked ok');
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