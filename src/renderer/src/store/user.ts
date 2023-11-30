import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import * as server from '@/db/network'

const ipc = window.electronAPI.ipcRenderer
export const useUserStore = defineStore("user", () => {
  const user = reactive<{ value: User.WebDbSaveDeep }>({
    value: isEmpty(ipc.sendSync(`getState`, 'user')) ? {
      email: '',
      id: '',
      uid: NaN,
      img: '',
      link: {
        group: [],
        chat: []
      },
      name: '',
      password: ''
    } : JSON.parse(ipc.sendSync(`getState`, 'user'))
  })
  async function update() {
    await server.uploadByTag(user.value, user.value.pid)
    await server.uploadByTag({
      name: user.value.name,
      email: user.value.email,
      img: user.value.img,
      lid: user.value.lid,
      uid: user.value.uid,
      introduction: user.value.introduction
    }, `uid-${user.value.uid}|email-${user.value.email}`)
  }
  let latestData: typeof user['value'] = user.value
  watch(user, val => {
    if (JSON.stringify(latestData) == JSON.stringify(val.value)) {
      return
    }
    ipc.send(`setState`, 'user', JSON.stringify(val.value))
    return
  }, { deep: true })
  return { user, update }
})
