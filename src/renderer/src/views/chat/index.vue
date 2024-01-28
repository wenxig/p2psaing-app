<script setup lang='tsx'>
import { Chat, isMsg } from '@/api/chat';
import { ConnectionSignal, ConnectionSignalOff } from '@vicons/carbon'
import { Clock20Regular } from '@vicons/fluent'
import { useAppStore } from '@/store/appdata';
import { useRoute } from 'vue-router'
import { toNumber, find, isEmpty } from 'lodash-es'
import { ref, defineComponent, reactive, watch, markRaw } from 'vue'
import { ElIcon, ElMessage, ElSpace, ElText } from 'element-plus'
import { useUserStore } from '@/store/user';
import db from '@/db';
// import MsgList from './msgList.c.vue'
const app = useAppStore()
const user = useUserStore()
const route = useRoute()
const toUser = find(app.links, { uid: toNumber(route.params.uid) })!
const connection = Chat.ref.linkList[toUser.uid].connection
const msgs = ref<Peer.Request.Msg[]>([])
db.msg.get(toUser.uid).then((data) => {
  msgs.value = data
  watch(msgs, (msg) => {
    const data = msg.at(-1)!
    if (data.body.type != 'callback') {
      console.log(data);
      db.msg.add(toUser.uid, data)
    }
  })
})
const tempMsg = reactive({
  text: ''
})

app.topBar.value = markRaw(defineComponent(() => () =>
(<div class=" w-full relative flex items-center">
  <ElText class='!text-xl !mr-4'>{toUser.name}</ElText>
  <ElSpace size={5}>
    {route.params.type == 'temp' && <ElIcon color='gray'><Clock20Regular /></ElIcon>}
    {connection.isOpen.value ? <ElIcon><ConnectionSignal /></ElIcon> : <ElIcon><ConnectionSignalOff /></ElIcon>}
  </ElSpace>
</div>)))

class SendMsg {
  public static async text() {
    if (isEmpty(tempMsg.text)) {
      ElMessage.error('不能发送空消息')
      return
    }
    const msg: Peer.Request.Msg = {
      body: {
        type: 'text',
        main: tempMsg.text
      },
      headers: {
        from: user.user.uid,
        time: new Date().getTime()
      },
      path: `/msg`
    }
    msgs.value.push(msg)
    tempMsg.text = ''
    await connection.send(msg)
  }
}
connection.onData(`/msg`, async (data) => {
  if (!isMsg(data)) {
    return false
  }
  if (data.body.type == 'callback') {
    return true
  }
  msgs.value.push(data)
  return {
    path: '/msg',
    headers: {
      time: new Date().getTime(),
      from: user.user.uid,
    },
    body: {
      type: 'callback',
      main: true,
    }
  }
})
</script>

<template>
  <div class=" h-full overflow-hidden">
    <!-- <MsgList :msgs="msgs" :users="[user.user, toUser]" :uid="user.user.uid" /> -->
    <div class="w-full h-[20%] border-t relative">
      <n-mention type="textarea" :options="[]" class="!h-full !w-full" v-model:value="tempMsg.text"></n-mention>
      <n-button type="primary" class="absolute bottom-1 right-1" plain @click="SendMsg.text()">发送</n-button>
    </div>
  </div>
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