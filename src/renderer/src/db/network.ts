import axios, { AxiosError } from "axios";
import { handleError } from "@/utils/axios";
import { z, type TypeOf } from "zod";
import { toNumber } from "lodash-es";
import { useUserStore } from "@/store/user";
export const apiUrl = import.meta.env.DEV ? "http://localhost:8787" : "https://p2psaing.wenxig.workers.dev"
export const { data: { data: jwt } } = await axios.get<Api.Success<string>>(`${apiUrl}/jwt`)
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
const getUserAddAddressByUid = async (uid: number) => (await base.post<Api.Success<User.MsgSave>>('/user/address/add-list', { type: 'uid', uid })).data.data
const getUserAddAddressByEmail = async (email: string) => (await base.post<Api.Success<User.MsgSave>>('/user/address/add-list', { type: 'email', email })).data.data
const addUserAddAddressByEmail = async (email: string) => (await base.patch<Api.Success<void>>('/user/address/add-list', { type: 'email', email, is: useUserStore().user.uid, pid: useUserStore().user.pid })).data.data
const addUserAddAddressByUid = async (uid: number) => (await base.patch<Api.Success<void>>('/user/address/add-list', { type: 'uid', uid, is: useUserStore().user.uid, pid: useUserStore().user.pid })).data.data
const getUserAddressByUid = async (uid: number) => (await base.post<Api.Success<User.MsgSave>>('/user/address', { type: 'uid', uid })).data.data
const getUserAddressByEmail = async (email: string) => (await base.post<Api.Success<User.MsgSave>>('/user/address', { type: 'email', email })).data.data
const addUserAddressByEmail = async (email: string) => (await base.patch<Api.Success<void>>('/user/address', { type: 'email', email, is: useUserStore().user.uid, pid: useUserStore().user.pid })).data.data
const addUserAddressByUid = async (uid: number) => (await base.patch<Api.Success<void>>('/user/address', { type: 'uid', uid, is: useUserStore().user.uid, pid: useUserStore().user.pid })).data.data
const hasUserByUid = async (uid: number) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'uid', uid })).data.data
const hasUserByEmail = async (email: string) => (await base.post<Api.Success<boolean>>('/user/has', { type: 'email', email })).data.data
const removeUserAddAddressByEmail = async (email: string) => (await base.delete<Api.Success<void>>('/user/address/add-list', { data: { type: 'email', email } })).data.data
const removeUserAddAddressByUid = async (uid: number) => (await base.delete<Api.Success<void>>('/user/address/add-list', { data: { type: 'uid', uid } })).data.data
const removeUserAddressByEmail = async (email: string) => (await base.delete<Api.Success<void>>('/user/address', { data: { type: 'email', email } })).data.data
const removeUserAddressByUid = async (uid: number) => (await base.delete<Api.Success<void>>('/user/address', { data: { type: 'uid', uid } })).data.data
export const getUser = (tag: number | string) => isType(tag, z.string().email()) ? getUserByEmail(tag) : getUserByUid(toNumber(tag))
export const hasUser = (tag: number | string) => isType(tag, z.string().email()) ? hasUserByEmail(tag) : hasUserByUid(toNumber(tag))

async function handleReloadAddress<T>(arg: T, tag?: string): Promise<T> {
  arg = await arg
  console.log(tag, arg, { [tag ?? '']: arg }, JSON.stringify({ [tag ?? '']: arg }))
  window.ipc.reload('address-list', JSON.stringify({ [tag ?? '']: arg }))
  return arg as T
}
export const getUserAddAddress = (tag: number | string, ..._args: any) => isType(tag, z.string().email()) ? getUserAddAddressByEmail(tag) : getUserAddAddressByUid(toNumber(tag))
export const getUserAddress = (tag: number | string, ..._args: any) => isType(tag, z.string().email()) ? getUserAddressByEmail(tag) : getUserAddressByUid(toNumber(tag))
export const addUserAddAddress = (tag: number | string, ..._args: any) => handleReloadAddress(isType(tag, z.string().email()) ? addUserAddAddressByEmail(tag) : addUserAddAddressByUid(toNumber(tag)), 'add-list')
export const addUserAddress = (tag: number | string, ..._args: any) => handleReloadAddress(isType(tag, z.string().email()) ? addUserAddressByEmail(tag) : addUserAddressByUid(toNumber(tag)), 'base-list')
export const removeUserAddAddress = (tag: number | string, ..._args: any) => handleReloadAddress(isType(tag, z.string().email()) ? removeUserAddAddressByEmail(tag) : removeUserAddAddressByUid(toNumber(tag)), 'add-list')
export const removeUserAddress = (tag: number | string, ..._args: any) => handleReloadAddress(isType(tag, z.string().email()) ? removeUserAddressByEmail(tag) : removeUserAddressByUid(toNumber(tag)), 'base-list')

export default base