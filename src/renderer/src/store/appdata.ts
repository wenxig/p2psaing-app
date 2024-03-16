import { defineStore } from 'pinia';
import { shallowReactive, ref, watch, VNode, Component, shallowRef } from 'vue';
import type { Peer, Connection } from '@/api';
export const useAppStore = defineStore("app", () => {
  const topBar = shallowReactive<{ value: VNode | Component | string }>({ value: '' })
  const settingPage = shallowReactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  const isDark = ref(false)
  const links = shallowReactive<User.WebDbSave[]>([])
  watch(isDark, isDark => document.querySelectorAll('html')[0].className = isDark ? 'dark' : 'light')
  const peer = shallowRef<Peer>()
  const allConnects = shallowReactive<Connection[]>([])
  const allConnectsMsgs = shallowReactive<{ uid: number, msg: Peer.Request.All[] }[]>([])
  return { topBar, settingPage, isDark, links, peer, allConnects, allConnectsMsgs }
})