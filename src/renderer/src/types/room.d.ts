/// <reference types="vite/client" />
import type { DataConnection } from 'peerjs';

declare namespace Room {
  type RoomListType = {
    id: string,
    msg: MsgType[],
    connForThey: DataConnection
    connForThey2: DataConnection
  }
  type MsgType ={
    from: string,
    msg: string,
    type: "text" | "img",
    is: "sys" | "my" | "they",
    md5?: string,
    serverId: [string, string],
    time: Date,
    blob?: Blob,
    uptoServer?:boolean
  }
  type options ={
    id?: string
    maxUser?: number
    for?:'link'|'join'
  }
  type joinData = {
    ok:boolean
    server?:boolean
    isServer?:boolean
    type:'join'|'link'
  }
}
