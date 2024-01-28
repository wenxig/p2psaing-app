<script setup lang='ts'>
import { ChatRound } from "@element-plus/icons-vue";
import Control from '@/components/control.vue';
import { ref, nextTick } from 'vue';
import { useUserStore } from '@s/user';
import { storeToRefs } from 'pinia';
import AsideButton from './asideButton.c.vue';
import { Code20Filled } from '@vicons/fluent';
import { Settings } from '@vicons/carbon';
import { nowRouterState } from '@c/index';
import gsap from "gsap"
const { user } = storeToRefs(useUserStore())

const BASE_SIZE_AVATAR = 40
const BASE_SIZE_CHANGE = 5
const DivEl = ref<HTMLDivElement>()
const bigSize = (el: HTMLElement) => {
  nextTick(() => {
    gsap.to(el, {
      width: BASE_SIZE_AVATAR + BASE_SIZE_CHANGE,
      height: BASE_SIZE_AVATAR + BASE_SIZE_CHANGE,
      x: BASE_SIZE_CHANGE,
      marginBottom: -BASE_SIZE_CHANGE,
    }).play()
    gsap.to('.pop-user', {
      x: 50,
      opacity: 1,
      direction: 2
    }).play()
  })
}
const nomeSize = (el: HTMLElement) => {
  gsap.to(el, {
    width: BASE_SIZE_AVATAR,
    height: BASE_SIZE_AVATAR,
    x: 0,
    marginBottom: 0,
  }).play()
  gsap.to('.pop-user', {
    x: 30,
    opacity: 0,
    direction: 4
  }).play()
}
</script>

<template>
  <el-container class=" h-full">
    <el-aside class="relative region-drag bg-[var(--el-color-info-light-7)] !pt-20 !h-full flex justify-center !w-[60px]">
      <Control class="absolute top-0 left-0"></Control>
      <el-space direction='vertical' class=" w-full h-full">
        <div @mouseleave="(e) => nomeSize(e.target as HTMLElement)" ref="DivEl"
          @mouseenter="(e) => bigSize(e.target as HTMLElement)" class=" relative DivEl"
          :style="{ width: `${BASE_SIZE_AVATAR}px`, height: `${BASE_SIZE_AVATAR}px` }">
          <el-avatar shape="square" class="region-no-drag !w-full !h-full"
            :src="user.img == '' ? '/userIcon.png' : user.img"
            @click="$ipc.createChildWindow({ width: 800, height: 500, url: '/main/setting/user' })" />
        </div>
        <div
          class="pointer-events-none border p-2 border-[--el-fill-color-light] bg-[--el-bg-color] pop-user rounded-md opacity-0 w-[13rem] h-[8rem] fixed z-40 before:bg-[--el-bg-color] before:pointer-events-none before:border-b before:border-l before:border-[--el-fill-color-light] before:content-[''] before:w-5 before:h-5 before:top-[--i-before-top] before:block before:m-0 before:!absolute before:-translate-x-[100%] before:rotate-45"
          :style="{
            top: `${(DivEl?.offsetTop ?? 0) - BASE_SIZE_AVATAR / 2}px`,
            '--i-before-top': `${BASE_SIZE_AVATAR}px`
          }">
          <NThing class="!w-full !h-full">
            <template #avatar>
              <el-avatar shape="square" class="region-no-drag" :size="BASE_SIZE_AVATAR"
                :src="user.img == '' ? '/userIcon.png' : user.img" />
            </template>
            <template #header>{{ user.name }}</template>
            <template #description>{{ user.introduction }}</template>
            <ElDivider class="!m-0" />
          </NThing>
        </div>
        <AsideButton :primary="nowRouterState == 'onHomeRouter' || nowRouterState == 'onChatRouter'"
          @click="$actor.send({ type: 'quit', to: 'goHome' })">
          <ChatRound />
        </AsideButton>
        <AsideButton :primary="nowRouterState == 'onAddressRouter'"
          @click="$actor.send({ type: 'quit', to: 'goAddress' })">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
          </svg>
        </AsideButton>
        <AsideButton :primary="nowRouterState == 'onDevRouter'" @click="$actor.send({ type: 'quit', to: 'goDev' })">
          <Code20Filled />
        </AsideButton>
      </el-space>
      <el-space direction='vertical' class=" w-full h-auto absolute bottom-2">
        <AsideButton :primary="nowRouterState == 'onSettingRouter'"
          @click="$actor.send({ type: 'quit', to: 'goSetting' })">
          <Settings />
        </AsideButton>
      </el-space>
    </el-aside>
    <slot></slot>
  </el-container>
</template>