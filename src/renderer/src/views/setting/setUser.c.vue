<script setup lang='ts'>
import Header from './header.c.vue';
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import useUploader from '@h/useUploader';
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useAppStore, useUserStore } from '@s/index';

defineProps<{
  isEditName: boolean,
  resetName: () => void,
  userName: string
}>()
defineEmits<{
  'update:isEditName': [value: boolean]
  'update:userName': [value: string]
}>()


const appStoreValue = storeToRefs(useAppStore())
const userStoer = useUserStore()
const canves = ref<HTMLCanvasElement>()
const uploader = useUploader()
const progressFlag = ref(false)
const isUploadErr = ref(false)
const loadProgress = appStoreValue.loadProgress
const imageUrl = ref(userStoer.user.value.img)
let reloadTimes = 0

const upload: UploadProps['beforeUpload'] = async (rawFile) => {
  console.log('load');
  isUploadErr.value = false
  reloadTimes = 0
  progressFlag.value = true;
  loadProgress.value = 0
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
    <canvas class=" hidden" ref="canves" />
    <template #avatar>
      <el-upload class="avatar-uploader" accept="image/*" :before-upload="upload" action="https://example.com/"
        :progressFlag="false" :show-file-list="false">
        <n-spin :show="progressFlag">
          <el-image v-if="imageUrl" :src="imageUrl" class="avatar" fit="cover" @error="reload" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </n-spin>
      </el-upload>
      <n-collapse-transition :show="progressFlag" class=" w-[50%]">
        <el-progress class=" w-full" :percentage="loadProgress"
          :status="isUploadErr ? 'exception' : loadProgress == 100 ? 'success' : ''"></el-progress>
      </n-collapse-transition>
    </template>
    <template #header>
      <Header :is-edit-name="isEditName" @update:is-edit-name="val => $emit('update:isEditName', val)"
        :user-name="userName" @update:user-name="val => $emit('update:userName', val)" :resetName="resetName" />
    </template>
    <template #description>
      <el-text class="!relative !top-7 left-3" type="info">uid: {{ userStoer.user.value.uid }}</el-text>
    </template>
  </n-thing>
</template>

<style scoped lang="scss">
:deep(.avatar-uploader) {
  $size: 90px;

  .avatar {
    width: $size;
    height: $size;
    display: block;
  }

  .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .avatar-uploader-icon {
    font-size: calc($size / 6);
    color: #8c939d;
    width: $size;
    height: $size;
    text-align: center;
  }
}
</style>
