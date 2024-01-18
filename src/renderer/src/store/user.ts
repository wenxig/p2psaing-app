import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave } from '@/utils/user'
import { Chat } from '@/api/chat';
import router from '@/router';
import { useAppStore } from './appdata';
export const useUserStore = defineStore("user", () => {
  const reload = (setup = false): User.WebDbSaveDeep => {
    window.ipc.getState('user').then((data) => !isEmpty(data) && (user.value = JSON.parse(data)))
    return setup ? {
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
    } : user.value
  }
  const user = ref(reload(true))
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
  window.ipc.onReload(`/store/user`, () => {
    console.log('reload');
    peerSetup();
    user.value = reload()
    user.value = reload()
  })
  async function peerSetup() {
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
