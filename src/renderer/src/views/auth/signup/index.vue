<script setup lang='ts'>
import { reactive } from 'vue';
import { ref } from 'vue';
import { ElLoading, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuth } from '@h/useAuth';
import { random } from 'lodash-es';
import { InfoFilled } from '@element-plus/icons-vue';
import { useAppStore } from '@s/appdata'
const emailPass = ref("")
const auth = useAuth()
const app = useAppStore();
window.electronAPI.ipcRenderer.invoke(`${window.windowName}_setSize`, {
  width: 650,
  height: 460
})

const ruleFormRef = ref<FormInstance>()
const allowUserPer = ref(false)
const showResult = ref(false)
const checkName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入用户名'))
  }
  if (/yan|fei|[烟绯]/.test(value)) {
    return callback(new Error('包含敏感词语'))
  }
  callback()
}

const validatePass = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
    return
  }
  if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[a-z])[a-z0-9]{8,10}$/).test(value)) {
    callback(new Error('当前密码强度不够'))
  }
  callback()
}
const validatePass2 = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== ruleForm.password) {
    callback(new Error("两次密码不一样"))
  } else if (!((/^(?=.*\d)(?=.*[a-z])(?=.*[a-z])[a-z0-9]{8,10}$/).test(value))) {
    callback(new Error('当前密码强度不够'))
  } else {
    callback()
  }
}

const checkEmail = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入邮箱'))
  }
  if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(value)) {
    callback(new Error('好像不是邮箱捏'))
  }
  callback()
}

const checkCode = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入邮箱验证码'))
  }
  if (emailPass.value != value) {
    callback(new Error('验证码不正确'))
  }
  callback()
}

const ruleForm = reactive({
  name: "",
  password: "",
  password2: "",
  email: "",
  emailPass: "",
  emailButtonText: "发送验证码"
})

const rules = reactive<FormRules<typeof ruleForm>>({
  password: [{ validator: validatePass, trigger: 'blur' }],
  password2: [{ validator: validatePass2, trigger: 'blur' }],
  name: [{ validator: checkName, trigger: 'blur' }],
  email: [{ validator: checkEmail, trigger: 'blur' }],
  emailPass: [{ validator: checkCode, trigger: 'blur' }]
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return false
    }
    if (!allowUserPer.value) {
      ElMessage.error("未同意《用户许可》")
      return;
    }
    const loading = ElLoading.service({
      lock: true,
      text: '上传数据中',
      background: !app.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    })
    auth.signUp(ruleForm).then(ret => {
      if (ret) {
        showResult.value = true
        return true;
      }
      ElMessage.error("用户已经存在")
    }).catch(err => {
      ElMessage.error(err)
    }).finally(() => loading.close())
  })
}

const sendEmail = () => {
  if (!ruleForm.email) {
    ElMessage.error('要不填个邮箱')
    return
  }
  checkEmail('', ruleForm.email, (is: void | Error) => {
    ruleForm.emailButtonText = "已发送验证码"
    if (is) {
      ElMessage.error('请正确填写邮箱')
      return
    }
    emailPass.value = `${random(9)}${random(9)}${random(9)}${random(9)}${random(9)}${random(9)}`
    console.log(`你的验证码：${emailPass.value}`);
    window.email.send(ruleForm.email, '验证注册邮箱', `你的验证码：${emailPass.value}`).catch(() => {
      ElMessage.error('邮件发送失败')
    }).then(() => {
      ElMessage.success("发送成功，视接口网络情况1~5分钟内收到都有可能")
      return true
    })
    ruleForm.emailButtonText = "发送验证码"
  })
}
</script>

<template>
  <el-container class="w-full h-full region-drag">
    <el-main class="w-full h-full  !flex justify-center items-center">
      <el-text class=" top-6 left-7 fixed" size="large" type="primary">注册</el-text>
      <el-form :inline="true" ref="ruleFormRef" :model="ruleForm" status-icon class=" !p-4 !pt-1 mt-6" :rules="rules"
        label-position="top">
        <el-form-item label="用户名" class=" w-full" prop="name">
          <el-input v-model="ruleForm.name" maxlength="10" show-word-limit></el-input>
        </el-form-item>
        <el-row class="w-full">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="ruleForm.password" type="password" show-password maxlength="10"
                show-word-limit></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重复密码" prop="password2">
              <el-input v-model="ruleForm.password2" type="password" show-password maxlength="10"
                show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱" class="w-full" prop="email">
          <el-input v-model="ruleForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="邮箱验证码" class="w-full !mb-0" prop="emailPass">
          <el-input v-model="ruleForm.emailPass" maxlength="6" minlength="6">
            <template #append>
              <el-button plain @click="sendEmail" :disabled="ruleForm.emailButtonText != '发送验证码'">
                {{ ruleForm.emailButtonText }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="!w-full !mb-0">
          <el-checkbox v-model="allowUserPer" size="large">
            同意
          </el-checkbox>
          <n-button quaternary type="primary" class=" !pl-0 !pr-0"
            @click.stop="$electron.ipcRenderer.send('createChildWindow', { width: 300, height: 300, url: '/p', name: `userp`, more: false })"
            size="small">《用户许可》</n-button>
        </el-form-item>
        <el-form-item class="!w-full !mb-0">
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
      <el-popover placement="top-start" title="关于邮件" :width="200" trigger="click"
        content="这个人，把自己邮箱唯一的smtp功能密钥忘了，导致它要上网上找api用">
        <template #reference>
          <el-button class="m-2 !fixed right-1 bottom-1 !text-lg" text size="small" :icon="InfoFilled"></el-button>
        </template>
      </el-popover>
    </el-main>
    <el-result icon="success" title="成功" sub-title="点击确定将登陆" class="!fixed w-full h-full bg-white z-10" v-if="showResult">
      <template #extra>
        <el-button type="primary" @click="$router.replace('/main')">确定</el-button>
      </template>
    </el-result>
    <control class="absolute top-0 left-0 z-20" type="quit" :minsize="false" :maxsize="false"></control>
  </el-container>
</template>