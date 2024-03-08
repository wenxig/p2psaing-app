import axios, { AxiosError } from "axios";
import { handleError } from "@/utils/axios";
const apiUrl = import.meta.env.DEV ? "http://localhost:8787" : "https://p2psaing.wenxig.workers.dev"
const { data: { data: jwt } } = await axios.get<Api.Success<string>>(`${apiUrl}/jwt`)
console.log(jwt)
const base = axios.create({
  baseURL: apiUrl,
  headers: { Authorization: jwt }
})
base.interceptors.response.use(undefined, handleError)

export const sendEmail = async (to: string, subject: string, msg: string) => {
  return
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

export const getSerectUser = async (pid: string) => (await base.post<Api.Success<User.WebDbSaveDeep>>('/user', {
  type: 'pid',
  pid
})).data.data
export const updateUser = (user: User.WebDbSaveDeep) => base.put('/user', user)
export const count = async () => (await base.get<Api.Success<number>>('/count')).data.data
export const searchByUid = async (uid: number) => (await base.post<Api.Success<User.WebDbSave>>('/user', { type: 'uid', uid })).data.data
export const searchByEmail = async (email: string) => (await base.post<Api.Success<User.WebDbSave>>('/user', { type: 'email', email })).data.data
export const getTimeByUid = async (uid: number) => (await base.post<Api.Success<number>>('/time', { type: 'uid', uid })).data.data
export const getTimeByEmail = async (email: string) => (await base.post<Api.Success<number>>('/time', { type: 'email', email })).data.data
export const hasUserByUid = async (uid: number) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'uid', uid })).data.data
export const hasUserByEmail = async (email: string) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'email', email })).data.data

export default base