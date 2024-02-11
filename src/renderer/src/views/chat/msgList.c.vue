<script setup lang='tsx'>
import { onMounted, ref, watch, } from 'vue';
import { computed } from 'vue';
import { ceil, chunk, toNumber } from 'lodash-es';
import Msg from './msg.c.vue'
import { times, find } from 'lodash-es';
import DargFile from '@p/chat/check/dragFile.c.vue'
import { fileToDataURL } from '@/utils/image';
import { useUserStore } from '@/store/user';
import { FunctionalComponent } from 'vue';
import { ElAvatar } from 'element-plus';
const ICON_SIZE = 35
const props = defineProps<{
  msgs: Peer.Request.Msg[];
  users: User.WebDbSave[];
}>()

const me = useUserStore()
const themImgUrl = (uid: number) => find(props.users, { uid: toNumber(uid) })!.img
const isMe = (uid: number) => uid == me.user.uid
const MIN_ROW_HIEGHT_PX = 40;


const CHUNK_SIZE = ceil(screen.height / MIN_ROW_HIEGHT_PX)
const page = ref(0)
const allChunks = computed<number>(() => {
  return chunk(props.msgs, CHUNK_SIZE).length
})
const datas = computed<[msgs: Peer.Request.Msg[], size: number]>(() => {
  const ch = chunk(props.msgs, CHUNK_SIZE)
  console.log(props.msgs, chunk(props.msgs, CHUNK_SIZE), [ch[page.value], ch.length])
  return [ch[page.value], ch.length]
})

const msgBox = ref<HTMLDivElement>()
onMounted(() => {
  const endEvent = (event: DragEvent) => {
    event.stopPropagation()
    event.preventDefault();
  }
  msgBox.value?.addEventListener('dragover', endEvent)
  msgBox.value?.addEventListener('drop', async (event) => {
    endEvent(event)
    if (!event.dataTransfer || event.dataTransfer.files.length < 1) return;
    const files = times(event.dataTransfer!.files.length, i => event.dataTransfer!.files.item(i)!).filter(Boolean)
    await DargFileC.value!.open(Promise.all(files.map(fileToDataURL)).then(res => res.map((dataUrl, i) => ([dataUrl, files[i].type, files[i].name]) as [data: string, type: string, name: string])))
  })
  watch(props.msgs, async (): Promise<void> => {
    msgBox.value!.scrollTop = msgBox.value!.scrollHeight
    page.value = allChunks.value - 1
    return
  }, { flush: 'post' })
})
const DargFileC = ref<InstanceType<typeof DargFile>>()

const Avatar: FunctionalComponent<{ uid: number }> = ({ uid }) => <ElAvatar src={themImgUrl(uid)} size={ICON_SIZE} shape="square" />

</script>

<template>
  <div class="w-full h-[75%] overflow-x-hidden overflow-y-auto relative" ref="msgBox">
    <div class="page-change-button" v-if="page != 0" @click="page--">前一页</div>
    <RightClickMenu v-slot="{ handleContextMenu }">
      <div v-for="(msg) in datas[0] " class="w-full flex my-3 px-2" :style="{
        minHeight: `calc(${MIN_ROW_HIEGHT_PX} * 1px)`
      }" :class="[isMe(msg.headers.from) ? 'justify-end' : 'justify-start']">
        <Avatar v-if="!isMe(msg.headers.from)" :uid="msg.headers.from" />
        <Msg @contextMenu="handleContextMenu" :father="msgBox!" :value="(msg.body as Peer.Msg.All)"
          :is-me="isMe(msg.headers.from)" />
        <Avatar v-if="isMe(msg.headers.from)" :uid="msg.headers.from" />
      </div>
    </RightClickMenu>
    <div class="page-change-button" v-if="(page + 1) * CHUNK_SIZE < datas[1]" @click="page++"
      :autocapitalize="((msgBox!.scrollTop = msgBox!.scrollHeight).toString())">下一页</div>
  </div>
  <DargFile ref="DargFileC" />
</template>
<style scoped lang="scss" >
.page-change-button {
  @apply w-full h-10 flex justify-center items-center transition-colors bg-[--el-fill-color-extra-light] hover:bg-[--el-fill-color-light] active:bg-[--el-fill-color] text-[--el-color-primary-light-5] hover:text-[--el-color-primary-light-3] active:text-[--el-color-primary-dark-2] select-none;
}
</style>
<style lang='scss'>
body {
  overflow: hidden;
}
</style>