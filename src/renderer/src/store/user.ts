import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave } from '@/utils/user'
import { Chat } from '@/api/chat';
import router from '@/router';
import { useAppStore } from './appdata';
const reload = (): User.WebDbSaveDeep => {
  const appState = window.ipc.getStateSync('user')
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
  return appState
}
export const useUserStore = defineStore("user", () => {
  const user = ref(reload())
  async function commit() {
    window.ipc.setState('user', JSON.stringify(user.value))
    await server.createUpdate().commit(user.value)
    await server.createUpdate().commit(toUserWebSave(user.value))
    await server.createUpdate().commit(new Date().getTime())
    await db.lastLogin.set()
    window.ipc.reload('/store/user')
  }
  let latestData = user.value
  watch(user, (val, oldVal) => {
    if (JSON.stringify(latestData) == JSON.stringify(val)) {
      return
    }
    window.ipc.setState('user', JSON.stringify(val))
    console.log(isEmpty(oldVal.name), oldVal.name, val.name);
    return
  }, { deep: true })
  function $setUser(value: { user: User.WebDbSaveDeep }) {
    user.value = value.user
  }
  window.ipc.listen(`/reload/store/user`, () => {
    console.log('reload');
    
    peerSetup();
    user.value = reload()
    user.value = reload()
  })
  async function peerSetup() {
    window.ipc.toTop()
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
  }
  if (location.hash.includes('/main')) {
    peerSetup()
  }
  return {
    user, commit, $setUser, peerSetup
  }
})
