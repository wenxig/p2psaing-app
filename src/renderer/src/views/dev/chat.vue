<script setup lang='tsx'>
import { useAppStore } from '@/store/appdata';
import { ref, defineComponent, reactive, markRaw } from 'vue'
import { ElText } from 'element-plus'
import MsgList from '@p/chat/msgList.c.vue'
import { createRandomUser } from '@/utils/user';
import { Picture } from '@element-plus/icons-vue'
import { useFileDialog } from '@vueuse/core';
import { fileToDataURL } from '@/utils/image';
import { MD5 } from 'crypto-js';
const file = useFileDialog({
  accept: 'image/*'
})
const app = useAppStore()
const user = createRandomUser()
const toUser = createRandomUser()
const msgs = ref<Peer.Request.Msg[]>([])
const tempMsg = reactive({
  text: ''
})
app.topBar.value = markRaw(defineComponent(() => {
  return () => {
    return (<div class=" w-full relative flex items-center">
      <ElText class='!text-xl !mr-4'>dev connect</ElText>
    </div>)
  }
}))

class SendMsg {
  public static async text() {
    const msg: Peer.Request.Msg = {
      body: {
        type: 'text',
        main: tempMsg.text || '<empty>'
      },
      headers: {
        from: user.uid,
        time: new Date().getTime()
      },
      path: `/msg`
    }
    msgs.value.push(msg)
    tempMsg.text = ''
  }
  public static image() {
    file.open()
    file.onChange(async () => {
      const img = await fileToDataURL(file.files.value![0])
      const msg: Peer.Request.Msg = {
        body: {
          type: 'img',
          main: img,
          md5: MD5(img).toString()
        },
        headers: {
          from: user.uid,
          time: new Date().getTime()
        },
        path: `/msg`
      }
      msgs.value.push(msg)
      tempMsg.text = ''
    })
  }
  public static async text2() {
    const msg: Peer.Request.Msg = {
      body: {
        type: 'text',
        main: tempMsg.text || '<empty>'
      },
      headers: {
        from: toUser.uid,
        time: new Date().getTime()
      },
      path: `/msg`
    }
    msgs.value.push(msg)
    tempMsg.text = ''
  }
}
</script>

<template>
  <div class=" h-full overflow-hidden">
    <ElUpload class="!hidden"></ElUpload>
    <MsgList :msgs="msgs" :users="[user, toUser]" :uid="user.uid" />
    <div class="w-full h-[20%] border-t relative">
      <n-mention type="textarea" :options="[]" class="!h-full !w-full" v-model:value="tempMsg.text"></n-mention>
      <el-space class="absolute top-1 right-1">
        <el-icon @click="SendMsg.image()" size="20">
          <Picture
            class="transition-colors !text-[--el-color-info-light-5] hover:!text-[--el-color-info-light-3] active:!text-[--el-color-info]" />
        </el-icon>
      </el-space>
      <div class="absolute bottom-1 right-1">
        <n-button type="primary" class="mr-1" @click="SendMsg.text()">发送(己方)</n-button>
        <n-button type="primary" plain @click="SendMsg.text2()">发送(对方)</n-button>
      </div>
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