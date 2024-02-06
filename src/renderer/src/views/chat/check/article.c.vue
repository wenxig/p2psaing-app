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
window.ck_getData = (md) => emit('writeOk', md)
const componentSrc = ref(window.ipc.htmlServer().find(v => v.name == 'ck')!.url)
const reset = () => componentSrc.value = window.ipc.htmlServer().find(v => v.name == 'ck')!.url
</script>

<template>
  <el-dialog v-model="showArticleModel" fullscreen destroy-on-close @open="reset">
    <template #header="{ titleId, titleClass, close }">
      <div :id="titleId" :class="titleClass" class="flex items-center">
        <span class="font-bold text-xl mr-2">编写文章</span>
        <ElButton type="primary" @click="close() || (componentSrc = componentSrc + '#getData')"
          :disabled="componentSrc.includes('#getData')">确定</ElButton>
      </div>
    </template>
    <div class="w-full !h-full bg-white rounded-sm ">
      <iframe ref="ck" :src="componentSrc" frameborder="0" class="w-full h-full"></iframe>
    </div>
  </el-dialog>
</template>
<style scoped></style>