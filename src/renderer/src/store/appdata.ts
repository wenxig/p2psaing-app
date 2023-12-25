import { defineStore } from 'pinia';
import { reactive, ref, watchEffect, VNode, Component } from 'vue';
import type * as _ from '.pnpm/@vue+shared@3.3.9/node_modules/@vue/shared'
export const useAppStore = defineStore("app", () => {
  const topBar = ref<{ value: VNode | Component | string }>({ value: '' })
  const settingPage = reactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  const isDark = ref(false)
  const links = reactive<User.WebDbSave[]>([])
  watchEffect(() => {
    document.querySelectorAll('html')[0].className = isDark.value ? 'dark' : 'light'
  })
  return { topBar, settingPage, isDark, links }
})