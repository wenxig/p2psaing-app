import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave } from '@/utils/user'
const ipc = window.electronAPI.ipcRenderer
const reload = (): User.WebDbSaveDeep => {
  const appState = ipc.sendSync(`getState`, 'user')
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
  ipc.on('reload_store_user', () => user.value = reload())
  async function commit() {
    ipc.send(`setState`, 'user', JSON.stringify(user.value))
    await server.createUpdate().commit(user.value)
    await server.createUpdate().commit(toUserWebSave(user.value))
    await server.createUpdate().commit(new Date().getTime())
    await db.setLastLogin()
    await ipc.invoke('reload_store_user')
  }
  let latestData = user.value
  watch(user, val => {
    if (JSON.stringify(latestData) == JSON.stringify(val)) {
      return
    }
    ipc.send(`setState`, 'user', JSON.stringify(val))
    return
  }, { deep: true })
  function $setUser(value: { user: User.WebDbSaveDeep }) {
    user.value = value.user
  }
  ipc.on('reload_store_user', () => user.value = reload())
  return { user, commit, $setUser }
})
