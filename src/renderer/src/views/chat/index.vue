<script setup lang='tsx'>
import { Chat } from '@/api/chat';
import { ConnectionSignal, ConnectionSignalOff } from '@vicons/carbon'
import { Clock20Regular } from '@vicons/fluent'
import { useAppStore } from '@/store/appdata';
import { useRoute } from 'vue-router'
import { toNumber, filter } from 'lodash-es'
import { ref, defineComponent, reactive, watch, nextTick } from 'vue'
import type { MentionOption, VirtualListInst } from 'naive-ui'
import { ElIcon, ElSpace } from 'element-plus'
import { useUserStore } from '@/store/user';
import db from '@/db';
import { isMsg } from '@/utils/peer';
const app = useAppStore()
const user = useUserStore()
const route = useRoute()
const toUser = filter(app.links, { uid: toNumber(route.params.uid) })[0]
const connection = Chat.ref.linkList[toUser.uid].connection
const mentions: MentionOption[] = []
const msgs = ref<Peer.Msg.index[]>([])
const isLink = ref(true)
const msgList = ref<VirtualListInst>()
db.getMsgs(toUser.uid).then((data) => {
  msgs.value = data
  watch(msgs, (msg) => {
    const data = msg.at(-1)!
    if (data.type != 'callback') {
      db.addMsg(toUser.uid, data)
      nextTick(() => msgList.value?.scrollTo({ position: 'bottom' }))
    }
  })
})
const tempMsg = reactive({
  text: ''
})
//@ts-ignore
app.topBar.value = defineComponent(() => {
  return () => {
    return (<div class=" w-full relative flex items-center">
      <el-text class='!text-xl !mr-4'>{toUser.name}</el-text>
      <ElSpace size={5}>
        {route.params.type == 'temp' && <el-icon color={'gray'}><Clock20Regular /></el-icon>}
        {isLink.value ? <ElIcon><ConnectionSignal /></ElIcon> : <el-icon><ConnectionSignalOff /></el-icon>}
      </ElSpace>
    </div>)
  }
})

class SendMsg {
  public static async text() {
    const body: Peer.Msg.index = {
      from: user.user.uid,
      type: 'text',
      main: tempMsg.text,
      time: new Date().getTime()
    }
    await Chat.ref.post(`/msg`, {
      connection,
      body
    })
    msgs.value.push(body)
  }
}
Chat.ref.onPost(connection, `/msg`, async (data) => {
  if (!isMsg(data.body)) {
    return false
  }
  if (data.body.type == 'callback') {
    return true
  }
  msgs.value.push(data.body)
  return {
    path: '/msg',
    headers: {},
    body: {
      type: 'callback',
      from: user.user.uid,
      main: true,
      time: new Date().getTime()
    }
  }
})

</script>

<template>
  <div class=" h-full overflow-hidden">
    <div class="w-full h-[80%] overflow-y-visible">
      <n-virtual-list item-resizable :item-size="20" :item="msgs" ref="msgList">
        <template #default="{ msg }: { msg: Peer.Msg.index }">
          <div :key="msg.time"
            class="max-w-[40%] inline-block rounded-md p-2 pl-3 pr-3 before:content-[''] before:w-2 before:h-2 before:block before:m-0 before:!absolute before:rotate-45 relative"
            :class="{
              'bg-[var(--n-color-primary-light-5)] before:bg-[var(--n-color-primary-light-5)] right-0 before:right-0 before:translate-x-1/2': msg.from == user.user.uid,
              'bg-[var(--n-color-primary-light-9)] before:bg-[var(--n-color-primary-light-9)] left-0 before:left-0 before:-translate-x-1/2': msg.from != user.user.uid
            }">
            {{ msg.main || ' ' }}
          </div>
        </template>
      </n-virtual-list>
    </div>
    <div class="w-full h-[20%] border-t relative">
      <n-mention :options="mentions" type="textarea" clearable size="large" class="input"
        v-model="tempMsg.text"></n-mention>
      <n-button type="primary" class="absolute bottom-1 right-1" plain @click="SendMsg.text()">发送</n-button>
    </div>
  </div>
</template>

<style scoped lang='scss'>
:deep(.input) {
  height: 100% !important;
  width: 100% !important;

  textarea,
  .n-input,
  .n-input--textarea {
    height: 100% !important;
    width: 100% !important;
    resize: none !important;
  }
}
</style>