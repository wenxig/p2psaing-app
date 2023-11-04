<script setup lang='ts'>
import { useRoute } from 'vue-router';
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { Uploader } from '@/assets/uploadImg';
import { useAppStore, useUserStore } from '@/store';
import { storeToRefs } from 'pinia';
const route = useRoute()
const windowName = route.query.name as string
const db = window.useDatabase()
const can = ref<HTMLCanvasElement>()
const progressFlag = ref(false)
const isUploadErr = ref(false)
const appStoreValue = storeToRefs(useAppStore())
const userStoer = useUserStore()
const loadProgress = appStoreValue.loadProgress
const imageUrl = ref(userStoer.user.value.img)
const isEditName = ref(false)
window.ipcRenderer.invoke(`${windowName}_setSize`, {
  height: 500,
  width: 800
})
let reloadTimes = 0

const upload: UploadProps['beforeUpload'] = async (rawFile) => {
  isUploadErr.value = false
  reloadTimes = 0
  progressFlag.value = true;
  loadProgress.value = 0
  const uploader = new Uploader(can.value as HTMLCanvasElement)
  let value
  try {
    value = await uploader.titleImg(rawFile);
  } catch (err) {
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
const userName = ref(userStoer.user.value.name)
const isOnNameUpdate = ref(false)
const userRename = () => {
  if (userName.value == userStoer.user.value.name) {
    return
  }
  isOnNameUpdate.value = true
  userStoer.user.value.name = userName.value
  isOnNameUpdate.value = false
}
const resetName = () => {
  userName.value = userStoer.user.value.name
  return true
}

const showEditNameIcon = ref(false);
</script>

<template>
  <el-container>
    <el-header class="region-drag !bg-[var(--el-color-info-light-7)] flex justify-center items-center !text-xl"
      height="25px">
    </el-header>
    <el-main @click="resetName() && (isEditName = false)">
      <n-thing class="!relative">
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
          <n-collapse-transition :show="progressFlag">
            <el-progress :percentage="loadProgress"
              :status="isUploadErr ? 'exception' : loadProgress == 100 ? 'success' : ''"></el-progress>
          </n-collapse-transition>
        </template>
        <template #header>
          <transition name="el-fade-in-linear" :duration="150">
            <el-space v-if="!isEditName" class="!absolute" @mouseenter="showEditNameIcon = true"
              @mouseleave="showEditNameIcon = false">
              <el-text size="large">{{ userName }}</el-text>
              <transition name="el-fade-in-linear" :duration="100">
                <el-icon color="var(--el-color-info)" v-if="showEditNameIcon" size="large"
                  @click.stop="isEditName = true">
                  <i-ep-Edit></i-ep-Edit>
                </el-icon>
              </transition>
            </el-space>
          </transition>
          <transition name="el-fade-in-linear" :duration="150">
            <el-input @click.stop class="!absolute !w-60" type="text" v-model="userName" :disabled="isOnNameUpdate"
              v-if="isEditName">
              <template #suffix>
                <el-icon @click="resetName" class="cursor-pointer"><i-ep-Refresh /></el-icon>
                <el-icon @click="(userRename() as any) && (isEditName = false)" :disabled="isOnNameUpdate"
                  class="ml-1 cursor-pointer"><i-ep-Check /></el-icon>
              </template>
            </el-input>
          </transition>
        </template>
        <template #description>
          <el-text class="!relative !top-7 left-3" type="info">uid: {{ userStoer.user.value.uid }}</el-text>
        </template>
      </n-thing>
      <el-divider />
      <el-button @click="() => {
        db.clear()
        $ipc.invoke('app_quit')
      }
        " type="danger">退出登陆</el-button>
    </el-main>
    <canvas ref="can" class="hidden"></canvas>
    <control class="absolute top-0 left-0" :maxsize="false" :for="windowName">
    </control>
  </el-container>
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
