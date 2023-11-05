<script setup lang='ts'>
import searchBox from './searchBox.c.vue';
import linkList from './linkList.c.vue';
import { useAppStore, useUserStore } from '@s/index';
import { ElLoading } from 'element-plus';
import Layout from '@l/base.vue';

const appStore = useAppStore()
const user = useUserStore()
const server = window.useServer()
const loding = ElLoading.service({
  lock: true,
  text: '加载数据中',
  background: 'rgba(255, 255, 255, 0.7)',
})

window.ipcRenderer.invoke("mainWindow_setSize", {
  width: 900,
  height: 770
})
window.ipcRenderer.invoke("mainWindow_resize", true)

setTimeout(() => {
  server.do({
    action: "get",
    tag: user.user.value.id
  }).catch(() => {
    window.useDatabase(user.user.value.id).clear()
    ElMessage.error('请求服务器错误')
  }).finally(() => {
    loding.close()
  })
}, 100);

</script>

<template>
  <Layout>
    <el-container class=" w-[calc(100% - 3.75rem)] flex-none">
      <el-container class=" !shrink-0 w-[16.3rem] border-r-[1px] border-r-[#DCDFE6] border-solid">
        <el-header class=" bg-[#fff] shrink-0 region-drag flex items-center">
          <search-box></search-box>
        </el-header>
        <el-main class=" shrink-0 !p-0 overflow-none">
          <link-list></link-list>
        </el-main>
      </el-container>
      <el-container class="w-full">
        <el-header class="region-drag w-full border-b flex items-center text-xl">
          {{ appStore.topBar.text }}
        </el-header>
        <el-main class="w-full">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.el-avatar img) {
  user-select: none;
  -webkit-user-drag: none;
}
</style>