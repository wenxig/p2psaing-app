<script setup lang='tsx'>
import { Picture, Document } from '@element-plus/icons-vue'
import { Code } from '@vicons/carbon';
import { defineComponent } from 'vue';
import { ElIcon,ElText } from 'element-plus';
import { getBase64ImageSize, getVideoFrameImage, getBase64VideoSize } from '@/utils/image';
import { KatexOptions } from 'katex';

const props = defineProps<{
  value: Peer.Msg.All
  isMe: boolean
  father: HTMLDivElement
}>()
type RightMenuPropsTotels = {
  'key': string;
  'label': string;
  'handleSelect': () => boolean | void
  'children'?: RightMenuPropsTotels;
}[]
defineEmits<{
  contextMenu: [event: MouseEvent, totel: RightMenuPropsTotels]
}>()
const MsgBlock = defineComponent<{ class: string }, ['click']>(({ class: c }, { slots, emit }) => () => (<>
  <div onClick={() => emit('click')} class={["w-[12rem] !h-[4.5rem] flex items-center transition-colors rounded-md p-2 px-3 !bg-[--el-bg-color] border !break-all hover:!bg-[--el-fill-color-lighter] active:!bg-[--el-fill-color-darker] select-none ml-2 mr-2", c]}>
    <div class="bg-[#DCDFE6] rounded-md w-[3rem] h-[3rem] flex justify-center items-center">
      <ElIcon color="#A8ABB2" size={30}>
        {slots.icon!()}
      </ElIcon>
    </div>
    <ElText class="!ml-2 !h-full !max-w-[60%] !overflow-hidden !flex !flex-col !font-bold">
      {slots.default!()}
    </ElText>
  </div >
</>), {
  emits: ['click'],
  props: ['class']
})
const videoImage = props.value.type == 'video' ? await getVideoFrameImage(props.value.main, props.father.scrollWidth * 0.45) : ''
const imageSize = props.value.type == 'img' ? await getBase64ImageSize(props.value.main) : {}
const videoSize = props.value.type == 'video' ? await getBase64VideoSize(props.value.main) : {}
function download(href: string, title: string) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('download', title);
  a.click();
  a.remove()
}

const options: KatexOptions = {
  fleqn: true,
  throwOnError: false,
  errorColor: 'var(--el-color-danger)',
}
</script>

<template>
  <div v-if="value.type == 'text'" v-once :class="isMe ? 'popMe' : 'popThey'" @click.right="(e: MouseEvent) => $emit('contextMenu', e, [{
    key: 'copy',
    label: '复制',
    handleSelect() {
      navigator.clipboard.writeText(props.value.main);
    }
  }])"
    class="max-w-[45%] inline-block rounded-md p-2 px-3 before:content-['']  before:w-2 before:h-2 before:block before:m-0 before:!absolute before:rotate-45 relative !break-all">
    <ElText size="large" v-for="text in value.main.split('\n')">
      {{ text ?? '\n' }}<br />
    </ElText>
  </div>
  <MsgBlock v-else-if="value.type == 'code'" v-once :class="isMe ? 'popMe' : 'popThey'"
    @click="$ipc.createChildWindow({ url: '/main/chat/code/preview', props: { codeType: value.is, code: value.main } })">
    <template #icon><Code /></template>
    代码块
  </MsgBlock>
  <el-image v-else-if="value.type == 'img'" class="rounded-md w-1/3 !bg-transparent" :class="isMe ? 'popMe' : 'popThey'"
    v-once fit="cover" :src="value.main" @click.right="(e: MouseEvent) => $emit('contextMenu', e, [{
    key: 'copy',
    label: '复制',
    handleSelect() {
      navigator.clipboard.writeText(props.value.main)
    }
  }])" @click="$ipc.createChildWindow({ url: '/main/chat/image/preview', props: { img: value.main, ...imageSize } })">
    <template #error>
      <div
        class="flex items-center justify-center w-full h-full bg-[--el-fill-color-light] text-[--el-text-color-secondary]">
        <el-icon :size="30">
          <Picture />
        </el-icon>
      </div>
    </template>
  </el-image>
  <img v-else-if="value.type == 'video'"
    @click="$ipc.createChildWindow({ url: '/main/chat/video/preview', props: { video: props.value.main, ...videoSize } })"
    class="rounded-md object-cover w-1/3 !bg-transparent select-none pointer-events-none" :src="videoImage"
    :class="isMe ? 'popMe' : 'popThey'" />
  <MsgBlock v-else-if="value.type == 'file'" v-once :class="isMe ? 'popMe' : 'popThey'"
    @click="() => download(props.value.main, (value as Peer.Msg.UserFileMsg).name!)">
    <template #icon><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1024 1024">
        <path
          d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z"
          fill="currentColor"></path>
      </svg>
    </template>
    {{ value.name! }}
  </MsgBlock>
  <MsgBlock v-else-if="value.type == 'article'" v-once :class="isMe ? 'popMe' : 'popThey'"
    @click="$ipc.createChildWindow({ url: '/main/chat/article/preview', props: { main: props.value.main } })">
    <template #icon>
      <Document />
    </template>
    文章
  </MsgBlock>
  <div v-if="value.type == 'equation'" v-once :class="isMe ? 'popMe' : 'popThey'"
    class="max-w-[45%] inline-block rounded-md p-2 px-3 before:content-['']  before:w-2 before:h-2 before:block before:m-0 before:!absolute before:rotate-45 relative !break-all">
    <NEquation :value="value.main" :katex-options="options" />
  </div>
</template>

<style scoped lang='scss'>
@use 'sass:list';

$colors: (
  var(--el-color-primary-light-5),
  var(--el-color-primary-light-9)
);

.popMe {
  background-color: list.nth($colors, 1);

  &::before {
    background-color: list.nth($colors, 1);
  }

  @apply mr-2 before:right-0 before:translate-x-1/2;
}

.popThey {
  background-color: list.nth($colors, 2);

  &::before {
    background-color: list.nth($colors, 2);
  }

  @apply ml-2 before:left-0 before:-translate-x-1/2;
}
</style>