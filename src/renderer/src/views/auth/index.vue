<script setup lang='ts'>
import QrcodeVue from 'qrcode.vue'
import { ref } from 'vue';
import api from '@a/index';
const qrcodeValue = ref('你扫你吗呢')
window.ipcRenderer.invoke("mainWindow_setSize", {
  width: 280,
  height: 400
})
</script>

<template>
  <el-container class="region-drag !h-full flex justify-center items-center !flex-col">
    <control class="absolute top-0 left-0" type="quit" :minsize="false" :maxsize="false"></control>
    <el-space direction="vertical" :size="32">
      <qrcode-vue :value="qrcodeValue" :size="150"></qrcode-vue>
      <el-space direction="vertical" :size="0">
        <el-text class="!text-blue-400 !text-xl">扫码不登陆p2pSaing</el-text>
        <div>
          <el-text class="region-no-drag !text-[14px]">或者</el-text>
          <el-link @click="api.post('/sys/login', { email: 'we', password: 'js' })" @clickk="$router.push('/login/byPassWord')"
            class="region-no-drag select-none" type="primary">账号密码登陆</el-link>
        </div>
      </el-space>
    </el-space>
  </el-container>
</template>

<style scoped lang='scss'>
:deep(.el-link__inner) {
  font-size: 10px;
}

:global(.el-message) {
  width: 75% !important;
  max-height: 0.5rem !important;
  user-select: none;
}
</style>