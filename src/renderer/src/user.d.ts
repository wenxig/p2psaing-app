namespace User {
  type Base = {
    name: string;
    password: string;
    email: string;
  }
  type Ids = {
    pid: string;
    uid: number;
    lid: string;
  }
  interface MsgSave {
    group: {
      uid: Pick<Ids, "uid">;
      msg: (Peer.Msg.index | never)[]
    }[];
    chat: {
      uid: Pick<Ids, "uid">;
      name?: string;
      msg: (Peer.Msg.index | never)[]
    }[]
  }
  interface WebDbSaveDeep extends Base, Ids {
    img: string;
    introduction?: string;
    delImg?: string;
    link: {
      group: {
        gid: string;
      }[];
      chat: {
        uid: number;
      }[]
    }
  }
  interface WebDbSave {
    name: string;
    img: string;
    email: string;
    introduction?: string;
    lid: string;
    uid: number
  }
  namespace Arg {
    type login = {
      email: string,
      password: string
    }
    type sigeup = Base
  }
  type LastLogin = {
    img: string;
  } & Base

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