<script setup lang='ts'>
import { getUser, addUserAddress, removeUserAddAddress } from '@/db/network';
import { useRoute } from 'vue-router';
import icon from '@/assets/userIcon.png';
import { Check, Close } from '@element-plus/icons-vue';
const route = useRoute()

const user = await getUser(route.params.uid as any)
</script>

<template>
  <div class="flex items-center p-5 flex-col w-full h-full overflow-x-hidden">
    <ElImage :src="user.img ?? icon" class="w-1/4 rounded-md" />
    <span class="text-xl mt-2">{{ user.name }}</span>
    <el-text type="info">email: {{ user.email }}</el-text>
    <el-text type="info">uid: {{ user.uid }}</el-text>
    <template v-if="user.introduction">
      <ElDivider />
      <div class="flex w-full">
        <span class="text-lg w-20">简介:</span>
        <div class="w-full text-wrap">{{ user.introduction }}</div>
      </div>
    </template>
    <template v-else>
      <ElDivider />
      <div class="flex w-full justify-center">
        <ElButton :icon="Check" type="success" @click="addUserAddress(user.uid).then(() => {
      $router.push('/main/address')
      $message.success('通过成功')
    })">通过</ElButton>
        <ElButton :icon="Close" type="danger" @click="removeUserAddAddress(user.uid).then(() => {
      $router.push('/main/address')
      $message.success('拒绝成功')
    })">拒绝</ElButton>
      </div>
    </template>
  </div>
</template>