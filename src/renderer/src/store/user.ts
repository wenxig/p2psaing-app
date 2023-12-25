import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave } from '@/utils/user'
import { Chat } from '@/api/chat';
import router from '@/router';
import { useAppStore } from './appdata';
const ipc = window.electronAPI.ipcRenderer
const reload = (): User.WebDbSaveDeep => {
  const appState = ipc.sendSync(`getState`, 'user', window.windowName)
  if (isEmpty(appState)) {
    return {
      email: '',
      pid: '',
      lid: '',
      uid: NaN,
      img: '',
      link: {
        group: [],
        chat: []
      },
      name: '',
      password: ''
    }
  }
  return JSON.parse(appState)
}
export const useUserStore = defineStore("user", () => {
  const user = ref(reload())
  ipc.on(`reload_store_user_${window.windowName}`, () => user.value = reload())
  async function commit() {
    ipc.send(`setState`, 'user', JSON.stringify(user.value))
    await server.createUpdate().commit(user.value)
    await server.createUpdate().commit(toUserWebSave(user.value))
    await server.createUpdate().commit(new Date().getTime())
    await db.lastLogin.set()
    await ipc.invoke(`reload_store_user_${window.windowName}`)
  }
  let latestData = user.value
  watch(user, (val, oldVal) => {
    if (JSON.stringify(latestData) == JSON.stringify(val)) {
      return
    }
    ipc.send(`setState`, 'user', JSON.stringify(val), window.windowName)
    if (isEmpty(oldVal.name) && (oldVal.name != val.name)) {
      (async () => {
        const appStore = useAppStore()

        const c = await (new Chat(user.value.lid)).setup()
        c.listen('connection', conn => {
          c.linkList[conn.metadata[1]] = {
            connection: conn,
            number: NaN
          }
          appStore.links.push(conn.metadata[0])
          router.push(`/main/chat/temp/${conn.metadata[1]}`)
          return true
        })
      })()
    }
    return
  }, { deep: true })
  function $setUser(value: { user: User.WebDbSaveDeep }) {
    user.value = value.user
  }
  ipc.on(`reload_store_user_${window.windowName}`, () => user.value = reload())
  return { user, commit, $setUser }
})
