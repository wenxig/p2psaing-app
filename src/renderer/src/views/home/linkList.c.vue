<script lang="ts" setup>
import { getUserAddress } from '@/db/network';
import { useAppStore } from '@/store/appdata';
import { useUserStore } from '@/store/user';
import { find, last, toNumber } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { shallowRef } from 'vue';
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const { allConnects, allConnectsMsgs, peer } = storeToRefs(useAppStore())
const { user } = useUserStore()
const router = useRouter()
const allUsers = shallowRef([...(allConnects.value ?? []).map(v => ({ mode: 'temp', value: v } as const)), ...(await getUserAddress(user.uid)).chat.map(v => ({ mode: 'forever', value: v } as const))])
window.ipc.onReload('address-list', val => {
  console.log('base-list', val)
  val = JSON.safetyParse(val)
  if (val?.['base-list']) allUsers.value = [...(allConnects.value ?? []).map(v => ({ mode: 'temp', value: v } as const)), ...(val.chat ?? []).map(v => ({ mode: 'forever', value: v } as const))]
})
function goto(item: (typeof allUsers)['value'][number]) {
  const user = item.mode == 'temp' ? item.value.users[1]! : item.value
  peer.value!.connect(user.lid, item.mode).then(() => {
    ElMessage.success('成功')
    router.replace(`/main/chat/${item.mode}/${user.uid}`)
  }).catch(() => {
    ElMessage.error('无法连接1')
  })
}
function getPreviewMsg(uid: number): string {
  const value = find(allConnectsMsgs.value, { uid })
  if (!value) return ''
  const msg = last(value.msg)
  if (!msg) return ''
  switch (msg.body.type) {
    case 'img': return `[图片] ${msg.body.name}`
    case 'text': return msg.body.main
    case 'file': return `[文件] ${msg.body.name}`
    case 'video': return `[视频] ${msg.body.name}`
    case 'article': return '[文章]'
    case 'appFunction': return '[应用函数]'
    case 'code': return '[代码]'
    case 'equation': return '[公式]'
    default: return ''
  }
}

</script>

<template>
  <el-auto-resizer>
    <template #default="{ height }">
      <n-virtual-list :style="{ 'maxHeight': `${height}px` }" :item-size="60" :items="allUsers">
        <template #default="{ item }: { item: (typeof allUsers)['value'][number] }">
          <button :style="{ height: '60px' }" @click="goto(item)"
            :disabled="toNumber($route.params.uid ?? 'NaN') == (item.mode == 'temp' ? item.value.users[1]?.uid : item.value.uid)"
            class="w-full flex items-center transition-colors p-2 px-3 !bg-[--el-bg-color] !break-all hover:!bg-[--el-fill-color-lighter] active:!bg-[--el-fill-color-darker] select-none"
            :class="[(toNumber($route.params.uid ?? 'NaN') == (item.mode == 'temp' ? item.value.users[1]?.uid : item.value.uid)) && '!bg-[--el-fill-color-lighter]']">
            <div class="rounded-md w-[3rem] h-[3rem] flex justify-center items-center">
              <ElAvatar :src="item.mode == 'temp' ? item.value.users[1]?.img : item.value.img" :size="45"
                shape="square" />
            </div>
            <div class="ml-2 h-full max-w-[60%] overflow-hidden flex flex-col text-base font-bold mt-[-0.5rem]">
              <el-text size="large"
                class="h-1/2 font-normal">{{ item.mode == 'temp' ? item.value.users[1]?.name : item.value.name }}</el-text>
              <el-text size="small"
                class="h-1/2 text-[--el-color-info] font-normal mt-1">{{ getPreviewMsg(item.mode == 'temp' ? item.value.users[1]?.uid : item.value.uid) }}</el-text>
            </div>
            <el-text class="!bg-[--el-color-primary-light-9] !rounded-b-lg !px-[5px] top-0 right-1 !absolute"
              v-if="item.mode == 'temp'" size="small">
              临时连接</el-text>
          </button>
        </template>
      </n-virtual-list>
    </template>
  </el-auto-resizer>
</template>