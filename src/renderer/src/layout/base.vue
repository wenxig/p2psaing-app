<script setup lang='ts'>
import control from '@/components/control.vue';
import { ref } from 'vue';
import { useUserStore } from '@s/index';
import { storeToRefs } from 'pinia';
import AsideButton from './asideButton.c.vue';

const user = useUserStore()
const userVal = storeToRefs(user)
const titleImg = ref("/userIcon.png")

</script>

<template>
  <el-container class=" h-full">
    <el-aside
      class="relative region-drag !w-[3.75rem] bg-[var(--el-color-info-light-7)] !pt-20 !h-full flex justify-center">
      <control class="absolute top-0 left-0"></control>
      <el-space direction='vertical' class=" w-full h-full">
        <el-avatar shape="square" :size="40"
          :src="userVal.user.value.value.img == '' ? titleImg : userVal.user.value.value.img" class="region-no-drag"
          @click="$ipc.send('createChildWindow', { width: 450, height: 650, url: '/main/userSetting', name: `userSetting`, more: false })" />
        <AsideButton :primary="$route.path == '/main'" @click="$router.push('/main')">
          <i-ep-ChatRound />
        </AsideButton>
        <AsideButton :primary="$route.path == '/main/address'" @click="$router.push('/main/address')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
          </svg>
        </AsideButton>
      </el-space>
    </el-aside>
    <slot></slot>
  </el-container>
</template>