namespace User {
  interface DbSave extends WebDbSaveDeep extends IndexUser {
    email: string
  }
  interface MsgSave {
    group: {
      linkId: string;
      msg: Msg[]
    }[];
    chat: {
      to: string;
      name?: string;
      msg: Msg[]
    }[]
  }
  type IndexUser = {
    name: string;
    uid: number;
    id: string;
    img: string;
    link: MsgSave
  }
  interface WebDbSaveDeep extends UserObj {
    id: string;
    uid: number;
    img: string;
    delImg?: string;
    link: {
      group: {
        linkId: string;
        msg?: never[]
      }[];
      chat: {
        msg?: never[]
        to: string;
        name?: string;
      }[]
    }
  }
  interface WebDbSave {
    name: string;
    img: string;
    email: string;
    id: string;
  }
  type Msg = {
    from: string;
    time: Date;
    uid: number;
  } & Omit<WebDbSave, "img"> & (UserTextMsg | UserFileMsg | UserAppMsg | UserCodeMsg | UserEquationMsg)

  type UserObj = {
    name: string;
    password: string;
    email: string;
    introduction?: string
  }

  type loginArg = {
    password: string;
    email: string;
  }
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