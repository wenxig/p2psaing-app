import { Link } from '@t/link'
import { Room } from '@t/room'
import Peer, { type DataConnection } from 'peerjs'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { Server } from '@a/server'
//@ts-ignore
import type { ArgumentMap } from '.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3';
const db = window.useDatabase('')
const user = JSON.parse(db.get<string>('user', "{}" as any)) as User.DbSave
export default defineStore('link', () => {
  const userList: Link.RoomListType[] = reactive([])
  const roomList: Room.RoomListType[] = reactive([])
  const peerObj = reactive(new Peer(user.id))
  peerObj.once("open", () => {
    peerObj.on('disconnected', () => {
      peerObj.reconnect()
    })
  })

  function onConnection(callback: (id: string, yes: () => DataConnection, no: () => void) => void) {
    peerObj.once("connection", (connForThey: DataConnection) => {
      callback(connForThey.peer, () => {
        connForThey.send({
          ok: true
        })
        addToLinklist(connForThey)
        return connForThey
      }, () => {
        connForThey.send({
          ok: false
        })
        connForThey.close()
      })
    })
  }
  async function linkto(id: string, yes: (id: string, conn: DataConnection) => void, no: () => void, isRoom?: boolean) {
    const connForThey = peerObj.connect(id)
    const main = () => {
      return new Promise((reolved) => {
        connForThey.once('open', () => {
          if (isRoom) {
            connForThey.send({ type: 'join' })
          }
          connForThey.once("data", async (d) => {
            const data = d as Room.joinData
            if (data.ok) {
              if (data.server) {
                let connForThey2 = peerObj.connect(id)
                if (data.isServer) {
                  connForThey2 = await newServer()
                } else {
                  connForThey2 = peerObj.connect(id)
                }
                connForThey2.once('open', () => {
                  reolved(addToRoomlist(connForThey, connForThey2))
                })
              } else {
                reolved(addToLinklist(connForThey))
              }
            } else {
              connForThey.close()
              no()
            }
          })
        })
      })
    }
    function newServer(): Promise<DataConnection> {
      const serid = connForThey.peer.startsWith("2-") ? connForThey.peer.substring(2) : "2-" + connForThey.peer
      return new Promise((resolve) => {
        const ser = new Server(() => {
          ser.otherServer = ser.peerObj.connect(connForThey.peer)
          ser.otherServer.on('open', () => {
            ser.otherServer?.on('data', () => {
              ser.otherServer?.send({ online: true })
            })

            if (ser.otherServer) {
              resolve(ser.otherServer)
            }
          })
        }, {
          id: serid,
        })
      })
    }
    main().then(() => {
      yes(id, connForThey)
    })
    return () => {
      connForThey.off("data")
      connForThey.close()
    }
  }
  function addToLinklist(connForThey: DataConnection) {
    userList.push({
      id: connForThey.peer,
      msg: [],
      connForThey,
      islink: true,
      isDisconnected: false
    })
  }
  function addToRoomlist(connForThey: DataConnection, connForThey2: DataConnection) {
    roomList.push({
      id: connForThey.peer,
      msg: [],
      connForThey,
      connForThey2
    })
  }
  function endLink(connForThey: DataConnection) {
    connForThey.close()
    peerObj.off("connection")
  }
  return { roomList, userList, peerObj, onConnection, linkto, addToLinklist, endLink }
})