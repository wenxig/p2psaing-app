import Peer, { DataConnection } from 'peerjs'
import type { ArgumentMap } from '.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3';
import { searchByUid } from '@/db/network'
import { toUserWebSave } from '@/utils/user';
import { isHandShake } from '@/utils/peer';

interface Connection extends DataConnection {
  metadata(): User.WebDbSave;
  send: (data: Peer.Handshake | User.Msg, chunked?: boolean | undefined) => void | Promise<void>
}
export namespace link {

  let my: User.WebDbSaveDeep
  let peerObj: Peer
  let isCloseing = false //? "ing"表主动
  export async function setup() {
    my = (await import('@s/user')).useUserStore().user
    peerObj = new Peer(my.pid).once("open", () => {
      peerObj.on('disconnected', () => {
        if (isCloseing) {
          return
        }
        peerObj.reconnect()
      })
      handleConnect()
    }) as unknown as ArgumentMap<object> as Peer
  }
  export async function link(uid: number, useEncrypt: User.Handshake['encrypt'] = false): Promise<Connection> {
    const user = await searchByUid(uid)
    const connection: Connection = peerObj.connect(user.lid, {
      reliable: true,
      label: user.uid.toString(),
      metadata: user
    })
    const msg: User.Handshake = {
      from: toUserWebSave(my),
      time: new Date().getTime(),
      encrypt: useEncrypt,
      ok: false
    }
    connection.on('error', (err) => {
      throw err
    })
    await connection.send(msg)
    return connection
  }
  function handleConnect() {
    peerObj.on('connection', (they: Connection) => {
      they.on('data', (data): void => {
        if (isHandShake(data)) {
          data.ok
        }
      })
    })
  }
}