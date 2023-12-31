namespace Peer {
  type _DataConnection = import('peerjs').DataConnection
  namespace Request {
    type Handshake = {
      path: string;
      headers: Handshake.Header & BaseHeader
      body: Handshake.Body;
    }
    type Msg = {
      path: string;
      headers: BaseHeader & {
        from: number
      };
      body: Msg.index;
    }
    type All = Msg | Handshake

    type BaseHeader = {
      time: number,
      from: User.WebDbSave | number,
    }
  }
  interface Response {
    ok: boolean
  }
  interface Connection extends _DataConnection {
    metadata: [starterData: User.WebDbSave, starterUid: number];
    send: <Tbody = Msg.index | Handshake.Body>(data: Request<Tbody> | isResponse, chunked?: boolean | undefined) => void | Promise<void>
  }
  namespace Msg {
    type index = {

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
  namespace Handshake {
    interface Body {
      encrypt: false | 'base',
      ok: boolean,
    }
    interface Header {
      syn?: number,
      seq?: number,
      ack?: number,
      _ack?: number
    }
  }
}
type Connection = import("@/api/connection.ts").Connection