namespace User {
  interface MsgSave {
    group: {
      uid: number;
      msg: (Peer.Msg.index | never)[]
    }[];
    chat: {
      uid: number;
      name?: string;
      msg: (Peer.Msg.index | never)[]
    }[]
  }
  type WebDbSaveDeep = import("./utils/user").WebDbSaveDeep
  type WebDbSave = import("./utils/user").WebDbSave
  namespace Arg {
    type login = {
      email: string,
      password: string
    }
    type sigeup = {
      name: string;
      password: string;
      email: string;
    }
  }
  type LastLogin = {
    img: string;
    name: string;
    password: string;
    email: string;
  }
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