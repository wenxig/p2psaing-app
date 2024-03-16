import axios, { AxiosError } from "axios";
import { handleError } from "@/utils/axios";
import { z, type TypeOf } from "zod";
import { toNumber } from "lodash-es";
const apiUrl = import.meta.env.DEV ? "http://localhost:8787" : "https://p2psaing.wenxig.workers.dev"
const { data: { data: jwt } } = await axios.get<Api.Success<string>>(`${apiUrl}/jwt`)
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
export const isType = <T extends z.ZodType>(val: unknown, type: T): val is TypeOf<T> => type.safeParse(val).success

export const getSerectUser = async (pid: string) => (await base.post<Api.Success<User.WebDbSaveDeep>>('/user', {
  type: 'pid',
  pid
})).data.data
export const updateUser = async (user: User.WebDbSaveDeep) => (await base.put<Api.Success<number>>('/user', user)).data.data
export const count = async () => (await base.get<Api.Success<number>>('/count')).data.data
const getUserByUid = async (uid: number) => (await base.post<Api.Success<User.WebDbSave>>('/user', { type: 'uid', uid })).data.data
const getUserByEmail = async (email: string) => (await base.post<Api.Success<User.WebDbSave>>('/user', { type: 'email', email })).data.data
const getTimeByUid = async (uid: number) => (await base.post<Api.Success<number>>('/user/time', { type: 'uid', uid })).data.data
const getTimeByEmail = async (email: string) => (await base.post<Api.Success<number>>('/user/time', { type: 'email', email })).data.data
const getUserAddressByUid = async (uid: number) => (await base.post<Api.Success<User.MsgSave['chat']>>('/user/address', { type: 'uid', uid })).data.data
const getUserAddressByEmail = async (email: string) => (await base.post<Api.Success<User.MsgSave['chat']>>('/user/address', { type: 'email', email })).data.data
const addUserAddressByEmail = async (email: string) => (await base.patch<Api.Success<number>>('/user/address', { type: 'email', email })).data.data
const addUserAddressByUid = async (uid: number) => (await base.patch<Api.Success<number>>('/user/address', { type: 'uid', uid })).data.data
const hasUserByUid = async (uid: number) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'uid', uid })).data.data
const hasUserByEmail = async (email: string) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'email', email })).data.data
export const getTime = (tag: number | string) => isType(tag, z.string().email()) ? getTimeByEmail(tag) : getTimeByUid(toNumber(tag))
export const getUser = (tag: number | string) => isType(tag, z.string().email()) ? getUserByEmail(tag) : getUserByUid(toNumber(tag))
export const getUserAddress = (tag: number | string) => isType(tag, z.string().email()) ? getUserAddressByEmail(tag) : getUserAddressByUid(toNumber(tag))
export const addUserAddress = (tag: number | string) => isType(tag, z.string().email()) ? addUserAddressByEmail(tag) : addUserAddressByUid(toNumber(tag))
export const hasUser = (tag: number | string) => isType(tag, z.string().email()) ? hasUserByEmail(tag) : hasUserByUid(toNumber(tag))

export default base