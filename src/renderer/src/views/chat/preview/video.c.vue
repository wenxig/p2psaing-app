<script setup lang='ts'>
import "vue3-video-play/dist/style.css";
import { videoPlay as VideoPlay } from "vue3-video-play";
import { reactive } from 'vue';
import { createSize } from '@/utils/element';
import { Download } from '@element-plus/icons-vue'


const TOPBAR_HEIGHT = 30;
const { height, width } = createSize(window.props as { width: number, height: number }, [screen.availWidth * 0.8, screen.availHeight * 0.9], true)

const options = reactive({
  width: `${width}px`, //播放器高度
  height: `${height}px`, //播放器高度
  color: "var(--el-color-primary)", //主题色
  title: "视频预览", //视频名称
  src: window.props.video, //视频源
  muted: false, //静音
  webFullScreen: false,
  speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
  autoPlay: false, //自动播放
  loop: false, //循环播放
  mirror: false, //镜像画面
  ligthOff: false, //关灯模式
  volume: 0.5, //默认音量大小
  control: true, //是否显示控制
  controlBtns: [
    "audioTrack",
    "speedRate",
    "volume",
    "setting",
    "fullScreen",
  ], //显示所有按钮,
})
window.ipc.setResizable(true)
window.ipc.setSize({ width, height: height + TOPBAR_HEIGHT })
window.ipc.toTop()
function download(href: string, title: string) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('download', title);
  a.click();
  a.remove()
}
</script>

<template>
  <div class="w-full h-full overflow-hidden select-none">
    <div class="w-full flex region-drag items-center bg-gray-300" :style="{
      height: `${TOPBAR_HEIGHT}px`
    }">
      <Control :maxsize="false" />
      <n-button text class="region-no-drag">
        <template #icon>
          <n-icon :size="25" @click="download($window.props.video, 'video.mp4')">
            <Download />
          </n-icon>
        </template>
      </n-button>
    </div>
    <VideoPlay v-bind="options" :playsinline="true" />
  </div>
</template>