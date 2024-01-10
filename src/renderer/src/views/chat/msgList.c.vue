<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import Msg from './msg.c.vue'
import { computed } from 'vue';
import { chunk, ceil } from 'lodash-es';
import { watch } from 'vue';
const ICON_SIZE = 35
const props = defineProps<{
  msgs: Peer.Request.Msg[];
  users: User.WebDbSave[];
  uid: number;
}>()
const user = props.users.find(v => v.uid == props.uid)!
const themImgUrl = (uid: number) => props.users.find(u => u.uid == uid)!.img
const isMe = (uid: number) => uid == user.uid



const MIN_ROW_HIEGHT_PX = 40;
const msgBox = ref<HTMLDivElement>()

const CHUNK_SIZE = ceil(screen.height / MIN_ROW_HIEGHT_PX)
const page = ref(0)
const datas = computed<[msgs: Peer.Request.Msg[], size: number]>(() => {
  const ch = chunk(props.msgs, CHUNK_SIZE)
  return [ch[page.value], ch.length]
})
onMounted(() => {
  watch(props.msgs, async (): Promise<void> => {
    if (page.value == datas.value[1] - 1) {
      msgBox.value!.scrollTop = msgBox.value!.scrollHeight
      return
    }
  }, { flush: 'post' })
})
</script>

<template>
  <div class="w-full h-[80%] overflow-x-hidden overflow-y-auto relative" ref="msgBox">
    <div class="page-change-button" v-if="page != 0" @click="page--">前一页</div>
    <div v-for="(msg) in  datas[0] " class="w-full flex my-3 px-2 msg-row"
      :class="[isMe(msg.headers.from) ? 'justify-end' : 'justify-start']">
      <el-avatar v-if="!isMe(msg.headers.from)" :src="themImgUrl(msg.headers.from)" :size="ICON_SIZE" shape="square" />
      <Msg :value="(msg.body as Peer.Msg.All)" :is-me="isMe(msg.headers.from)" />
      <el-avatar v-if="isMe(msg.headers.from)" :src="themImgUrl(msg.headers.from)" :size="ICON_SIZE" shape="square" />
    </div>
    <div class="page-change-button" v-if="page < datas[1] - 1" @click="page++"
      :autocapitalize="((msgBox!.scrollTop = msgBox!.scrollHeight).toString())">下一页</div>
  </div>
</template>
<style scoped lang="scss" >
.msg-row {
  min-height: calc(v-bind(MIN_ROW_HIEGHT_PX) * 1px);
}

.page-change-button {
  @apply w-full h-10 flex justify-center items-center transition-colors bg-[--el-fill-color-extra-light] hover:bg-[--el-fill-color-light] active:bg-[--el-fill-color] text-[--el-color-primary-light-5] hover:text-[--el-color-primary-light-3] active:text-[--el-color-primary-dark-2] select-none;
}
</style>