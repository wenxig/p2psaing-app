<script setup lang='ts'>
import searchBox from './searchBox.c.vue';
import linkList from './linkList.c.vue';
import { useAppStore } from '@s/index';``
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
const appStore = useAppStore()


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
        {{ appStore.topBar.text }}
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