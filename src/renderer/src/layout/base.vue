<script setup lang='tsx'>
import { ChatRound } from "@element-plus/icons-vue";
import control from '@/components/control.vue';
import { computed } from 'vue';
import { useUserStore } from '@s/user';
import { storeToRefs } from 'pinia';
import AsideButton from './asideButton.c.vue';
import { useRoute } from "vue-router";
import { Code20Filled } from '@vicons/fluent';
import { useAppStore } from "@/store/appdata";
const route = useRoute()
const user = useUserStore()
const app = useAppStore()
const userVal = storeToRefs(user)
const isOnHomePage = computed(() => {
  return [
    /^\/main\/chat/g,
    /^\/main$/g
  ].some(reg => reg.test(route.path))
})

</script>

<template>
  <el-container class=" h-full">
    <el-aside class="relative region-drag bg-[var(--el-color-info-light-7)] !pt-20 !h-full flex justify-center" :style="{
      width: `${app.style.aside.width}px`
    }">
      <control class="absolute top-0 left-0"></control>
      <el-space direction='vertical' class=" w-full h-full">
        <el-avatar shape="square" class="region-no-drag" :size="40"
          :src="userVal.user.value.img == '' ? '/userIcon.png' : userVal.user.value.img"
          @click="$electron.ipcRenderer.send('createChildWindow', { width: 450, height: 650, url: '/main/userSetting', name: `userSetting`, more: false }, $window.instance_name.my)" />
        <AsideButton :primary="isOnHomePage" @click="$router.push('/main')">
          <ChatRound />
        </AsideButton>
        <AsideButton :primary="$route.path == '/main/address'" @click="$router.push('/main/address')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
          </svg>
        </AsideButton>
        <AsideButton :primary="$route.path == '/main/dev'" @click="$router.push('/main/dev')">
          <Code20Filled />
        </AsideButton>
      </el-space>
    </el-aside>
    <slot></slot>
  </el-container>
</template>

<style scoped lang='scss'>
:deep(.n-menu-item-content__icon) {
  width: 40px !important;
}
</style>