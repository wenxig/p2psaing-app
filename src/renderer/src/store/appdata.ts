import { defineStore } from 'pinia';
import { reactive } from 'vue';
export const useAppStore = defineStore("app", () => {
  const topBar = reactive({
    text: ""
  })
  const settingPage = reactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  return { topBar, settingPage }
})