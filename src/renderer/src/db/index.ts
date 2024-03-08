import { useUserStore } from "@s/user";
import { watchOnce } from "@vueuse/core";
import localforage from "localforage";
import { ref } from "vue";
import { getTimeByEmail, getTimeByUid, hasUserByEmail, searchByEmail, searchByUid } from '@/db/network'
import { remove } from "lodash-es";
namespace db {
  const driver = localforage.INDEXEDDB
  export const base = localforage.createInstance({
    name: '__APP_NAME__',
    driver
  })
  const setItem = <T>(key: string, value: T): Promise<T> => base.setItem<T>(`${key}_${window.instance_name.my}`, value)
  const getItem = <T>(key: string): Promise<T | null> => base.getItem<T>(`${key}_${window.instance_name.my}`)
  const removeItem = (key: string): Promise<void> => base.removeItem(`${key}_${window.instance_name.my}`)
  const getAllKeys = async (): Promise<string[]> => (await base.keys()).map(key => key.replaceAll(`_${window.instance_name.my}`, ''))
  const isReady = ref(false)
  base.ready().then(() => isReady.value = true)
  function whenReady() {
    return new Promise<any>(resolve => {
      if (isReady.value) return resolve(true)
      watchOnce(isReady, resolve)
    })
  }
  export namespace lastLogin {
    export async function get() {
      await whenReady()
      const saveData = await getItem<DataWithTime<User.LastLogin>>('user.LastLogin')
      if (!saveData || (await hasUserByEmail(saveData.user.email) == true)) return false
      const newTime = await getTimeByEmail(saveData.user.email)
      if (saveData.time != newTime) {
        const newData = await searchByEmail(saveData.user.email)
        const user = {
          email: newData.email,
          img: newData.img,
          name: newData.name,
          password: saveData.user.password
        }
        set({
          user,
          time: newTime
        })
        return user
      }
      return saveData.user
    }
    export async function remove() {
      await whenReady()
      return await removeItem('user.LastLogin')
    }
    export async function set(data: DataWithTime<{
      img: string;
      name: string;
      password: string;
      email: string;
    }>) {
      await whenReady()
      return void await setItem<DataWithTime<User.LastLogin>>('user.LastLogin', data)
    }

  }
  export namespace assetDB {
    export async function get(md5: string) {
      await whenReady()
      return await base.getItem<string>(`assets.${md5}`) ?? null
    }
    export async function set(md5: string, value: string) {
      await whenReady()
      await base.setItem<string>(`assets.${md5}`, value)
    }
    export async function has(md5: string) {
      await whenReady()
      return (await base.keys()).includes(`assets.${md5}`)
    }
    export async function removeAll() {
      await whenReady();
      for (const key of (await base.keys()).filter(v => v.startsWith('assets.'))) await base.removeItem(key)
    }
  }
  export namespace tempUserData {
    export async function set(user: User.WebDbSave, time: number) {
      await whenReady()
      await base.setItem(`temp.user.${user.uid.toString()}`, <DataWithTime<User.WebDbSave>>{
        user,
        time
      })
    }
    export async function get(uid: number) {
      await whenReady()
      const newTime = await getTimeByUid(uid)
      const saveData = await base.getItem<DataWithTime<User.WebDbSave>>(`temp.user.${uid.toString()}`)
      if (saveData?.time != newTime) {
        const newData = await searchByUid(uid)
        set(newData, newTime)
        return newData
      }
      return saveData.user
    }
    export async function remove(uid: number) {
      await whenReady()
      await base.removeItem(`temp.user.${uid.toString()}`)
    }
  }
  export namespace msg {
    export async function add(uid: number, body: Peer.Request.Msg) {
      await whenReady()
      await setItem(uid.toString(), ((await getItem<Peer.Request.Msg[]>(uid.toString())) ?? [])?.concat(body))
    }
    export async function get(uid: number): Promise<Peer.Request.Msg[]> {
      await whenReady()
      return await getItem<Peer.Request.Msg[]>(uid.toString()) ?? []
    }
  }
  export namespace app {
    export interface Code {
      code: string,
      about: string,
      time: Date,
      name: string,
      isLoad: boolean
    }
    const subs: { fn: (allStyle: Code[]) => any; key: symbol; }[] = []
    export function sub(fn: (allStyle: Code[]) => any, setup = false) {
      const key = Symbol('sub')
      subs.push({ fn, key })
      if (setup) (async () => fn(await getAllStyle()))()
      return () => remove(subs, { key })
    }
    export async function addStyle(code: Omit<Code, 'name'>, id: string) {
      await setItem(`${id}_style`, { ...code, name: id })
      for (const { fn } of subs) fn(await getAllStyle())
    }
    export async function removeStyle(id: string) {
      await removeItem(`${id}_style`)
      for (const { fn } of subs) fn(await getAllStyle())
    }
    export function getStyle(id: string) {
      return getItem<Code>(`${id}_style`)
    }
    export async function getAllStyle() {
      const keys = (await getAllKeys()).filter(val => val.endsWith('_style'))
      const items: Code[] = []
      for (const key of keys) items.push((await getItem(key))!)
      return items
    }
  }
  interface DataWithTime<T> {
    time: number,
    user: T
  }
}
export default db