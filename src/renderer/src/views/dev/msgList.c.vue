<script setup lang='tsx'>
import { onMounted, ref, watch, } from 'vue';
import { toNumber } from 'lodash-es';
import Msg from '@p/chat/msg.c.vue'
import { times, find } from 'lodash-es';
import DargFile from '@p/chat/check/dragFile.c.vue'
import { fileToDataURL } from '@/utils/image';
import { useUserStore } from '@/store/user';
import { FunctionalComponent } from 'vue';
import { ElAvatar, ElAutoResizer } from 'element-plus';
import VList from './vList.c.vue'
const ICON_SIZE = 35
const props = defineProps<{
  msgs: Peer.Request.Msg[];
  users: User.WebDbSave[];
}>()

const me = useUserStore()
const themImgUrl = (uid: number) => find(props.users, { uid: toNumber(uid) })!.img
const isMe = (uid: number) => uid == me.user.uid
const MIN_ROW_HIEGHT_PX = 40;

const VlistIns = ref<{
  scrollToBottom(): void
}>()
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
  watch(() => props.msgs, async (): Promise<void> => {
    VlistIns.value.scrollToBottom()
  }, { flush: 'post' })
})
const DargFileC = ref<InstanceType<typeof DargFile>>()

const Avatar: FunctionalComponent<{ uid: number }> = ({ uid }) => <ElAvatar src={themImgUrl(uid)} size={ICON_SIZE} shape="square" />

</script>

<template>
  <div class="w-full h-[75%] overflow-x-hidden overflow-y-auto relative" ref="msgBox">
    <RightClickMenu v-slot="{ handleContextMenu }">
      <ElAutoResizer>
        <template #default="{ height }">
          <VList ref="VlistIns" :scrollHeight="height" :listData="props.msgs"
            :itemMinHeight="MIN_ROW_HIEGHT_PX">
            <template #default="{ item: msg }">
              <div class="w-full flex my-3 px-2" :style="`min-height: ${MIN_ROW_HIEGHT_PX}px;`"
                :class="[isMe(msg.headers.from) ? 'justify-end' : 'justify-start']">
                <Avatar v-if="!isMe(msg.headers.from)" :uid="msg.headers.from" />
                <Msg @contextMenu="handleContextMenu" :father="msgBox!" :value="(msg.body as Peer.Msg.All)"
                  :is-me="isMe(msg.headers.from)" />
                <Avatar v-if="isMe(msg.headers.from)" :uid="msg.headers.from" />
              </div>
            </template>
          </VList>
        </template>
      </ElAutoResizer>

    </RightClickMenu>
  </div>
  <DargFile ref="DargFileC" />
</template>
<style scoped lang="scss">
.page-change-button {
  @apply w-full h-10 flex justify-center items-center transition-colors bg-[--el-fill-color-extra-light] hover:bg-[--el-fill-color-light] active:bg-[--el-fill-color] text-[--el-color-primary-light-5] hover:text-[--el-color-primary-light-3] active:text-[--el-color-primary-dark-2] select-none;
}
</style>
<style lang='scss'>
body {
  overflow: hidden;
}
</style>