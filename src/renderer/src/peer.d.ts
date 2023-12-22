namespace Peer {
  type _DataConnection = import('peerjs').DataConnection
  type Request<Tbody = Msg.index | Handshake> = {
    path: `/${string}`;
    headers: HandshakeHeader | Record<string, string>;
    body: Tbody;
  }
  interface Response {
    ok: boolean
  }
  interface Handshake {
    time: number,
    from: User.WebDbSave,
    encrypt: false | 'base',
    ok: boolean,
  }
  interface HandshakeHeader {
    syn?: number,
    seq?: number,
    ack?: number,
    _ack?: number
  }
  interface Connection extends _DataConnection {
    metadata: [starterData: User.WebDbSave, starterUid: number];
    // label: 'chat' | 'server'
    send: <Tbody = Msg.index | Handshake>(data: Request<Tbody> | isResponse, chunked?: boolean | undefined) => void | Promise<void>
  }
  type CreateConfig = {
    useEncrypt?: Handshake['encrypt'],
    lid?: string,
    type: 'server' | 'chat'
  }
  namespace Msg {
    type index = {
      from: number; //uid 
      time: number;
    } & (UserTextMsg | UserFileMsg | UserAppMsg | UserCodeMsg | UserEquationMsg | CallBask)

    type UserTextMsg = {
      main: string;
      type: "text";
    }
    type UserFileMsg = {
      main: string;
      md5: string;
      type: "img" | "file" | "video"
    }
    type UserAppMsg = {
      type: "appFunction";
      main: string
    }
    type UserCodeMsg = {
      type: "code";
      main: string;
      is: string
    }
    type UserEquationMsg = {
      type: "equation";
      main: string;
    }
    type CallBask = {
      type: "callback";
      main: true
    }
  }
}
type Connection = import("@/api/connection.ts").Connection