<script setup lang='ts'>
import { ref } from 'vue'
const showArticleModel = ref(false)
defineExpose({
  open() {
    showArticleModel.value = true
  },
  close() {
    showArticleModel.value = false
  }
})
const emit = defineEmits<{
  writeOk: [value: string]
}>()
const ck = ref<HTMLIFrameElement>()
const componentSrc = ref(window.ipc.getHttpComponents().find(v => v.name == 'ck')!.url)
let preview = false
window.ck_getData = (md) => preview ? (() => {
  console.log('perview')
  window.ipc.createChildWindow({ url: '/main/chat/article/preview', props: { main: md } })
  preview = false
  componentSrc.value = componentSrc.value.replaceAll('#getData', '')
})() : emit('writeOk', md)
const reset = () => componentSrc.value = window.ipc.getHttpComponents().find(v => v.name == 'ck')!.url

const load = () => {
  const doc = ck.value!.contentWindow!.document
  const styleTag = doc.createElement('style')
  doc.head.append(styleTag)
  const loadCSS = () => {
    const color = getComputedStyle(document.body).getPropertyValue('--el-bg-color').trim()
    styleTag.innerHTML = `
      html, body {
        background-color: ${color};
      }
    `
  }
  loadCSS()
  window.ipc.onReload('theme', loadCSS)
}
</script>

<template>
  <el-dialog v-model="showArticleModel" fullscreen destroy-on-close @open="reset">
    <template #header="{ titleId, titleClass, close }">
      <div :id="titleId" :class="titleClass" class="flex items-center">
        <span class="font-bold text-xl mr-2">编写文章</span>
        <el-tooltip class="box-item" effect="dark" content="编辑时样式和展示时样式有很大不同，请务必先预览已确认样式正确" placement="bottom-start">
          <ElButton type="primary" @click="close() || (componentSrc = componentSrc + '#getData')"
            :disabled="componentSrc.includes('#getData')">确定</ElButton>
        </el-tooltip>
        <ElButton @click="(preview = true) || (componentSrc = componentSrc + '#getData')">预览</ElButton>
      </div>
    </template>
    <div class="w-full !h-full bg-[--el-bg-color] rounded-sm ">
      <iframe ref="ck" :src="componentSrc" frameborder="0" class="w-full h-full" @load="load"></iframe>
    </div>
  </el-dialog>
</template>
<style scoped></style>