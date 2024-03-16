import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { updateUser } from '@/db/network'
import db from '@/db';
import { createEmptyDeepUser, toLastLogin } from '@/utils/user'
import { createPeer } from '@/api';
import { useAppStore } from '@s/appdata';
import { shallowRef } from 'vue';

export const useUserStore = defineStore("user", () => {
  const reload = (steup = false): User.WebDbSaveDeep => {
    const ipcReturn = window.ipc.getStateSync('user')
    if (steup) return isEmpty(ipcReturn) ? createEmptyDeepUser() : JSON.parse(ipcReturn)
    return isEmpty(ipcReturn) ? (isEmpty(user.value) ? createEmptyDeepUser() : user.value) : JSON.parse(ipcReturn)
  }
  async function $commit() {
    window.ipc.setState('user', JSON.stringify(user.value))
    const time = await updateUser(user.value)
    await db.lastLogin.set({ user: toLastLogin(user.value), time })
    window.ipc.reload('/store/user')
  }
  function $setUser(value: User.WebDbSaveDeep) {
    user.value = value
    const userString = JSON.stringify(value)
    !(latestData == userString) && window.ipc.setState('user', latestData = userString)
  }

  const user = shallowRef(reload(true))
  let latestData = JSON.stringify(user.value)

  window.ipc.onReload(`/store/user`, async () => (<any>useAppStore().peer) = await createPeer((user.value = reload()).lid))
  return { user, $commit, $setUser }
})
