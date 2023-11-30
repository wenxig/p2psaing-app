<script setup lang='ts'>
import NameEdit from './nameEdit.c.vue';
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import useUploader from '@h/useUploader';
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useAppStore, useUserStore } from '@s/index';
import CoverEdit from './coverEdit.c.vue';
const appStoreValue = storeToRefs(useAppStore())
const userStoer = useUserStore()
const uploader = useUploader()
const progressFlag = ref(false)
const isUploadErr = ref(false)
const imageUrl = ref(userStoer.user.value.img)
const showSetUserImage = ref(false)
let reloadTimes = 0
const upload: UploadProps['beforeUpload'] = async (rawFile) => {
  isUploadErr.value = false
  reloadTimes = 0
  progressFlag.value = true;
  appStoreValue.settingPage.value.loadProgress = 0
  let value
  try {
    value = await uploader.titleImg(rawFile);
  } catch (err) {
    console.error(err);
    isUploadErr.value = true
    throw false
  }
  imageUrl.value = value[0]
  progressFlag.value = false
  return true
}
const reload = () => {
  if (reloadTimes == 3) {
    throw false;
  }
  imageUrl.value = imageUrl.value += '?r=0'
  reloadTimes++
}


</script>

<template>
  <n-thing class="!relative">
    <template #avatar>
      <el-upload accept="image/*" :before-upload="upload" action="https://example.com/" :progressFlag="false"
        :show-file-list="false" @click.prevent.stop.capture="showSetUserImage = true">
        <n-spin :show="progressFlag">
          <el-image v-if="imageUrl" :src="imageUrl" class="!w-[90px] !h-[90px] block;" fit="cover" @error="reload" />
          <el-icon v-else size="30" class=" text-[#8c939d] !w-[90px] !h-[90px] text-center;">
            <Plus />
          </el-icon>
        </n-spin>
      </el-upload>
      <n-collapse-transition :show="progressFlag" class=" w-[50%]">
        <el-progress class=" w-full" :percentage="appStoreValue.settingPage.value.loadProgress"
          :status="isUploadErr ? 'exception' : appStoreValue.settingPage.value.loadProgress == 100 ? 'success' : ''"></el-progress>
      </n-collapse-transition>
    </template>
    <template #header>
      <NameEdit />
    </template>
    <template #description>
      <el-text class="!relative !top-7 left-3" type="info">uid: {{ userStoer.user.value.uid }}</el-text>
    </template>
  </n-thing>
  <n-modal v-model:show="showSetUserImage" overlay-style="">
    <CoverEdit />
  </n-modal>
</template>

<style scoped lang="scss">
:deep(.el-upload) {
  @apply border border-[color:var(--el-border-color)] cursor-pointer relative overflow-hidden transition-[var(--el-transition-duration-fast)] rounded-md border-dashed hover:border-[color:var(--el-color-primary)];
}
</style>
