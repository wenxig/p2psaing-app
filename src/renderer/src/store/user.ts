import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
const ipc = window.ipcRenderer
export const useUserStore = defineStore("user", () => {
  const user = reactive<{ value: User.DbSave }>({
    value: isEmpty(ipc.send(`getState`)) ? {
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
    } : JSON.parse(ipc.send(`getState`))
  })
  watch(user, val => {
    const db = window.useDatabase(val.value.id)
    db.set("user", JSON.stringify(val.value.link))
    ipc.send(`setState`, JSON.stringify(val.value))
  })
  return { user }
})
