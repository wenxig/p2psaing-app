<script setup lang='ts'>
import { ref, reactive } from 'vue';
import plusInput from '@/components/plusInput.vue';
import { random } from 'lodash-es';
import { ElLoading, ElMessage } from 'element-plus';
import { useAppStore } from '@s/appdata';
import { actor } from '@/controller';
import { sendEmail, get } from '@/db/network';
import { HmacSHA256 } from 'crypto-js';
const app = useAppStore()
window.ipc.setSize(280, 400)
const passCode = random(100000, 999999).toString()
const isPassCodeRight = ref(true)
const isPage1 = ref(true)
const from = reactive({
  email: '',
  password: "",
  passCode: ''
})
function checkUserAlive() {
  const loading = ElLoading.service({
    lock: true,
    text: '查询数据中',
    background: !app.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  })
  get(HmacSHA256(from.email, from.password).toString()).then(val => {
    if (!val[1]) return void ElMessage.error("用户不存在")
    isPage1.value = false
    if (import.meta.env.DEV) return void login(true)
    sendEmail(from.email, `登陆验证`, `你的验证码：${passCode}`)
      .catch(() => ElMessage.error('邮件发送失败'))
      .then(() => console.log(`你的验证码：${passCode}`))
  })
    .catch(() => ElMessage.error("网络错误"))
    .finally(() => loading.close())
}

let to: NodeJS.Timeout
function login(jump: boolean = false) {
  if (jump || from.passCode == passCode) actor.send({ type: 'logining', data: from })
  else {
    if (to) clearTimeout(to)
    isPassCodeRight.value = false
    to = setTimeout(() => isPassCodeRight.value = true, 1000);
  }
}
</script>

<template>
  <el-container class="w-full h-full region-drag">
    <el-header class="!absolute w-full !flex justify-center items-center">
      <el-text size="large">账号密码登陆</el-text>
    </el-header>
    <el-main class="w-full h-full mt-2 !flex justify-center items-center !flex-col !pt-0" v-if="isPage1">
      <plus-input v-model="from.email" lable="邮箱" type="email" inspect class="mt-[-3rem]" />
      <plus-input v-model="from.password" lable="密码" type="email" class="mt-4" />
      <div class="grid mt-5 content-center justify-items-center w-full">
        <el-button type="primary" class="w-2/3" @click="checkUserAlive">登入</el-button>
        <el-button plain class="w-2/3 mt-2 !ml-0" @click="$router.replace('/login')">返回二维码登陆</el-button>
      </div>
    </el-main>
    <el-main class="w-full h-full mt-2 !flex justify-center items-center !flex-col !pt-0" v-else>
      <plus-input class="!mt-[-9rem]" v-model="from.passCode" lable="验证码" type="text" :alert="!isPassCodeRight" />
      <el-text class=" !w-full" type="primary" size="small">验证码已经发送至你的邮箱</el-text>
      <el-button type="primary" class="w-2/3 mt-3" @click="login()">登入</el-button>
    </el-main>
    <el-footer class="!absolute w-full !flex justify-center items-end !pb-1 bottom-0 region-no-drag select-none text-sm">
      还没有账号?<el-link type="primary" @click="$router.replace('/login/signup')">注册</el-link>
    </el-footer>
    <control class="absolute top-0 left-0 z-20" type="quit" :minsize="false" :maxsize="false"></control>
  </el-container>
</template>