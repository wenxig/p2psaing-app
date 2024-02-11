import { DataConnection, Peer as Peerjs } from 'peerjs'
import { ceil, remove, times, toNumber } from 'lodash-es'
import { Url, isUrlMatched, toUrl } from '@/utils/url'
import { toUserWebSave } from '@/utils/user'
import { MD5, enc } from 'crypto-js'
import lightLangs from '@/assets/lightLang.json';
import { useUserStore } from '@/store/user';
import { ref } from 'vue';
import { useAppStore } from '@/store/appdata'
import { actor } from '@/controller'

export const createPeer = (lid: string) => new Promise<Peer>(r => new Peer(lid, r))
export class Peer {
  public peer: Peerjs
  constructor(lid: string, then: (ins: Peer) => any) {
    this.peer = new Peerjs(lid)
    const setUpPeer = () => {
      (<WebSocket>(<any>this.peer.socket)._socket).onerror = () => {
        this.peer.off('open')
        this.peer = new Peerjs(lid)
        setUpPeer()
      };
      this.peer.once('open', () => {
        console.log('then')
        this.peer.off('open')
        this.peer.on('error', console.error)
        this.peer.on('disconnected', this.peer.reconnect)
        then(this);
        (<WebSocket>(<any>this.peer.socket)._socket).onerror = undefined as any
        this.peer.on('connection', (conn) => new Connection(conn, this.peer, conn => {
          this.allConnects.push(conn)
          return () => remove(this.allConnects, conn)
        }))
      })
    }
    setUpPeer()
  }
  public connect(lid: string, mode: ConnectionMode) {
    return new Promise<Connection>(r => {
      new Connection(lid, this.peer, conn => {
        this.allConnects.push(conn)
        r(conn)
        return () => remove(this.allConnects, conn)
      }, mode)
    })
  }
  public allConnects = new Proxy<Connection[]>([], {
    set(...value) {
      Reflect.set(...value)
      useAppStore().allConnects[value[1]] = value[2]
      return true
    }
  })
}
type ConnectionMode = 'temp' | 'forever' | 'temp_group' | 'forever_group';
export class Connection {
  public conn: DataConnection
  public mode: ConnectionMode
  public starter: number
  public CHUNK_SIZE = 1000
  public async send(request: Request) {
    return new Promise<void>(ok => {
      const msgBody = request.body.toString()
      const msgHeaders = request.headers.toString()
      const quantityChunks = ceil(msgBody.length / this.CHUNK_SIZE)
      const msgId = request.body.md5()
      this.conn.send(`[msg-id-@${msgId} path-@${request.path} from-@${useUserStore().user.uid}]`)
      this.conn.send(`[msg-id-@${msgId} msg-begin msg-type-@${request.type} chunk-size-@${this.CHUNK_SIZE} quantity-chunks-@${quantityChunks}]`)
      this.conn.send(`[msg-id-@${msgId} ${msgHeaders}]`)
      times(quantityChunks, i => this.conn.send(`[msg-id-@${msgId} chunk-index-@${i} msg-body-@${msgBody.substring(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE)}]`))
      this.conn.send(`[msg-id-@${msgId} msg-end msg-type-@${request.type} chunk-size-@${this.CHUNK_SIZE} quantity-chunks-@${quantityChunks}]`)
      ok()
    })
  }
  private _msgStack: Record<string, string> = {}
  public onData(path: string, fn: (data: Response) => any): () => void {
    if (!/(\/(:)?\w+)+/g.test(path)) throw new SyntaxError('path fomtar error')
    const handleMessage = (msg: unknown): any => {
      // console.log(msg)
      if (typeof msg !== 'string') return
      const id = msg.match(/(?<=(^\[msg-id-@))\w+/g)?.[0];
      if (!id) return
      if (isUrlMatched(path, msg.match(/(?<=path-@).+(?=\s)|(?=])/g)?.[0] ?? '')) return this._msgStack[id] = msg
      if (this._msgStack[id]) this._msgStack[id] += `<|%row%|>${msg}`
      if (msg.includes('msg-end')) {
        const fnRet = fn(new Response(this._msgStack[id]))
        if (fnRet instanceof Request) this.send(fnRet)
      }
    }
    this.conn.on('data', handleMessage)
    return () => void this.conn.off('data', handleMessage)
  }
  public users = new Array<User.WebDbSave>()
  public isOpen = ref(false)
  constructor(conn: DataConnection, peer: Peerjs, then: (conn: Connection) => () => void)
  constructor(lid: string, peer: Peerjs, then: (conn: Connection) => () => void, mode: ConnectionMode)
  constructor(lid_conn: string | DataConnection, peer: Peerjs, then: (conn: Connection) => () => void, mode?: ConnectionMode) {
    const { user } = useUserStore()
    this.users.push(toUserWebSave(user))
    const app = useAppStore()
    if (typeof lid_conn == 'string') {
      this.conn = peer.connect(lid_conn, {
        label: mode!,
        metadata: {
          starter: user.uid,
          mode: mode!
        }
      })
      this.mode = mode!
      this.starter = user.uid
    } else {
      this.conn = lid_conn
      this.mode = 'temp'
      this.starter = NaN
    }
    this.conn.once('data', data => {
      app.links.push(data as any)
      this.users.push(data as any)
      actor.send({ type: 'quit', to: 'goChat', params: { dev: false, type: 'temp', uid: (<User.WebDbSave>data).uid } })
    })
    this.conn.once('open', () => {
      this.isOpen.value = true
      if (typeof lid_conn != 'string') {
        this.mode = this.conn.metadata.mode
        this.starter = this.conn.metadata.starter
      }
      const remove = then(this)
      this.conn.once('close', () => {
        this.isOpen.value = false
        remove()
      })
      this.conn.send(toUserWebSave(user))
    })
  }

}
export class Request {
  public path: string;
  public body: Body;
  public headers: Header
  constructor(msg: Peer.Request.All)
  constructor(path: string, body: Body, headers: Header)
  constructor(p: string | Peer.Request.All, b?: Body, h?: Header) {
    if (typeof p == 'string') {
      this.path = p
      this.body = b!
      this.headers = h!
      return
    }
    this.path = p.path;
    this.body = new Body(p.body as any)
    this.headers = new Header(p.headers)
  }
  public type: Peer.Msg.All['type'] = 'text'
  public toPeerMsg(from: number) {
    const createMeg = (body: Peer.Msg.All): Peer.Request.Msg => ({
      body,
      headers: {
        ...this.headers.values,
        from,
      },
      path: this.path
    })
    switch (this.type) {
      case 'img':
      case 'file':
      case 'video':
      case 'article': {
        return createMeg({
          type: this.type,
          md5: MD5(this.body.body as string).toString(),
          name: '',
          main: this.body.body as string
        })
      }
      case 'text':
      case 'equation': {
        return createMeg({
          type: this.type,
          main: (<string | number>this.body.body).toString()
        })
      }
      case 'appFunction': {
        return createMeg({
          type: this.type,
          main: this.body.body
        })
      }
      case 'code': {
        return createMeg({
          type: this.type,
          main: (<Record<string, string>>this.body.body).code,
          is: lightLangs.find(r => r.label == (<Record<string, string>>this.body.body).is)!.value
        })
      }
    }
  }
}
export class Body {
  constructor(public body: any) { }
  public toString() {
    return enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(this.body)))
  }
  public md5() { return MD5(this.toString()).toString() }
}
export class Header {
  private header: Peer.Request.BaseHeader & Record<string, string | number>
  constructor(header: Record<string, string | number>) {
    this.header = {
      ...header,
      time: (new Date()).getTime(),
      from: useUserStore().user.uid,
    }
  }
  public toString(): string {
    const r = new Array<[string, string]>()
    for (const key in this.header) r.push([key, this.header[key].toString()])
    return r.map(r => r.join('-@')).join(' ')
  }
  public set(key: string, value: string) {
    this.header[key] = value
  }
  public get(key: string) {
    return this.header[key]
  }
  get values() {
    return this.header
  }
}
export class Response {
  public msg: string[]
  public body: Body
  public headers: Header
  public url: Url<{}, Record<string, string>>
  public type: Peer.Msg.All['type']
  public from: number
  constructor(public _msg: string) {
    this.msg = _msg.split('<|%row%|>')
    let body: any = ''
    console.log(this.msg, this.msg.slice(3, -1))
    this.msg.filter(v => v.includes('msg-body-@')).forEach((v, i) => {
      const isEnd = i == this.msg.slice(3, -1).length - 1
      body += v.match(/(?<=msg-body-@).*(?=\])/g)![0]
      if (isEnd) {
        body = enc.Base64.parse(body).toString(enc.Utf8)
        console.log(body)
        body = JSON.parse(body)
        console.log(body)
      }
      return

    })
    this.body = new Body(body)

    this.headers = new Header({})
    this.msg[2].replace(/(\[msg-id-@\w+\s)|(\])/g, '').split(' ').forEach(v => this.headers.set(v.split('-')[0], v.replaceAll(`${v.split('-@')[0]}-`, '').replaceAll('@', '')))

    this.url = toUrl(this.msg[0].match(/(?<=path-@)(\/|\w)*(?=(\])|\s)/g)![0])

    this.from = toNumber(this.msg[0].match(/(?<=from-@)\w*(?=(\])|\s)/g)![0])

    this.type = this.msg[1].match(/(?<=msg-type-@)\w*(?=(\])|\s)/g)![0] as Peer.Msg.All['type']
  }
  public toPeerMsg() {
    const createMeg = (body: Peer.Msg.All): Peer.Request.Msg => ({
      body,
      headers: this.headers.values as any,
      path: this.url.fullPath
    })
    console.log(this, this.body.body)
    return createMeg(this.body.body)
  }
}
