<script setup lang='tsx'>
import searchBox from './searchBox.c.vue';
import control from '@/components/control.vue';
import linkList from '@/components/linkList.vue';
import { ref } from 'vue';
import { useAppStore, useUserStore } from '@s/index';
import { ElLoading } from 'element-plus';
import { storeToRefs } from 'pinia';

const appStore = useAppStore()
const user = useUserStore()
const userVal = storeToRefs(user)
const titleImg = ref("/userIcon.png")
const server = window.useServer()
const loding = ElLoading.service({
  lock: true,
  text: '加载数据中',
  background: 'rgba(255, 255, 255, 0.7)',
})

import { ElNotification } from 'element-plus';
import { useLinkUser } from '@h/useLinkUser';
const linker = useLinkUser()
function show(id: string, notreq: () => void, okreq: () => void) {
  let notificationEl = (<>
    <p>id:{id}</p>
    <el-button type="danger" plain onClick={() => {
      notreq()
      el.close()
    }}> 取消  </el-button>
    <el-button type="success" plain onClick={() => {
      okreq()
      el.close()
    }}> 同意  </el-button>
  </>)
  let el = ElNotification({
    title: '请求连接',
    dangerouslyUseHTMLString: true,
    message: notificationEl,
    duration: 0,
    showClose: false,
    customClass: 'region-no-drag'
  })
}
linker.onConnection((id, yes, no) => {
  show(id, () => {
    no()
  }, () => {
    yes()
  })
})

window.ipcRenderer.invoke("mainWindow_setSize", {
  width: 830,
  height: 620
})
window.ipcRenderer.invoke("mainWindow_resize", true)

setTimeout(() => {
  server.do({
    action: "get",
    tag: user.user.value.id
  }).catch(() => {
    window.useDatabase().clear()
    ElMessage.error('请求服务器错误')
  }).finally(() => {
    loding.close()
  })
}, 100);

</script>

<template>
  <el-container class=" h-full">
    <el-aside class="relative region-drag !w-[3.75rem] bg-[var(--el-color-info-light-7)] !h-full flex justify-center">
      <control class="absolute top-0 left-0"></control>
      <el-avatar shape="square" :size="40"
        :src="userVal.user.value.value.img == '' ? titleImg : userVal.user.value.value.img"
        class="!absolute top-20 region-no-drag"
        @click="$ipc.send('createChildWindow', { width: 450, height: 650, url: '/main/userSetting', name: `userSetting`, more: false })" />
    </el-aside>
    <el-container class=" mainly flex-none">
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
  </el-container>
</template>

<style lang="scss" scoped>
.mainly {
  width: calc(100% - 3.75rem);
}

:deep(.el-avatar img) {
  user-select: none;
  -webkit-user-drag: none;
}
</style>