<script setup lang='tsx'>
import { Chat, isMsg } from '@/api/chat';
import { ConnectionSignal, ConnectionSignalOff } from '@vicons/carbon'
import { Clock20Regular } from '@vicons/fluent'
import { useAppStore } from '@/store/appdata';
import { useRoute } from 'vue-router'
import { toNumber, filter } from 'lodash-es'
import { ref, defineComponent, reactive, watch, nextTick, markRaw } from 'vue'
import type { VirtualListInst } from 'naive-ui'
import { ElIcon, ElSpace } from 'element-plus'
import { useUserStore } from '@/store/user';
import db from '@/db';

const app = useAppStore()
const user = useUserStore()
const route = useRoute()
const toUser = filter(app.links, { uid: toNumber(route.params.uid) })[0]
const connection = Chat.ref.linkList[toUser.uid].connection
const msgs = ref<Peer.Request.Msg[]>([])
const isLink = ref(true)
const msgList = ref<VirtualListInst>()
db.msg.get(toUser.uid).then((data) => {
  msgs.value = data
  watch(msgs, (msg) => {
    console.log(msg);
    const data = msg.at(-1)!
    if (data.body.type != 'callback') {
      db.msg.add(toUser.uid, data)
      nextTick(() => msgList.value?.scrollTo({ position: 'bottom' }))
    }
  })
})
const tempMsg = reactive({
  text: ''
})

app.topBar.value = markRaw(defineComponent(() => {
  return () => {
    return (<div class=" w-full relative flex items-center">
      <el-text class='!text-xl !mr-4'>{toUser.name}</el-text>
      <ElSpace size={5}>
        {route.params.type == 'temp' && <el-icon color={'gray'}><Clock20Regular /></el-icon>}
        {isLink.value ? <ElIcon><ConnectionSignal /></ElIcon> : <el-icon><ConnectionSignalOff /></el-icon>}
      </ElSpace>
    </div>)
  }
}))

class SendMsg {
  public static async text() {
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
    await connection.send(msg)
    msgs.value.push(msg)
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

const minPopHeightPx = 30
</script>

<template>
  <div class=" h-full overflow-hidden">
    <div class="w-full h-[80%] overflow-y-visible">
      <n-virtual-list item-resizable :item-size="minPopHeightPx" :item="msgs" class="!h-full !w-full" ref="msgList">
        <template #default="{ item: msg }: { item: Peer.Request.Msg }">
          <div :key="msg.headers.time"
            class="max-w-[40%] inline-block rounded-md p-2 pl-3 pr-3 before:content-[''] before:w-2 before:h-2 before:block before:m-0 before:!absolute before:rotate-45 relative"
            :style="{
              minHeight: minPopHeightPx
            }" :class="{
  'bg-[var(--n-color-primary-light-5)] before:bg-[var(--n-color-primary-light-5)] right-0 before:right-0 before:translate-x-1/2': msg.headers.from == user.user.uid,
  'bg-[var(--n-color-primary-light-9)] before:bg-[var(--n-color-primary-light-9)] left-0 before:left-0 before:-translate-x-1/2': msg.headers.from != user.user.uid
}">
            {{ msg.body.main || ' ' }}
          </div>
        </template>
      </n-virtual-list>
    </div>
    <div class="w-full h-[20%] border-t relative">
      <el-input type="textarea" clearable class="!h-full !w-full" v-model="tempMsg.text"></el-input>
      <n-button type="primary" class="absolute bottom-1 right-1" plain @click="SendMsg.text()">发送</n-button>
    </div>
  </div>
</template>

<style scoped lang='scss'></style>