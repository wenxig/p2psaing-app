<script setup lang='ts'>
import { ref } from 'vue';
import plusInput from '@/components/plusInput.vue';
import { random } from 'lodash-es';
import router from '@/router';
import { useAuth,type NextLoginFunction } from '@h/useAuth';
import { ElLoading } from 'element-plus';
window.electronAPI.ipcRenderer.invoke("mainWindow_setSize", {
  width: 280,
  height: 400
})
const auth = useAuth()
const passCode = `${random(100000,999999)}`
const email = ref("")
const password = ref("")
const isPage1 = ref(true)
const inputPassCode = ref('')
const passCodeTrue = ref(false)
let next: NextLoginFunction
function login() {
  const loading = ElLoading.service({
    lock: true,
    text: '查询数据中',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  auth.login({
    email: email.value,
    password: password.value
  }).then(val => {
    isPage1.value = false
    next = val[2]
    if (import.meta.env.DEV) {
      lastLogin(true)
      return
    }
    window.email.send(email.value, `登陆验证`, `你的验证码：${passCode}`).catch(() => {
      ElMessage.error('邮件发送失败')
    }).then(() => {
      console.log(`你的验证码：${passCode}`);
    })
  })
    .catch(() => ElMessage.error("用户不存在"))
    .finally(() => loading.close())
}

function lastLogin(jump: boolean = false) {
  if (jump || inputPassCode.value == passCode) {
    next()
    router.replace('/main')
  } else {
    passCodeTrue.value = true
    setTimeout(() => {
      passCodeTrue.value = false
    }, 1000);
  }
}
</script>

<template>
  <el-container class="w-full h-full region-drag">
    <el-header class="!absolute w-full !flex justify-center items-center">
      <el-text size="large">账号密码登陆</el-text>
    </el-header>
    <el-main class="w-full h-full mt-2 !flex justify-center items-center !flex-col !pt-0" v-if="isPage1">
      <plus-input v-model="email" lable="邮箱" type="email" inspect class="mt-[-3rem]" />
      <plus-input v-model="password" lable="密码" type="email" class="mt-4" />
      <div class="grid mt-5 content-center justify-items-center w-full">
        <el-button type="primary" class="region-no-drag w-2/3" @click="login">登入</el-button>
        <el-button plain class="region-no-drag w-2/3 mt-2 !ml-0" @click="$router.push('/login')">返回二维码登陆</el-button>
      </div>
    </el-main>
    <el-main class="w-full h-full mt-2 !flex justify-center items-center !flex-col !pt-0" v-else>
      <plus-input class="!mt-[-9rem]" v-model="inputPassCode" lable="验证码" type="text" :alert="passCodeTrue" />
      <el-text class=" !w-full" type="primary" size="small">验证码已经发送至你的邮箱</el-text>
      <el-button type="primary" class="region-no-drag w-2/3 mt-3" @click="lastLogin()">登入</el-button>
    </el-main>
    <el-footer class="!absolute w-full !flex justify-center items-end !pb-1 bottom-0 region-no-drag select-none text-sm">
      还没有账号?<el-link type="primary" @click="$router.push('/login/signup')">注册</el-link>
    </el-footer>
    <control class="absolute top-0 left-0 z-20" type="quit" :minsize="false" :maxsize="false"></control>
  </el-container>
</template>