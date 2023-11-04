import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
export const useUserStore = defineStore("user", () => {
  const user = reactive<{ value: User.DbSave }>({
    value: {
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
    }
  })

  watch(user, val => {
    const db = window.useDatabase(val.value.id)
    db.set("user", JSON.stringify(val.value.link))
  })
  return { user }
})