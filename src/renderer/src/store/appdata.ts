import { defineStore } from 'pinia';
import { shallowReactive, VNode, Component, shallowRef } from 'vue';
import type { Peer, Connection } from '@/api';
export const useAppStore = defineStore("app", () => {
  const topBar = shallowReactive<{ value: VNode | Component | string }>({ value: '' })
  const settingPage = shallowReactive({
    name: '',
    isEditName: false,
    loadProgress: 0
  })
  const links = shallowReactive<User.WebDbSave[]>([])
  const peer = shallowRef<Peer>()
  const allConnects = shallowReactive<Connection[]>([])
  const allConnectsMsgs = shallowReactive<{ uid: number, msg: Peer.Request.All[] }[]>([])
  return { topBar, settingPage,  links, peer, allConnects, allConnectsMsgs }
})