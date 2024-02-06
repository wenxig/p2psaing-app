import axios, { AxiosError } from "axios";
import { handleError } from "@/utils/axios";
const apiUrl = "https://p2psaing.wenxig.workers.dev"
const { data: jwt } = await axios.post<string>(apiUrl, {
  method: 'getJWT'
})
const base = axios.create({
  baseURL: apiUrl,
  method: 'post',
  headers: { jwt }
})
base.interceptors.response.use(undefined, handleError)

export const sendEmail = async (to: string, subject: string, msg: string) => {
  if ([
    `https://v.api.aa1.cn/api/qqemail/new/?from_mail=__APP_NAME__@__APP_NAME__.surge.sh&subject=[__APP_NAME__]${subject}&message=${msg}&to=${to}`,
    `https://v.api.aa1.cn/api/mail/t/api.php?adress=${to}&title=[__APP_NAME__]${subject}&content=${msg}`
  ].every(async val => {
    try {
      const { data } = await axios.get(val);
      return !(data.status === "success" || data.Code === "1")
    } catch (error) {
      return false;
    }
  })) {
    throw new AxiosError("can`t send email")
  }
};

export const getSerectUser = async (pid: string) => JSON.parse(window.ipc.decryptUserData((await base<string>({
  data: {
    data: pid,
    method: 'getSerectUser'
  }
})).data)) as [User.WebDbSaveDeep, true] | [undefined, false]
export const updateUser = (user: User.WebDbSaveDeep) => base({
  data: {
    method: 'updateUser',
    data: user
  }
})
export const count = async () => (await base<number>({ data: { method: "count" } })).data
export const searchByUid = async (uid: number) => (await base<User.WebDbSaveDeep>({ data: { method: 'getUser_uid', data: uid } })).data
export const searchByEmail = async (email: string) => (await base<User.WebDbSaveDeep>({ data: { method: 'getUser_email', data: email } })).data
export const getTimeByUid = async (uid: number) => (await base<number>({ data: { method: 'getTime_uid', data: uid } })).data
export const getTimeByEmail = async (email: string) => (await base<number>({ data: { method: 'getTime_email', data: email } })).data

export default base