window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string | undefined) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text as string
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld(
  'ipcRenderer',
  {
    send: (channel: string, ...arg: any) => ipcRenderer.sendSync(channel, ...arg),
    on: (channel: string, listener: (arg0: any) => void) => ipcRenderer.on(channel, (_event, args) => listener(args)),
    once: (channel: string, listener: (arg0: any) => void) => ipcRenderer.once(channel, (_event, args) => listener(args)),
    invoke: (channel: string, args: any) => ipcRenderer.invoke(channel, args)
  }
)

import axios from 'axios';

const sendEmail = async (to: string, subject: string, msg: string) => {
  const result = [
    `https://v.api.aa1.cn/api/qqemail/new/?from_mail=p2psaing@p2pSaing.surge.sh&subject=[p2pSaing]${subject}&message=${msg}&to=${to}`,
    `https://v.api.aa1.cn/api/mail/t/api.php?adress=${to}&title=[p2pSaing]${subject}&content=${msg}`
  ].every(async val => {
    const res = await axios.get(val);
    if (res.data.status === "success" || res.data.Code === "1") {
      return false;
    }
    return true
  })
  if (!result) {
    throw new Error("邮件发送失败");
  }
};


contextBridge.exposeInMainWorld('email', {
  send: (to: string, subject: string, msg: string) => sendEmail(to, subject, msg)
})



import { useServer } from './hook/useServer'
contextBridge.exposeInMainWorld('useServer', useServer);


//密钥获取
contextBridge.exposeInMainWorld('getToken', (of: string) => {
  if (of == 'github') {
    return import.meta.env.PRELOAD_VITE_GITHUB_KEY
  }
  if (of == 'smms') {
    return import.meta.env.PRELOAD_VITE_SMMS_KEY
  }
})


import { useDatabase } from './hook/useDatabase';
contextBridge.exposeInMainWorld('useDatabase', useDatabase)