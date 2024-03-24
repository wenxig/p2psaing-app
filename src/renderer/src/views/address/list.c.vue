<script setup lang='ts'>
import { getUserAddress, getUserAddAddress } from '@/db/network';
import { NVirtualList } from 'naive-ui';
import { useUserStore } from '@/store/user';
import { toNumber } from 'lodash-es';
import { shallowRef } from 'vue';
const { user } = useUserStore()
type ListUser = User.WebDbSave & { requset: boolean }
const getAllAddress = async () => ((await getUserAddress(user.uid)).chat || []).map(v => ({
  ...v,
  requset: false
}) as ListUser)
const allAddress = shallowRef(await getAllAddress())
const getAddUser = async () => ((await getUserAddAddress(user.uid)).chat || []).map(v => ({
  ...v,
  requset: true
}) as ListUser)
const addUser = shallowRef(await getAddUser())

window.ipc.onReload('address-list', (val) => {
  val = JSON.safetyParse(val)
  if (val?.['base-list']) allAddress.value = (<User.MsgSave>val['base-list']).chat.map(v => ({
    ...v,
    requset: false
  }) as ListUser)
  if (val?.['add-list']) addUser.value = (<User.MsgSave>val['add-list']).chat.map(v => ({
    ...v,
    requset: true
  }) as ListUser)
})

const heightOfItem = 60
</script>

<template>
  <ElAutoResizer>
    <template #default="{ height, width }">
      <n-virtual-list :style="{ 'maxHeight': `${height}px`, width: `${width}px` }" :item-size="heightOfItem"
        :items="[...addUser, ...allAddress]">
        <template #default="{ item }: { item: ListUser }">
          <div :style="{ height: `${heightOfItem}px` }"
            @click="item.requset ? $router.push(`/main/address/check/${item.uid}`) : $router.push(`/main/address/${item.uid}`)"
            class=" flex items-center relative border-t first:border-t-0 transition-colors p-2 px-3 !bg-[--el-bg-color] !break-all hover:!bg-[--el-fill-color-lighter] active:!bg-[--el-fill-color-darker] select-none"
            :class="[(toNumber($route.params.uid ?? 'NaN') == item.uid) && '!bg-[--el-fill-color-lighter]']">
            <div class="rounded-md w-[3rem] h-[3rem] flex justify-center items-center">
              <ElAvatar :src="item.img" :size="heightOfItem * 0.75" shape="square" />
            </div>
            <div class="ml-2 h-full max-w-[60%] overflow-hidden flex flex-col text-base font-bold mt-[-0.5rem]">
              <span class="h-1/2 text-lg font-normal">{{ item.name }}</span>
              <span class="h-1/2 text-[--el-color-info] font-normal mt-1 text-sm"></span>
            </div>
            <div v-if="item.requset"
              class="bg-[--el-color-primary-light-9] rounded-b-lg text-[12px] px-[5px] top-0 right-1 absolute">
              添加请求</div>
          </div>
        </template>
      </n-virtual-list>
    </template>
  </ElAutoResizer>
</template>