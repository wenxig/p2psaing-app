import Peer from 'peerjs'
import type { ArgumentMap } from '.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3';
export namespace link {
  let user: User.WebDbSaveDeep
  let peerObj: Peer
  export async function setup() {
    user = (await import('@/store')).useUserStore().user.value
    peerObj = new Peer(user.pid).once("open", () => {
      peerObj.on('disconnected', () => {
        peerObj.reconnect()
      })
    }) as unknown as ArgumentMap<object> as Peer
  }
}