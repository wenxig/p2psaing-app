/// <reference types="vite/client" />
import type { DataConnection } from 'peerjs';

declare namespace Link {
  type RoomListType = {
    id: string,
    msg: MsgType[],
    connForThey: DataConnection
    isDisconnected?: boolean
    islink?: boolean
  }
  interface MsgType {
    msg: string,
    type: "text" | "img",
    is: "sys" | "my" | "they",
    md5?: string,
    index: number,
    blob?: Blob
  }
}