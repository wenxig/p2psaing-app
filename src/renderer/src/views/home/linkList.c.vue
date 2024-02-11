<template>
  <el-auto-resizer>
    <template #default="{ height }">
      <n-virtual-list :style="{ 'maxHeight': `${height}px` }" :item-size="60" :items="allConnects ?? []">
        <template #default="{ item }: { item: Connection }">
          <div :style="{ height: '60px' }"
            class=" flex items-center transition-colors p-2 px-3 !bg-[--el-bg-color] !break-all hover:!bg-[--el-fill-color-lighter] active:!bg-[--el-fill-color-darker] select-none"
            :class="[(toNumber($route.params.uid ?? 'NaN') == item.users[1]?.uid) && '!bg-[--el-fill-color-lighter]']">
            <div class="rounded-md w-[3rem] h-[3rem] flex justify-center items-center">
              <ElAvatar :src="item.users[1]?.img" :size="45" shape="square" />
            </div>
            <div class="ml-2 h-full max-w-[60%] overflow-hidden flex flex-col text-base font-bold mt-[-0.5rem]">
              <span class="h-1/2 text-lg font-normal">{{ item.users[1]?.name }}</span>
              <span class="h-1/2 text-[--el-color-info] font-normal mt-1 text-sm">{{ getPreviewMsg(item.users[1]?.uid) }}</span>
            </div>
          </div>
        </template>
      </n-virtual-list>
    </template>
  </el-auto-resizer>
</template>

<script lang="tsx" setup>
import { Connection } from '@/api';
import { useAppStore } from '@/store/appdata';
import { find, last, toNumber } from 'lodash-es';
import { storeToRefs } from 'pinia';
const { allConnects, allConnectsMsgs } = storeToRefs(useAppStore())
function getPreviewMsg(uid: number): string {
  const value = find(allConnectsMsgs.value, { uid })
  if (!value) return ''
  const msg = last(value.msg)
  if (!msg) return ''
  switch (msg.body.type) {
    case 'img': return '[图片]'
    case 'text': return msg.body.main
    case 'file': return '[文件]'
    case 'video': return '[视频]'
    case 'article': return '[文章]'
    case 'appFunction': return '[应用函数]'
    case 'code': return '[代码]'
    case 'equation': return '[公式]'
    default: return ''
  }
}
</script>