import { useUserStore } from "@/store";
import { watchOnce } from "@vueuse/core";
import localforage from "localforage";
import { ref } from "vue";
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
        return
      }
      watchOnce(isReady, () => {
        resolve()
      })
    })
  }
  export async function getLastLogin() {
    await whenReady()
    return await base.getItem<User.LastLogin>('user.LastLogin') ?? false
  }
  export async function setLastLogin() {
    const { user: { value: user } } = useUserStore()
    await whenReady()
    return await base.setItem<User.LastLogin>('user.LastLogin', {
      'email': user.email,
      img: user.img,
      name: user.name,
      password: user.password
    })
  }
}
export default db