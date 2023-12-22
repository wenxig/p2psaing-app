<script setup lang='ts'>
import searchBox from './searchBox.c.vue';
import linkList from './linkList.c.vue';
import { useAppStore } from '@s/appdata';
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
import { Chat } from '@/api/chat';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
const appStore = useAppStore();
const user = useUserStore();
const router = useRouter();
(async () => {
  const c = await (new Chat(user.user.lid)).setup()
  c.listen('connection', conn => {
    c.linkList[conn.metadata[1]] = {
      connection: conn,
      number: NaN
    }
    appStore.links.push(conn.metadata[0])
    router.push(`/main/chat/temp/${conn.metadata[1]}`)
    return true
  })
})()

window.electronAPI.ipcRenderer.invoke("mainWindow_setSize", {
  width: 900,
  height: 770
})
window.electronAPI.ipcRenderer.invoke("mainWindow_resize", true)
</script>

<template>
  <Layout>
    <MainLayout>
      <template #aside-header>
        <search-box></search-box>
      </template>
      <template #aside-main>
        <link-list></link-list>
      </template>
      <template #main-header>
        <component v-if="(typeof appStore.topBar.value) != 'string'" :is="appStore.topBar.value">
        </component>
        <span v-else>{{ appStore.topBar.value }}</span>
      </template>
      <template #default>
        <router-view></router-view>
      </template>
    </MainLayout>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.el-avatar img) {
  user-select: none;
  -webkit-user-drag: none;
}
</style>