<script setup lang='ts'>
import User from './user.b.vue';
import { useUserStore } from '@s/user';
import { useAppStore } from '@s/appdata';
const userStoer = useUserStore()
const ipc = window.electronAPI.ipcRenderer
const appStore = useAppStore()
ipc.invoke(`${window.instance_name.my}_setSize`, {
  height: 500,
  width: 800
})
</script>

<template>
  <el-container>
    <el-header class="region-drag !bg-[var(--el-color-info-light-7)] flex justify-center items-center !text-xl"
      height="25px">
    </el-header>
    <el-main @click="appStore.settingPage.name = userStoer.user.name">
      <User />
      <el-divider />
      <el-button @click="$electron.ipcRenderer.invoke('app_quit')" type="danger">退出登陆</el-button>
    </el-main>
    <control class="absolute top-0 left-0" :maxsize="false">
    </control>
  </el-container>
</template>