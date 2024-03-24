namespace User {
  interface MsgSave {
    group: {
      uid: number;
      msg: (Peer.Msg.index | never)[]
    }[];
    chat: WebDbSave[]
  }
  type WebDbSaveDeep = import("./utils/user").WebDbSaveDeep
  type WebDbSave = import("./utils/user").WebDbSave
  namespace Arg {
    type login = {
      pid: string
    }
    type sigeup = {
      name: string;
      password: string;
      email: string;
    }
  }
  type LastLogin = import("./utils/user").LastLogin
}


namespace RouterData {
  interface SignUp extends EmailCode {
    code: string
  }
  interface EmailCode {
    name: string;
    password: string;
    email: string;
  }
}