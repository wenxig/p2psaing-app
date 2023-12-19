<script setup lang='ts'>
import db from '@/db';
import { useAuth } from '@/hook/useAuth';
import { useRouter } from 'vue-router';
import { ElLoading, ElMessage } from 'element-plus'
import { toRef } from 'vue'
const qrcodeValue = '你扫你吗呢'
let lastLogin = toRef<false | User.LastLogin>(await db.getLastLogin())
const router = useRouter()
window.electronAPI.ipcRenderer.invoke("mainWindow_setSize", {
  width: 280,
  height: 400
})
function login() {
  if (!lastLogin.value) return
  const loading = ElLoading.service({
    text: '登陆中'
  })
  const auth = useAuth()
  auth.login(lastLogin.value).then(val => {
    val[2]()
    router.replace('/main')
  }).catch(() => {
    ElMessage.error('网络错误')
  }).finally(() => loading.close())
}
</script>

<template>
  <el-container class="region-drag !h-full flex justify-center items-center !flex-col">
    <control class="absolute top-0 left-0" type="quit" :minsize="false" :maxsize="false"></control>
    <el-space direction="vertical" :size="10">
      <template v-if="!!lastLogin">
        <el-image :src="lastLogin.img || '/userIcon.png'" class="!w-[150px] !h-[150px]" :alt="lastLogin.name"></el-image>
        <el-text size="large" type="primary">{{ lastLogin.name }}</el-text>
        <el-button type="primary" @click="login()" class="!w-full">进入__APP_NAME__</el-button>
        <el-link type="primary" class="!-mt-2" @click="lastLogin = false">通过其他方式</el-link>
      </template>
      <template v-else>
        <n-qr-code :value="qrcodeValue" :size="150"></n-qr-code>
        <el-space direction="vertical" :size="0">
          <el-text class="!text-blue-400 !text-xl">扫码登陆__APP_NAME__</el-text>
          <div>
            <el-text class="!text-[14px]">或者</el-text>
            <el-link @click="$router.push('/login/byPassWord')" class=" select-none" type="primary">账号密码登陆</el-link>
          </div>
        </el-space>
      </template>
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