import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
const ipc = window.electronAPI.ipcRenderer
export const useUserStore = defineStore("user", () => {
  const user = reactive<{ value: User.DbSave }>({
    value: isEmpty(ipc.sendSync(`getState`)) ? {
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
    } : JSON.parse(ipc.sendSync(`getState`))
  })
  watch(user, val => {
    ipc.send(`setState`, JSON.stringify(val.value))
  })
  return { user }
})
