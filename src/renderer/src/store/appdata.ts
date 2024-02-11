import { defineStore } from 'pinia';
import { reactive, ref, watchEffect, VNode, Component, shallowRef } from 'vue';
import type { Peer, Connection } from '@/api';
export const useAppStore = defineStore("app", () => {
  const topBar = ref<{ value: VNode | Component | string }>({ value: '' })
  const settingPage = reactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  const isDark = ref(false)
  const links = reactive<User.WebDbSave[]>([])
  watchEffect(() => document.querySelectorAll('html')[0].className = isDark.value ? 'dark' : 'light')
  const peer = shallowRef<Peer>()
  const allConnects = ref<Connection[]>([])
  const allConnectsMsgs = ref<{ uid: number, msg: Peer.Request.All[] }[]>([])
  return { topBar, settingPage, isDark, links, peer, allConnects, allConnectsMsgs }
})