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
  try {
    // 第一次尝试发送邮件
    const firstResponse = await axios.get(`https://v.api.aa1.cn/api/qqemail/new/?from_mail=p2psaing@p2pSaing.surge.sh&subject=[p2pSaing]${subject}&message=${msg}&to=${to}`);
    if (firstResponse.data.status === "success") {
      return firstResponse;
    }
    // 第一次发送失败，尝试第二次
    const secondResponse = await axios.get(`https://v.api.aa1.cn/api/mail/t/api.php?adress=${to}&title=[p2pSaing]${subject}&content=${msg}`);
    if (secondResponse.data.Code === "1") {
      return secondResponse;
    }
    // 第二次发送失败，尝试第三次
    const thirdResponse = await axios.post('https://api.7585.net.cn/mail/api.php', {
      bt: `[p2pSaing]${subject}`,
      wb: msg,
      address: to
    });
    if (thirdResponse.data.code === "1") {
      return thirdResponse;
    }
    // 所有尝试都失败
    throw new Error("邮件发送失败");
  } catch (error) {
    throw error;
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