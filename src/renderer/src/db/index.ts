import { useUserStore } from "@s/user";
import { watchOnce } from "@vueuse/core";
import localforage from "localforage";
import { ref } from "vue";
import * as server from '@/db/network'

namespace db {
  const driver = localforage.INDEXEDDB
  export const base = localforage.createInstance({
    name: '__APP_NAME__',
    driver
  })
  async function setItem<T>(key: string, value: T): Promise<T> {
    return base.setItem<T>(`${key}_${window.windowName}`, value)
  }
  async function getItem<T>(key: string): Promise<T | null> {
    return base.getItem<T>(`${key}_${window.windowName}`)
  }
  async function removeItem(key: string): Promise<void> {
    return base.removeItem(`${key}_${window.windowName}`)
  }
  let isReady = ref(false)
  base.ready().then(() => isReady.value = true)
  function whenReady() {
    return new Promise<void>(resolve => {
      if (isReady.value) {
        resolve()
        return
      }
      watchOnce(isReady, () => {
        resolve()
      })
    })
  }
  export namespace lastLogin {
    export async function get() {
      await whenReady()
      const saveData = await getItem<DataWithTime<User.LastLogin>>('user.LastLogin')
      if (!saveData) return false
      const newTime = await server.getTimeByEmail(saveData.user.email)
      if (saveData.time != newTime) {
        const newData = await server.searchByEmail(saveData.user.email)
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
    export async function set(data?: DataWithTime<User.LastLogin>) {
      await whenReady()
      if (data) {
        await setItem<DataWithTime<User.LastLogin>>('user.LastLogin', data)
        return
      }
      const { user: user } = useUserStore()
      await setItem<DataWithTime<User.LastLogin>>('user.LastLogin', {
        user: {
          'email': user.email,
          img: user.img,
          name: user.name,
          password: user.password
        },
        time: await server.getTimeByEmail(user.email)
      })
    }

  }
  export namespace tempUserData {
    export async function set(user: User.WebDbSave, time: number) {
      await whenReady()
      await setItem(`temp.user.${user.uid.toString()}`, <DataWithTime<User.WebDbSave>>{
        user,
        time
      })
    }
    export async function get(uid: number) {
      await whenReady()
      const newTime = await server.getTimeByUid(uid)
      const saveData = await getItem<DataWithTime<User.WebDbSave>>(`temp.user.${uid.toString()}`)
      if (saveData?.time != newTime) {
        const newData = await server.searchByUid(uid)
        set(newData, newTime)
        return newData
      }
      return saveData.user
    }
    export async function remove(uid: number) {
      await whenReady()
      await removeItem(`temp.user.${uid.toString()}`)
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
  interface DataWithTime<T> {
    time: number,
    user: T
  }
}
export default db