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
      lid: Pick<Ids, "lid">;
      msg: (Msg | never)[]
    }[];
    chat: {
      lid: Pick<Ids, "lid">;
      name?: string;
      msg: (Msg | never)[]
    }[]
  }
  interface WebDbSaveDeep extends Base, Ids {
    img: string;
    introduction?: string;
    delImg?: string;
    link: {
      group: {
        lid: Pick<Ids, 'lid'>;
      }[];
      chat: {
        lid: Pick<Ids, 'lid'>;
        name?: string;
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
  type Msg = {
    from: string;
    time: Date;
  } & (UserTextMsg | UserFileMsg | UserAppMsg | UserCodeMsg | UserEquationMsg) & Omit<Ids, "pid">
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

type UserTextMsg = {
  main: string;
  type: "text";
}
type UserFileMsg = {
  blob: Blob;
  md5: string;
  type: "img" | "file" | "video"
}
type UserAppMsg = {
  type: "appFunction";
  action: any
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