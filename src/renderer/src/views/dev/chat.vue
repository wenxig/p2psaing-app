<script setup lang='tsx'>
import { useAppStore } from '@/store/appdata';
import { ref, defineComponent, reactive, markRaw, provide } from 'vue'
import { ElText } from 'element-plus'
import MsgList from '@p/chat/msgList.c.vue'
import CodeView from '@p/chat/check/code.c.vue'
import { createRandomUser } from '@/utils/user';
import { Picture } from '@element-plus/icons-vue'
import { useFileDialog } from '@vueuse/core';
import { fileToDataURL } from '@/utils/image';
import { MD5 } from 'crypto-js';
import { Code } from '@vicons/carbon';
import { useSender } from '../chat/inject';
import { times } from 'lodash-es';
const file = useFileDialog({
  accept: 'image/*'
})
const app = useAppStore()
const user = createRandomUser()
const toUser = createRandomUser()
const msgs = ref<Peer.Request.Msg[]>([])
const tempMsg = reactive({
  text: '',
  code_is: 61,
  showPlaseCode: false
})
app.topBar.value = markRaw(defineComponent(() => {
  return () => {
    return (<div class=" w-full relative flex items-center">
      <ElText class='!text-xl !mr-4'>dev connect</ElText>
    </div>)
  }
}))
const sendFromMe = ref(true)
const createMeg = (body: Peer.Msg.All): Peer.Request.Msg => ({
  body,
  headers: {
    from: sendFromMe.value ? user.uid : toUser.uid,
    time: new Date().getTime()
  },
  path: `/msg`
})
class SendMsg {
  public static text() {
    msgs.value.push(createMeg({
      type: 'text',
      main: tempMsg.text || '<empty>'
    }))
    tempMsg.text = ''
  }
  public static imageWithSelect() {
    file.open()
    file.onChange(async () => {
      const imgs = await Promise.all(times(file.files.value?.length ?? 0, async i => await fileToDataURL(file.files.value![i])))
      for (const img of imgs) SendMsg.image(img)
    })
  }
  public static videoWithSelect() {
    file.open()
    file.onChange(async () => {
      const videos = await Promise.all(times(file.files.value?.length ?? 0, async i => await fileToDataURL(file.files.value![i])))
      for (const video of videos) SendMsg.video(video)
    })
  }
  public static fileWithSelect() {
    file.open()
    file.onChange(async () => {
      const files = await Promise.all(times(file.files.value?.length ?? 0, async i => [await fileToDataURL(file.files.value![i]), file.files.value![i].name]))
      for (const file of files) SendMsg.file(file[0], file[1])
    })
  }
  public static code() {
    msgs.value.push(createMeg({
      type: 'code',
      main: tempMsg.text || '// <empty>',
      is: tempMsg.code_is
    }))
    tempMsg.text = ''
    CodeViewC.value?.close()
  }

  public static video(dataUrl: string) {
    msgs.value.push(createMeg({
      type: 'video',
      main: dataUrl,
      md5: MD5(dataUrl).toString()
    }))
  }
  public static image(dataUrl: string) {
    msgs.value.push(createMeg({
      type: 'img',
      main: dataUrl,
      md5: MD5(dataUrl).toString()
    }))
  }
  public static article(dataUrl: string) {
    msgs.value.push(createMeg({
      type: 'article',
      main: dataUrl,
      md5: MD5(dataUrl).toString()
    }))
  }
  public static file(dataUrl: string, name: string) {
    msgs.value.push(createMeg({
      type: 'file',
      main: dataUrl,
      md5: MD5(dataUrl).toString(),
      name
    }))
  }
}
provide(useSender, (key: any, ...value) => SendMsg[key](...value))
const SEND_IMAGE_BUTTON_CLASS = 'transition-colors !text-[--el-color-info-light-5] hover:!text-[--el-color-info-light-3] active:!text-[--el-color-info]'
// 基块 end

const CodeViewC = ref<InstanceType<typeof CodeView>>()
</script>

<template>
  <div class=" h-full overflow-hidden">
    <ElUpload class="!hidden"></ElUpload>
    <MsgList :msgs="msgs" :users="[user, toUser]" :uid="user.uid" />
    <div class="h-1/5 border-t relative bottom-0">
      <n-mention type="textarea" :options="[]" class="!h-full !w-full" v-model:value="tempMsg.text"></n-mention>
      <el-space class="absolute top-1 right-1">
        <el-icon @click="SendMsg.imageWithSelect()" size="25">
          <Picture :class="SEND_IMAGE_BUTTON_CLASS" />
        </el-icon>
        <el-icon size="25" @click="CodeViewC?.open()">
          <Code :class="SEND_IMAGE_BUTTON_CLASS" />
        </el-icon>
      </el-space>
      <div class="absolute bottom-1 right-1">
        <n-button type="primary" class="mr-1" @click="SendMsg.text()">发送</n-button>
        <label class="select-none">
          对方
          <ElSwitch v-model="sendFromMe"></ElSwitch>
          己方
        </label>
      </div>
    </div>
  </div>
  <CodeView v-model="tempMsg" :code-sender="SendMsg.code" ref="CodeViewC" />
</template>

<style scoped lang='scss'>
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