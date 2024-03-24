<script setup lang='tsx'>
import { useAppStore } from '@/store/appdata';
import { ref, defineComponent, reactive, markRaw, provide } from 'vue'
import { ElText } from 'element-plus'
import MsgList from '@p/chat/msgList.c.vue'
import CodeView from '@p/chat/check/code.c.vue'
import EquationView from '@p/chat/check/equation.c.vue'
import ArticleEdit from '@p/chat/check/article.c.vue'
import { createRandomUser } from '@/utils/user';
import { Picture, VideoPlay, Document } from '@element-plus/icons-vue'
import { useFileDialog } from '@vueuse/core';
import { fileToDataURL } from '@/utils/image';
import { MD5 } from 'crypto-js';
import { Code, FunctionMath } from '@vicons/carbon';
import { useSender } from '../chat/inject';
import { isEmpty, times } from 'lodash-es';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
const file = (accept = 'image/*') => useFileDialog({
  accept
})
const app = useAppStore()
const { user } = storeToRefs(useUserStore())
const toUser = createRandomUser()
const msgs = ref<Peer.Request.Msg[]>([])
const tempMsg = reactive({
  text: '',
  code_is: 61,
})
app.topBar.value = markRaw(defineComponent(() => () => <div class=" w-full relative flex items-center">
  <ElText class='!text-xl !mr-4'>dev connect</ElText>
</div>))
const sendFromMe = ref(true)
const createMeg = (body: Peer.Msg.All): Peer.Request.Msg => ({
  body,
  headers: {
    from: sendFromMe.value ? user.value.uid : toUser.uid,
    time: new Date().getTime()
  },
  path: `/msg`
})
class SendMsg {
  public static send(msg: Peer.Request.Msg) {
    msgs.value.push(msg)
  }
  public static imageWithSelect() {
    const f = file()
    f.open()
    f.onChange(async () => {
      const imgs = await Promise.all(times(f.files.value?.length ?? 0, async i => [await fileToDataURL(f.files.value![i]), f.files.value![i].name]))
      for (const img of imgs) SendMsg.image(img[0], img[1])
    })
  }
  public static videoWithSelect() {
    const f = file('video/*')
    f.open()
    f.onChange(async () => {
      const videos = await Promise.all(times(f.files.value?.length ?? 0, async i => [await fileToDataURL(f.files.value![i]), f.files.value![i].name]))
      for (const video of videos) SendMsg.video(video[0], video[1])
    })
  }
  public static fileWithSelect() {
    const f = file('')
    f.open()
    f.onChange(async () => {
      const files = await Promise.all(times(f.files.value?.length ?? 0, async i => [await fileToDataURL(f.files.value![i]), f.files.value![i].name]))
      for (const file of files) SendMsg.file(file[0], file[1])
    })
  }
  public static articleWithEdit() {
    ArticleEditC.value?.open()
  }
  public static equation() {
    if (isEmpty(tempMsg.text)) ElMessage.error('不能发送空消息')
    SendMsg.send(createMeg({
      type: 'equation',
      main: tempMsg.text
    }))
    tempMsg.text = ''
  }
  public static text() {
    if (isEmpty(tempMsg.text)) ElMessage.error('不能发送空消息')
    SendMsg.send(createMeg({
      type: 'text',
      main: tempMsg.text.replaceAll('$$', '')
    }))
    tempMsg.text = ''
  }
  public static code() {
    if (isEmpty(tempMsg.text)) ElMessage.error('不能发送空消息')
    SendMsg.send(createMeg({
      type: 'code',
      main: tempMsg.text,
      is: tempMsg.code_is
    }))
    tempMsg.text = ''
    CodeViewC.value?.close()
  }

  public static video(dataUrl: string, name: string) {
    SendMsg.send(createMeg({
      type: 'video',
      main: dataUrl,
      md5: MD5(dataUrl).toString(),
      name
    }))
  }
  public static image(dataUrl: string, name: string) {
    SendMsg.send(createMeg({
      type: 'img',
      main: dataUrl,
      md5: MD5(dataUrl).toString(),
      name
    }))
  }
  public static article(text: string, name: string) {
    if (isEmpty(text)) ElMessage.error('不能发送空消息')
    SendMsg.send(createMeg({
      type: 'article',
      main: text,
      md5: MD5(text).toString(),
      name
    }))
  }
  public static file(dataUrl: string, name: string) {
    SendMsg.send(createMeg({
      type: 'file',
      main: dataUrl,
      md5: MD5(dataUrl).toString(),
      name,
    }))
  }

}
provide(useSender, (key: any, ...value) => SendMsg[key](...value))
const SEND_IMAGE_BUTTON_CLASS = 'transition-colors !text-[--el-color-info-light-5] hover:!text-[--el-color-info-light-3] active:!text-[--el-color-info]'
// 基块 end
const CodeViewC = ref<InstanceType<typeof CodeView>>()
const EquationViewC = ref<InstanceType<typeof EquationView>>()
const ArticleEditC = ref<InstanceType<typeof ArticleEdit>>()
</script>

<template>
  <div class=" h-full overflow-hidden">
    <ElUpload class="!hidden"></ElUpload>
    <MsgList :msgs="msgs" :users="[user, toUser]" :uid="user.uid" />
    <el-space class="pl-1 border-[--el-border-color] border-t w-full h-[5%]">
      <el-icon @click="SendMsg.imageWithSelect()" size="25">
        <Picture :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon @click="SendMsg.videoWithSelect()" size="25">
        <VideoPlay :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon size="25" @click="SendMsg.fileWithSelect()">
        <svg :class="SEND_IMAGE_BUTTON_CLASS" xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024">
          <path
            d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z"
            fill="currentColor"></path>
        </svg>
      </el-icon>
      <el-icon size="25" @click="CodeViewC?.open()">
        <Code :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon @click="SendMsg.articleWithEdit()" size="25">
        <Document :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon size="25" @click="EquationViewC?.open()">
        <FunctionMath :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
    </el-space>
    <div class="h-1/5 relative bottom-0">
      <n-mention type="textarea" :options="[]" class="!h-full !w-full" v-model:value="tempMsg.text"></n-mention>
      <div class="absolute bottom-1 right-1">
        <el-button type="primary" class="mr-1" @click="SendMsg.text()">发送</el-button>
        <label class="select-none">
          <el-text>对方</el-text>
          <ElSwitch v-model="sendFromMe"></ElSwitch>
          <el-text>己方</el-text>
        </label>
      </div>
    </div>
  </div>
  <CodeView v-model="tempMsg" ref="CodeViewC" />
  <EquationView v-model="tempMsg" ref="EquationViewC" />
  <ArticleEdit ref="ArticleEditC" @write-ok="SendMsg.article" />
</template>

<style scoped lang='scss'>
:deep(.n-input) {
  --n-color: var(--el-bg-color) !important;
   --n-color-focus: var(--el-bg-color) !important;
}

:deep(.n-input--textarea) {
  --n-height: 100% !important;
  --n-border: 0px solid #dcdfe6 !important;
  --n-border-radius: 0% !important;
  height: var(--n-height);
  --n-padding-vertical: 1% !important;

  & * {
    resize: none !important;
  }
}
</style>