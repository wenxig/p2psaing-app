import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload';
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

import axios, { AxiosError } from 'axios';

const sendEmail = async (to: string, subject: string, msg: string) => {
  if ([
    `https://v.api.aa1.cn/api/qqemail/new/?from_mail=__APP_NAME__@__APP_NAME__.surge.sh&subject=[__APP_NAME__]${subject}&message=${msg}&to=${to}`,
    `https://v.api.aa1.cn/api/mail/t/api.php?adress=${to}&title=[__APP_NAME__]${subject}&content=${msg}`
  ].every(async val => {
    try {
      const res = await axios.get(val);
      if (res.data.status === "success" || res.data.Code === "1") {
        return false;
      }
      return true
    } catch (error) {
      throw new AxiosError(`can\`t send email, because: \n ${error}`)
    }
  })) {
    throw new AxiosError("can`t send email")
  }
};


contextBridge.exposeInMainWorld('email', {
  send: (to: string, subject: string, msg: string) => sendEmail(to, subject, msg)
})


//密钥获取
contextBridge.exposeInMainWorld('getToken', (of: string) => {
  if (of == 'github') {
    return import.meta.env.PRELOAD_VITE_GITHUB_KEY
  }
  if (of == 'smms') {
    return import.meta.env.PRELOAD_VITE_SMMS_KEY
  }
})