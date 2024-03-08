import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { updateUser } from '@/db/network'
import db from '@/db';
import { createEmptyDeepUser } from '@/utils/user'
import { createPeer } from '@/api';
import { useAppStore } from '@s/appdata';

export const useUserStore = defineStore("user", () => {
  const reload = (steup = false): User.WebDbSaveDeep => {
    const ipcReturn = window.ipc.getStateSync('user')
    if (steup) return isEmpty(ipcReturn) ? createEmptyDeepUser() : JSON.parse(ipcReturn)
    return isEmpty(ipcReturn) ? (isEmpty(user.value) ? createEmptyDeepUser() : user.value) : JSON.parse(ipcReturn)
  }
  const user = ref(reload(true))
  async function commit() {
    window.ipc.setState('user', JSON.stringify(user.value))
    await updateUser(user.value)
    await db.lastLogin.set()
    window.ipc.reload('/store/user')
  }
  let latestData = JSON.stringify(user.value)
  watch(user, (val) => {
    const userString = JSON.stringify(val)
    !(latestData == userString) && window.ipc.setState('user', latestData = userString)
  }, { deep: true })

  window.ipc.onReload(`/store/user`, async () => (<any>useAppStore().peer) = await createPeer((user.value = reload()).lid))
  return { user, commit, $setUser: (value: User.WebDbSaveDeep) => user.value = value }
})
