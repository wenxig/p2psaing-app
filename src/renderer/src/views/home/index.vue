<script setup lang='ts'>
import searchBox from './searchBox.c.vue';
import linkList from './linkList.c.vue';
import { useAppStore, useUserStore } from '@s/index';
import { ElLoading } from 'element-plus';
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
const appStore = useAppStore()
const user = useUserStore()
const server = window.useServer()
const loding = ElLoading.service({
  lock: true,
  text: '加载数据中',
  background: 'rgba(255, 255, 255, 0.7)',
})

window.electronAPI.ipcRenderer.invoke("mainWindow_setSize", {
  width: 900,
  height: 770
})
window.electronAPI.ipcRenderer.invoke("mainWindow_resize", true)

setTimeout(() => {
  server.do({
    action: "get",
    tag: user.user.value.id
  }).catch(async () => {
    ElMessage.error('请求服务器错误')
  }).finally(() => {
    loding.close()
  })
}, 100);

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