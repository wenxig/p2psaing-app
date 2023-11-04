import { Room } from '@t/room'
import { random } from 'lodash-es'
import Peer, { type DataConnection } from 'peerjs'
import { reactive, ref } from 'vue'
export class Server {
  id?: string
  peerObj: Peer
  isReady = ref(false)
  private isFirstJoin = 0
  private allConn: DataConnection[] = reactive([])
  private myId = ''
  otherServer?: DataConnection
  constructor(open: (id: string) => void, options: Room.options) {
    const id_inp = options.id || "";
    this.peerObj = new Peer(id_inp)

    this.peerObj.once('open', (id) => {
      this.isReady.value = true;
      this.id = id;
      this.peerObj.on('connection', (conn) => {
        conn.once('data', (d) => {
          const data = d as Room.joinData;
          const maxUser = options.maxUser ?? Infinity;
          const isJoinType = data.type === 'join';
          if (data.isServer) {
            this.otherServer = conn;
          }
          if (maxUser > this.allConn.length && isJoinType) {
            const isServer = (!this.otherServer) && !(this.isFirstJoin<2)
            console.log('isServer:', isServer, 'otherServer:', this.otherServer,'conn:',conn)
            conn.send({
              ok: true,
              server: true,
              isServer
            });
            if (this.isFirstJoin<2) {
              this.myId = conn.peer
            }
            if (isServer) {
              this.otherServer = conn;
              this.otherServer?.once('close', () => {
                this.otherServer = undefined;
                if (this.allConn.length > 1) {
                  this.otherServer = this.reSelServer()
                  this.otherServer?.send({
                    uptoServer: true
                  })
                }
              });
            }
            this.isFirstJoin++
            if (!isServer) {
              conn.once('close', () => {
                const index = this.allConn.indexOf(conn);
                if (index > -1) {
                  this.allConn.splice(index, 1);
                }
              });
              this.allConn.push(conn);
              conn.on('data', (d) => this.broadcast(d as Room.MsgType, conn));
            }
          }
        });
      });
      open(id);
    });
  }

  private reSelServer() {
    let is: DataConnection = this.allConn[random(0, this.allConn.length - 1)]
    do {
      is = this.allConn[random(0, this.allConn.length - 1)]
    } while (is.peer == this.myId)
    return is
  }

  public broadcast(d: Room.MsgType, unbroadcast: DataConnection) {
    this.allConn.forEach((v) => {
      if (unbroadcast.peer != v.peer) v.send(d)
    })
    if (this.otherServer) {
      console.log('online', true, this.otherServer)
      this.otherServer.send({
        online: true
      })
    }
  }
}
