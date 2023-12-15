import { defineStore } from 'pinia';
import { reactive, ref, watchEffect } from 'vue';

export const useAppStore = defineStore("app", () => {
  const topBar = reactive({
    text: ""
  })
  const settingPage = reactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  const isDark = ref(false)
  watchEffect(() => {
    document.querySelectorAll('html')[0].className = isDark.value ? 'dark' : 'light'
  })
  return { topBar, settingPage, isDark }
})