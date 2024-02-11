namespace Peer {
  type _DataConnection = import('peerjs').DataConnection
  namespace Request {
    type Msg = {
      path: string;
      headers: BaseHeader & {
        from: number
      } & Record<string, string | number>;
      body: Msg.index
    }
    type All = Msg

    type BaseHeader = {
      time: number,
      from: User.WebDbSave | number,
    } & Record<string, string | number>
  }  namespace Msg {
    type index = All
    type All = {} & (UserTextMsg | UserFileMsg | UserAppMsg | UserCodeMsg | UserEquationMsg)

    type UserTextMsg = {
      main: string;
      type: "text";
    }
    type UserFileMsg = {
      type: "img" | "file" | "video" | "article",
      md5: string,
      name: string,
      main: string;
    }
    type UserAppMsg = {
      type: "appFunction";
      main: any
    }
    type UserCodeMsg = {
      type: "code";
      main: string;
      is: number
    }
    type UserEquationMsg = {
      type: "equation";
      main: string;
    }
  }
}
