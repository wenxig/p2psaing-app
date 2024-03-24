<script setup lang="ts">
import { getUser, getUserAddress, addUserAddAddress, removeUserAddress } from '@/db/network'
import { isEmpty } from 'lodash-es'
import { useRoute } from 'vue-router'
import icon from '@/assets/userIcon.png'
import { Plus, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { shallowRef } from 'vue'
const route = useRoute()
const user = await getUser(route.params.uid as any)
const allAddress = shallowRef((await getUserAddress(user.uid)).chat || [])
window.ipc.onReload('address-list', async (val) => (allAddress.value = JSON.safetyParse(val)?.['base-list']?.chat ?? allAddress.value))
</script>

<template>
  <el-empty description="未知的用户" class="h-full w-full" v-if="isEmpty(user)" />
  <div class="flex h-full w-full flex-col items-center overflow-x-hidden p-5" v-else>
    <ElImage :src="user.img ?? icon" class="w-1/4 rounded-md" />
    <span class="mt-2 text-xl">{{ user.name }}</span>
    <el-text type="info">email: {{ user.email }}</el-text>
    <el-text type="info">uid: {{ user.uid }}</el-text>
    <template v-if="user.introduction">
      <ElDivider />
      <div class="flex w-full">
        <span class="w-20 text-lg">简介:</span>
        <div class="w-full text-wrap">{{ user.introduction }}</div>
      </div>
    </template>
    <template v-if="allAddress.find((v) => v.uid == user.uid)">
      <ElDivider />
      <div class="flex w-full justify-center">
        <ElButton :icon="ChatDotRound" type="primary">发信息</ElButton>
        <ElButton :icon="Delete" type="danger" @click="
    removeUserAddress(user.uid).then(() => {
      $router.push('/main/address')
      $message.success('删除成功')
    })
    ">删除</ElButton>
      </div>
    </template>
    <template v-else>
      <ElDivider />
      <div class="flex">
        <ElButton :icon="Plus" type="primary" @click="addUserAddAddress(user.uid).then(() => {
    $router.push('/main/address')
    $message.success('添加成功')
        })">添加聊天</ElButton>
      </div>
    </template>
  </div>
</template>
