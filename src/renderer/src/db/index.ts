import { useUserStore } from "@s/user";
import { watchOnce } from "@vueuse/core";
import localforage from "localforage";
import { ref } from "vue";
import * as server from '@/db/network'

namespace db {
  export const base = localforage.createInstance({
    name: '__APP_NAME__',
    driver: localforage.INDEXEDDB
  })
  let isReady = ref(false)
  base.ready().then(() => isReady.value = true)
  function whenReady() {
    return new Promise<void>(resolve => {
      if (isReady.value) {
        resolve()
        console.log('ready');
        return
      }
      watchOnce(isReady, () => {
        resolve()
        console.log('ready');
      })
    })
  }
  export async function getLastLogin() {
    await whenReady()
    const saveData = await base.getItem<DataWithTime<User.LastLogin>>('user.LastLogin')
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
      setLastLogin({
        user,
        time: newTime
      })
      return user
    }
    return saveData.user
  }
  export async function removeLastLogin() {
    await whenReady()
    return await base.removeItem('user.LastLogin')
  }
  export async function setLastLogin(data?: DataWithTime<User.LastLogin>) {
    await whenReady()
    if (data) {
      await base.setItem<DataWithTime<User.LastLogin>>('user.LastLogin', data)
      return
    }
    const { user: user } = useUserStore()
    await base.setItem<DataWithTime<User.LastLogin>>('user.LastLogin', {
      user: {
        'email': user.email,
        img: user.img,
        name: user.name,
        password: user.password
      },
      time: await server.getTimeByEmail(user.email)
    })
  }
  export async function setTempUserData(user: User.WebDbSave, time: number) {
    await whenReady()
    await base.setItem(`temp.user.${user.uid.toString()}`, <DataWithTime<User.WebDbSave>>{
      user,
      time
    })
  }
  export async function getTempUserData(uid: number) {
    await whenReady()
    const newTime = await server.getTimeByUid(uid)
    const saveData = await base.getItem<DataWithTime<User.WebDbSave>>(`temp.user.${uid.toString()}`)
    if (saveData?.time != newTime) {
      const newData = await server.searchByUid(uid)
      setTempUserData(newData, newTime)
      return newData
    }
    return saveData.user
  }
  interface DataWithTime<T> {
    time: number,
    user: T
  }
}
export default db