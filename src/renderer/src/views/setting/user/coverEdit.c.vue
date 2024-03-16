<script lang="ts" setup>
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { reactive } from 'vue';
import { Plus, Upload, Download, Minus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue';
import { useUserStore } from '@s/user';
import { type UploadFile, ElMessage } from 'element-plus';
import { useVModel, } from '@vueuse/core'
const props = defineProps<{
  modelValue: boolean,
  upload: (file: File) => Promise<boolean>
}>()
const emit = defineEmits(['update:modelValue'])
const modelProps = useVModel(props, 'modelValue', emit)
const userStore = useUserStore()
const option = reactive({
  boxStyle: {},
  base: {
    viewMode: 1,
    dragMode: 'move',
    aspectRatio: 1,
  },
  img: userStore.user.img || '',
  isReady: false
});
function uploadImg(file: UploadFile) {
  const reader = new FileReader()
  reader.readAsDataURL(<Blob>file.raw)
  reader.onload = (e) => {
    const data = <string>e.target?.result
    option.img = data
  }
}
const changeScale = (num: number = 1) => cropper?.zoom(num)
const rotate = (reg = 90) => cropper?.rotate(reg)
const updateImg = () => cropper?.getFile().then((data) => {
  props.upload(new File([data!], 'a.png')).then(() => ElMessage.success("上传成功!")).catch(() => ElMessage.error("上传错误!"))
  modelProps.value = false
})
function down() {
  const aLink = document.createElement('a')
  aLink.download = 'author-img'
  cropper?.getFile().then((data) => {
    aLink.href = window.URL.createObjectURL(data!)
    aLink.click()
  })
}
import userIconImgUrl from '@/assets/userIcon.png?url';
</script>
<template>
  <el-card>
    <ElSpace class="!w-full !h-2/3" direction="vertical">
      <NSpin :show="!option.isReady">
        <VuePictureCropper class="!w-[25vw] !h-[25vw]" :box-style="option.boxStyle" :img="option.img || userIconImgUrl"
          :options="option.base" @ready="option.isReady = true" />
      </NSpin>
      <div class="text-center px-5 py-1">
        <el-button :icon="Plus" circle @click="changeScale()"></el-button>
        <el-button :icon="Minus" circle @click="changeScale(-1)"></el-button>
        <el-button :icon="RefreshLeft" circle @click="rotate()"></el-button>
        <el-button :icon="RefreshRight" circle @click="rotate(-90)"></el-button>
        <el-button :icon="Download" circle @click="down()"></el-button>
      </div>
      <div class="flex h-auto">
        <el-upload :show-file-list="false" class="mr-1" :autoUpload="false" @change="uploadImg">
          <el-button type="primary" :icon="Plus">选择图片</el-button>
        </el-upload>
        <el-button type="success" :icon="Upload" :disabled="!option.img" @click="updateImg">上传头像</el-button>
      </div>
    </ElSpace>
  </el-card>
</template>

<style scoped lang='scss'>
:deep(.el-upload) {
  border-style: none !important;
}
</style>