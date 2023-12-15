namespace Peer {
  type _DataConnection = import('peerjs').DataConnection
  type Request<Tbody = Msg.index | Handshake> = {
    path: `/${string}`;
    headers: Record<string, string>;
    body: Tbody;
  }
  interface Response {
    ok: boolean
  }
  interface Handshake {
    time: number,
    from: User.WebDbSave,
    encrypt: false | 'base',
    ok: boolean
  }
  interface Connection extends _DataConnection {
    metadata(): [starterData: User.WebDbSave, starterUid: number];
    send: <Tbody = Msg.index | Handshake>(data: Request<Tbody> | isResponse, chunked?: boolean | undefined) => void | Promise<void>
  }
  type CreateConfig = {
    useEncrypt?: Handshake['encrypt'],
    lid?: string,
    type: 'server' | 'client'
  }
  namespace Msg {
    type index = {
      from: number; //uid
      time: number;
    } & (UserTextMsg | UserFileMsg | UserAppMsg | UserCodeMsg | UserEquationMsg)

    type UserTextMsg = {
      main: string;
      type: "text";
    }
    type UserFileMsg = {
      main: Blob;
      md5: string;
      type: "img" | "file" | "video"
    }
    type UserAppMsg = {
      type: "appFunction";
      main: any
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

  }
}