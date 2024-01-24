import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave, createEmptyDeepUser } from '@/utils/user'
import { peerSetup } from '@a/chat';

export const useUserStore = defineStore("user", () => {
  const reload = (): User.WebDbSaveDeep => {
    const ipcReturn = window.ipc.getStateSync('user')
    return isEmpty(ipcReturn) ? (isEmpty(user.value) ? createEmptyDeepUser() : user.value) : JSON.parse(ipcReturn)
  }
  const user = ref(reload())
  async function commit() {
    window.ipc.setState('user', JSON.stringify(user.value))
    await server.createUpdate().commit(user.value)
    await server.createUpdate().commit(toUserWebSave(user.value))
    await server.createUpdate().commit(new Date().getTime())
    await db.lastLogin.set()
    window.ipc.reload('/store/user')
  }
  let latestData = JSON.stringify(user.value)
  watch(user, (val) => {
    const userString = JSON.stringify(val)
    !(latestData == userString) && window.ipc.setState('user', latestData = userString)
  }, { deep: true })
  if (location.hash.includes('/main')) peerSetup(user.value.lid)
  window.ipc.onReload(`/store/user`, () => peerSetup((user.value = reload()).lid))
  return { user, commit, $setUser: (value: User.WebDbSaveDeep) => user.value = value }
})
