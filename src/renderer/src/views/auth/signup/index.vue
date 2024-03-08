<script setup lang='ts'>
import { reactive, ref } from 'vue';
import { ElLoading, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { isEmpty, random } from 'lodash-es';
import { InfoFilled } from '@element-plus/icons-vue';
import { useAppStore } from '@s/appdata'
import { hasUserByEmail, sendEmail } from '@/db/network';
import { Checker } from "./checkers";
import { actor } from '@/controller';
import { signUp as signupApi } from '@/db/auth';
const emailPass = ref("")
const app = useAppStore();
window.ipc.setSize(650, 460)
const ruleFormRef = ref<FormInstance>()
const allowUserPer = ref(false)

const ruleForm = reactive({
  name: "",
  password: "",
  password2: "",
  email: "",
  emailPass: "",
  emailButtonText: "发送验证码"
})
const checker = new Checker(() => emailPass.value, ruleForm)
const rules = reactive<FormRules<typeof ruleForm>>({
  password: [{ validator: checker.validatePass, trigger: 'blur' }],
  password2: [{ validator: checker.validatePass2, trigger: 'blur' }],
  name: [{ validator: checker.checkName, trigger: 'blur' }],
  email: [{ validator: checker.checkEmail, trigger: 'blur' }],
  emailPass: [{ validator: checker.checkCode, trigger: 'blur' }]
})
let toId: NodeJS.Timeout
const handleEmailCodeSend = () => {
  if (!ruleForm.email) return void ElMessage.error('要不填个邮箱')
  if (!isEmpty(toId)) clearTimeout(toId)
  checker.checkEmail('', ruleForm.email, (isError: void | Error) => {
    ruleForm.emailButtonText = "已发送验证码"
    if (isError) return void ElMessage.error('请正确填写邮箱')
    emailPass.value = random(100000, 999999).toString()
    console.log(`你的验证码：${emailPass.value}`);
    sendEmail(ruleForm.email, '验证注册邮箱', `你的验证码：${emailPass.value}`)
      .catch(() => ElMessage.error('邮件发送失败'))
      .then(() => ElMessage.success("发送成功，视接口网络情况1~5分钟内收到都有可能"))
    toId = setTimeout(() => {
      ruleForm.emailButtonText = "发送验证码"
    }, 1000 * 60);
  })
}

const isUploadToDb = ref(false)
const signUp = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) return false
    if (!allowUserPer.value) return false || (void ElMessage.error("未同意《用户许可》"))
    const loading = ElLoading.service({
      lock: true,
      text: '上传数据中',
      background: !app.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    })
    return hasUserByEmail(ruleForm.email).then(async ret => {
      if (ret == false) {
        await signupApi(ruleForm)
        return isUploadToDb.value = true;
      }
      ElMessage.error("用户已经存在")
      return false
    }).catch(ElMessage.error).finally(() => loading.close())
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
              <el-button plain @click="handleEmailCodeSend" :disabled="ruleForm.emailButtonText != '发送验证码'">
                {{ ruleForm.emailButtonText }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="!w-full !mb-0">
          <el-checkbox v-model="allowUserPer" size="large">
            同意
          </el-checkbox>
          <n-button quaternary type="primary" class=" !pl-0 !pr-0"
            @click.stop="$ipc.createChildWindow({ width: 300, height: 300, url: '/p' })" size="small">《用户许可》</n-button>
        </el-form-item>
        <el-form-item class="!w-full !mb-0">
          <el-button type="primary" @click="signUp(ruleFormRef)">提交</el-button>
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
    <el-result icon="success" title="成功" sub-title="点击确定将登陆" class="!fixed w-full h-full bg-white z-10"
      v-if="isUploadToDb">
      <template #extra>
        <el-button type="primary" @click="actor.send({ type: 'singuping', data: ruleForm })">确定</el-button>
      </template>
    </el-result>
    <control class="absolute top-0 left-0 z-20" type="quit" :minsize="false" :maxsize="false"></control>
  </el-container>
</template>