<script lang="ts" setup>
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css'
import { reactive } from 'vue';
import { ref } from 'vue';
import { isEmpty } from 'lodash-es';
import { Plus, Upload, Minus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue';
import { useUserStore } from '@/store';
import type { UploadFile } from 'element-plus';
const userStore = useUserStore()
const cropper = ref<typeof VueCropper>()
const user_pic = ref("")
const previews = ref({
  div: {},
  url: "",
  img: {}
})
const option = reactive({
  img: isEmpty(userStore.user.value.img) ? '/userIcon.png' : userStore.user.value.img, // 裁剪图片的地址
  info: true, // 裁剪框的大小信息
  outputSize: 1, // 剪切后的图片质量（0.1-1）
  full: true, // 输出原图比例截图 props名full
  outputType: 'png', // 裁剪生成额图片的格式
  canMove: true, // 能否拖动图片
  original: false, // 上传图片是否显示原始宽高
  canMoveBox: true, // 能否拖动截图框
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 150,
  autoCropHeight: 150,
  fixedBox: true, // 截图框固定大小
  size: 300
});
function uploadImg(file: UploadFile) {
  const reader = new FileReader()
  // 转化为base64
  reader.readAsDataURL(<Blob>file.raw)
  // 转化为blob
  reader.onload = (e) => {
    const data = <string>e.target?.result
    user_pic.value = data // 显示上传图片按钮的标识
    option.img = data
  }
}

function realTime(data: typeof previews.value) {
  previews.value = data
}
function changeScale(num: number = 1) {
  num = num
  cropper.value.changeScale(num)
}
function rotateLeft() {
  cropper.value.rotateLeft()
}
function rotateRight() {
  cropper.value.rotateRight()
}
function updateImg() {
  user_pic.value
}
</script>
<template>
  <el-card class="w-2/3 relative">
    <ElSpace class="!w-full !h-2/3">
      <VueCropper ref="cropper" class="!w-[25vw] !h-[25vw]" :img="option.img" :outputSize="option.size"
        :outputType="option.outputType" :info="option.info" :full="option.full" :canMove="option.canMove"
        :canMoveBox="option.canMoveBox" :original="option.original" :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth" :autoCropHeight="option.autoCropHeight" :fixedBox="option.fixedBox"
        @realTime="realTime"></VueCropper>
      <div class=" w-[40%] h-full text-center px-5 py-7">
        <div :style="previews.div"
          class="w-1/4 h-1/2 rounded border border-gray-300 mt-0 mb-5 mx-auto overflow-hidden bg-gray-300">
          <img :src="previews.url" :style="previews.img" />
        </div>
        <br />
        <!-- 各种操作 -->
        <div>
          <el-button :icon="Plus" circle @click="changeScale(1)"></el-button>
          <el-button :icon="Minus" circle @click="changeScale(-1)"></el-button>
          <el-button :icon="RefreshLeft" circle @click="rotateLeft"></el-button>
          <el-button :icon="RefreshRight" circle @click="rotateRight"></el-button>
        </div>
      </div>
    </ElSpace>
    <!-- 下方按钮选择部分区域 -->
    <div class="bottom-[var(--el-card-padding)] flex h-auto absolute right-[var(--el-card-padding)]">
      <el-upload :show-file-list="false" class="mr-1" :autoUpload="false" @change="uploadImg">
        <el-button type="primary" :icon="Plus">选择图片</el-button>
      </el-upload>
      <el-button type="success" :icon="Upload" :disabled="user_pic === ''" @click="updateImg">上传头像</el-button>
    </div>
  </el-card>
</template>

<style scoped lang='scss'>
:deep(.el-upload) {
  border-style: none !important;
}
</style>