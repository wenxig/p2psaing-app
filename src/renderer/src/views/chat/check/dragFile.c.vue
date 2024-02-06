<script setup lang='tsx'>
import { ElIcon, ElMessageBox } from 'element-plus';
import { FunctionalComponent, ref } from 'vue'
import { Picture, VideoPlay, Document } from '@element-plus/icons-vue'
import { remove } from 'lodash-es';
import { useSender } from "@p/chat/inject";
import { inject } from 'vue';
const showUploadModel = ref(false)
const data = ref<[data: string, type: string, name: string][]>([])
defineExpose({
  async open(datas: Promise<[data: string, type: string, name: string][]>) {
    showUploadModel.value = true
    data.value = await datas
  },
  close() {
    showUploadModel.value = false
    data.value = []
  }
})
const sender = inject(useSender)!
const Icon: FunctionalComponent<{ type: string, name: string }> = ({ type, name }) => {
  const icon = (() => {
    if (type.includes('image/')) {
      return <Picture />
    } else if (type.includes('video/')) {
      return <VideoPlay />
    } else if (type == '' && name.endsWith('.md')) {
      return <Document />
    } else {
      return (<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024">
        <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z" fill="currentColor"></path>
      </svg>)
    }
  })()
  return (
    <div class="bg-[#DCDFE6] rounded-md w-[3rem] h-[3rem] flex justify-center items-center select-none !break-all">
      <ElIcon size={30}>
        {icon}
      </ElIcon>
    </div>
  )
}
const listShow = ref(true)
function send() {
  for (const [dataUrl, type, name] of data.value) {
    if (type.includes('image/')) {
      sender('image', dataUrl)
    } else if (type.includes('video/')) {
      sender('video', dataUrl)
    } else if (type == '' && name.endsWith('.md')) {
      sender('article', dataUrl)
    } else {
      sender('file', dataUrl, name)
    }
  }
  showUploadModel.value = false
  data.value = []
}
</script>

<template>
  <NModal v-model:show="showUploadModel" @close="data = []">
    <div class="w-[50vh] !h-[60vh] bg-[--el-bg-color] rounded-sm p-2">
      <div class="h-10 p-3 w-full font-extrabold text-lg flex items-center relative">
        检查发送内容
        <el-button @click="send" type="primary" class="absolute right-1">确定</el-button>
      </div>
      <n-virtual-list v-if="listShow" class="w-full" :item-size="80" :items="data"
        :style="{ height: 'calc(100% - 2.5rem)' }">
        <template #default="{ item: row }">
          <div
            class="h-20 !bg-[--el-bg-color] hover:!bg-[--el-fill-color-lighter] select-none transition-colors border-t border-[--el-border-color-lighter] w-full flex items-center">
            <Icon :type="row[1]" :name="row[2]" />
            <div class="ml-2 h-full max-w-[80%] overflow-hidden" @click="ElMessageBox.confirm('你确定删除它吗?', '警告', {
              confirmButtonText: '是的',
              cancelButtonText: '取消',
              type: 'error',
            }).catch(() => { }).then(() => remove(data!, v => v[1] == row[1])).then(() => {
              if (!data.length) showUploadModel = false
              listShow = false
              $nextTick(() => listShow = true)
            })">
              <n-performant-ellipsis :line-clamp="Infinity"
                class="h-full w-full overflow-hidden pt-2 text-base break-all font-bold">
                {{ row[2] }}
              </n-performant-ellipsis>
            </div>
          </div>
        </template>
      </n-virtual-list>
    </div>
  </NModal>
</template>