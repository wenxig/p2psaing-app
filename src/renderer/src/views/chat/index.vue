<script setup lang='tsx'>
import { ConnectionSignal, ConnectionSignalOff, Code, FunctionMath } from '@vicons/carbon';
import { ref, defineComponent, reactive, watch, markRaw, provide } from 'vue';
import { Picture, VideoPlay, Document } from '@element-plus/icons-vue';
import { ElIcon, ElMessage, ElSpace, ElText } from 'element-plus';
import { toNumber, find, isEmpty, times } from 'lodash-es';
import EquationView from '@p/chat/check/equation.c.vue';
import ArticleEdit from '@p/chat/check/article.c.vue';
import CodeView from '@p/chat/check/code.c.vue';
import { Clock20Regular } from '@vicons/fluent';
import { useAppStore } from '@/store/appdata';
import { fileToDataURL } from '@/utils/image';
import { useFileDialog } from '@vueuse/core';
import { useUserStore } from '@/store/user';
import MsgList from '@p/chat/msgList.c.vue';
import { useSender, useIsSending } from '../chat/inject';
import { Chat, isMsg } from '@/api/chat';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { PeerError } from 'peerjs';
import { MD5 } from 'crypto-js';
import db from '@/db';
// 我可爱导(入)了

const file = (accept = 'image/*') => useFileDialog({ accept })
const app = useAppStore()
const { user } = storeToRefs(useUserStore())
const route = useRoute()
const toUser = find(app.links, { uid: toNumber(route.params.uid) })!
const connection = Chat.refs.get(user.value.uid)!.linkList[toUser.uid].connection
const msgs = ref<Peer.Request.Msg[]>([])
db.msg.get(toUser.uid).then((data) => {
  msgs.value = data
  watch(msgs, (msg) => {
    const data = msg.at(-1)!
    if (data.body.type != 'callback') db.msg.add(toUser.uid, data)
  })
})
connection.onData(`/msg`, async (data) => {
  if (!isMsg(data)) return false
  if (data.body.type == 'callback') return true
  msgs.value.push(data)
  return {
    path: '/msg',
    headers: {
      time: new Date().getTime(),
      from: user.value.uid,
    },
    body: {
      type: 'callback',
      main: true,
    }
  }
})
app.topBar.value = markRaw(defineComponent(() => () => <div class=" w-full relative flex items-center">
  <ElText class='!text-xl !mr-4'>{toUser.name}</ElText>
  <ElSpace size={5}>
    {route.params.type == 'temp' && <ElIcon color='gray'><Clock20Regular /></ElIcon>}
    {connection.isOpen.value ? <ElIcon><ConnectionSignal /></ElIcon> : <ElIcon><ConnectionSignalOff /></ElIcon>}
  </ElSpace>
</div>))

const tempMsg = reactive({
  text: '',
  code_is: 61,
})
const isSendingMessages = reactive<{ time: number; isSending: boolean; succeed: boolean; fail: boolean; }[]>([])
const createMeg = (body: Peer.Msg.All): Peer.Request.Msg => ({
  body,
  headers: {
    from: user.value.uid,
    time: new Date().getTime()
  },
  path: `/msg`
})


class SendMsg {
  public static async send(msg: Peer.Request.Msg) {
    if (!(await connection.send(msg)).body) throw new PeerError('send', 'sendError')
    msgs.value.push(msg)
  }
  public static imageWithSelect() {
    const f = file()
    f.open()
    f.onChange(async () => {
      const imgs = await Promise.all(times(f.files.value?.length ?? 0, async i => await fileToDataURL(f.files.value![i])))
      for (const img of imgs) SendMsg.image(img)
    })
  }
  public static videoWithSelect() {
    const f = file('video/*')
    f.open()
    f.onChange(async () => {
      const videos = await Promise.all(times(f.files.value?.length ?? 0, async i => await fileToDataURL(f.files.value![i])))
      for (const video of videos) SendMsg.video(video)
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
  public static async text() {
    if (isEmpty(tempMsg.text)) ElMessage.error('不能发送空消息')
    await SendMsg.send(createMeg({
      type: 'text',
      main: tempMsg.text.replaceAll('$$', '')
    }))
    tempMsg.text = ''
  }
  public static async code() {
    if (isEmpty(tempMsg.text)) ElMessage.error('不能发送空消息')
    await SendMsg.send(createMeg({
      type: 'code',
      main: tempMsg.text,
      is: tempMsg.code_is
    }))
    tempMsg.text = ''
    CodeViewC.value?.close()
  }

  public static async video(dataUrl: string) {
    await SendMsg.send(createMeg({
      type: 'video',
      main: dataUrl,
      md5: MD5(dataUrl).toString()
    }))
  }
  public static async image(dataUrl: string) {
    await SendMsg.send(createMeg({
      type: 'img',
      main: dataUrl,
      md5: MD5(dataUrl).toString()
    }))
  }
  public static async article(text: string) {
    if (isEmpty(text)) ElMessage.error('不能发送空消息')
    await SendMsg.send(createMeg({
      type: 'article',
      main: text,
      md5: MD5(text).toString()
    }))
  }
  public static async file(dataUrl: string, name: string) {
    await SendMsg.send(createMeg({
      type: 'file',
      main: dataUrl,
      md5: MD5(dataUrl).toString(),
      name
    }))
  }
}
provide(useSender, (key: any, ...value) => SendMsg[key](...value))
provide(useIsSending, isSendingMessages)

const SEND_IMAGE_BUTTON_CLASS = 'transition-colors !text-[--el-color-info-light-5] hover:!text-[--el-color-info-light-3] active:!text-[--el-color-info]'
const CodeViewC = ref<InstanceType<typeof CodeView>>()
const EquationViewC = ref<InstanceType<typeof EquationView>>()
const ArticleEditC = ref<InstanceType<typeof ArticleEdit>>()
</script>

<template>
  <div class=" h-full overflow-hidden">
    <ElUpload class="!hidden"></ElUpload>
    <MsgList :msgs="msgs" :users="[user, toUser]" :uid="user.uid" />
    <el-space class="pl-1 border-t w-full h-[5%]">
      <el-icon @click="SendMsg.imageWithSelect()" size="25">
        <Picture :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon @click="SendMsg.videoWithSelect()" size="25">
        <VideoPlay :class="SEND_IMAGE_BUTTON_CLASS" />
      </el-icon>
      <el-icon size="25" @click="SendMsg.fileWithSelect()">
        <svg :class="SEND_IMAGE_BUTTON_CLASS" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 1024 1024">
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
        <n-button type="primary" class="mr-1" @click="SendMsg.text()">发送</n-button>
      </div>
    </div>
  </div>
  <CodeView v-model="tempMsg" ref="CodeViewC" />
  <EquationView v-model="tempMsg" ref="EquationViewC" />
  <ArticleEdit ref="ArticleEditC" @write-ok="SendMsg.article" />
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