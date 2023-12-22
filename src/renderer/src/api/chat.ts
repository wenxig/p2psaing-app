import db from "@/db";
import { getTimeByUid, searchByUid } from "@/db/network";
import { useUserStore } from "@/store/user";
import { isHandShake, isHandShakeHeader, P2P } from ".";
import { toUserWebSave } from "@/utils/user";
import { isEmpty, isNumber, random } from "lodash-es";
import { ref } from "vue";
import { useAppStore } from "@/store/appdata";
import { Connection } from './connection';


const chat_ref = ref<Chat>()
const isReady = ref(false)
export class Chat extends P2P {
  public linkList = <Record<number, {
    connection: Connection;
    number: number
  }>>{}
  me: User.WebDbSave
  isCloseing = false
  public static get ref() {
    return chat_ref.value!
  }
  public async setup() {
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
    this.me = user
    this.listen('connection', (connection) => {
      return new Promise(resolve => {
        console.log('first handshake');
        connection.onData('/handshake', (req) => {
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
              seq: this.linkList[connection.metadata[1]].number
            }
          }
        })
      })
    })
  }
  public async connect(uid: number, config: Peer.CreateConfig): Promise<[connection: Connection, ok: true] | [connection: undefined, ok: false]> {
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
    db.setTempUserData(user, await getTimeByUid(uid))
    const app = useAppStore()
    app.links.push(user)
    this.linkList[uid] = {
      connection,
      number: 0
    }
    return [connection, true]
  }
  
  private async handShake(connection: Connection, config: Peer.CreateConfig): Promise<boolean> {
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
    const { body: res1_body, headers: res1_headers } = await connection.send('/handshake', body1, {
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
    const { body: res2_body } = await connection.send('/handshake', body1, {
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
}

export type PeerLinkList = {
  lid: string,
  connection: Peer.Connection,
  uid: number
}
