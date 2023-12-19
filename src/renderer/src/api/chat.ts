import db from "@/db";
import { getTimeByUid, searchByUid } from "@/db/network";
import { useUserStore } from "@/store/user";
import { DefaultOnLinkHandle, isHandShake, isHandShakeHeader } from ".";
import { toUserWebSave } from "@/utils/user";
import { isEmpty, isNumber, random } from "lodash-es";
import { ref } from "vue";
import { Peer as Peerjs } from 'peerjs'
import { useAppStore } from "@/store/appdata";



const chat_ref = ref<Chat>()
export class Chat {
  public linkList = <Record<number, {
    connection: Peer.Connection;
    number: number
  }>>{}
  public async setup(lid?: string) {
    this.me = useUserStore().user
    console.log('setup');
    const peer = await this.listenOnce('open', new Peerjs(lid ?? this.me.lid))
    console.log('ready');

    this.peer = peer
    chat_ref.value = this
    this.isReady = true
    peer.on('disconnected', () => {
      if (this.isCloseing)
        return
      peer.reconnect()
    })
    return this
  }
  public static get ref() {
    return chat_ref.value!
  }
  constructor() {
    super()
    Chat.default.onLink.unshift((connection) => {
      return new Promise(resolve => {
        console.log('first handshake');
        this.onPost(connection, '/handshake', (req) => {
          if (!isHandShake(req.body) || !isHandShakeHeader(req.headers)) {
            resolve(false)
            return false
          }
          if (req.headers._ack) {
            if (req.headers.ack != 1 || req.headers._ack != this.linkList[req.body.from.uid].number + 1) {
              resolve(false)
              return false
            }
            this.linkList[req.body.from.uid]
            const res: Peer.Handshake = {
              ...req.body,
              from: toUserWebSave(this.me),
              ok: true,
              time: new Date().getTime()
            }
            console.log('finally handshake');
            resolve(true)
            return {
              path: '/handshake',
              body: res,
              headers: {}
            }
          }
          if (req.headers.syn != 1) {
            resolve(false)
            return false
          }
          this.onDislink(connection, (conn) => {
            if (!isEmpty(this.linkList[conn.metadata[1]]))
              delete this.linkList[conn.metadata[1]]
          })
          console.log('second handshake', connection.metadata);
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
              seq: this.linkList[connection.metadata[1]].number
            }
          }
        })
      })
    })
  }
  public async onDislink(conn: Peer.Connection, handles: ((conn: Peer.Connection, ...props: any[]) => Promise<void> | void), ...props: any[]) {
    await this.whenReady()
    conn.on('close', async () => {
      await handles(conn, ...props)
    })
    return () => conn.off('close')
  }
  public async create(uid: number, config: Peer.CreateConfig): Promise<[connection: Peer.Connection, ok: true] | [connection: undefined, ok: false]> {
    await this.whenReady()
    console.log('search user');
    const user = await searchByUid(uid)
    const connection = this.peer.connect(user.lid, {
      reliable: true,
      label: 'client',
      metadata: [toUserWebSave(this.me), this.me.uid]
    })
    await this.listenOnce('open', connection)
    console.log('connection opened');
    if (!await this.handShake(connection, config))
      return [undefined, false]
    db.setTempUserData(user, await getTimeByUid(uid))
    const app = useAppStore()
    app.links.push(user)
    this.linkList[uid] = {
      connection,
      number: 0
    }
    return [connection, true]
  }
  private async handShake(connection: Peer.Connection, config: Peer.CreateConfig): Promise<boolean> {
    //todo 首次握手
    const body1: Peer.Handshake = {
      from: toUserWebSave(this.me),
      time: new Date().getTime(),
      encrypt: config.useEncrypt ?? false,
      ok: false
    }
    const header1: Peer.HandshakeHeader = {
      syn: 1,
      seq: random(0, 10000)
    }

    console.log('before first handshaked');
    const { body: res1_body, headers: res1_headers } = await this.post('/handshake', {
      connection,
      body: body1,
      header: header1
    })
    console.log('first handshaked', res1_body, isHandShake(res1_body), res1_headers, isHandShakeHeader(res1_headers));
    if (!isHandShake(res1_body) || !isHandShakeHeader(res1_headers)) {
      connection.close()
      return false
    }
    const _res1_headers: Peer.HandshakeHeader = res1_headers
    if (_res1_headers.syn != 1 || _res1_headers.ack != 1 || _res1_headers._ack != header1.seq! + 1 || !isNumber(_res1_headers.seq)) {
      connection.close()
      return false
    }

    //todo 三次握手
    console.log('before handshake');
    const { body: res2_body } = await this.post('/handshake', {
      connection,
      body: body1,
      header: <Peer.HandshakeHeader>{
        ack: _res1_headers.ack,
        _ack: _res1_headers.seq + 1
      }
    })
    console.log('finally handshaked');

    //todo 校验数据
    if (!isHandShake(res2_body) || !res2_body.ok || body1.time - res2_body.time == 0) {
      connection.close()
      return false
    }
    if (JSON.stringify(await searchByUid(res2_body.from.uid)) != JSON.stringify(res2_body.from)) {
      connection.close()
      return false
    }
    console.log('handshaked ok');
    return true
  }
  public async onLink(...handle: DefaultOnLinkHandle[]) {
    await this.whenReady()
    console.log(this);

    this.peer.on('connection', (connection: Peer.Connection) => {
      const isAllow = Chat.default.onLink.concat(handle).every(async fn => await fn(connection))
      if (!isAllow) {
        connection.close()
        return
      }
    })
  }
}

export type PeerLinkList = {
  lid: string,
  connection: Peer.Connection,
  uid: number
}
