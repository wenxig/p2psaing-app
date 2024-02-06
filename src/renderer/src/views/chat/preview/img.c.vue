<script setup lang='ts'>
import { createSize } from '@/utils/element';

const TOPBAR_HEIGHT = 30;
const { height, width } = createSize(window.props as { width: number, height: number }, [screen.availWidth * 0.8, screen.availHeight * 0.9], true)
window.ipc.setResizable(true)
  .then(() => window.ipc.setSize(width, height + TOPBAR_HEIGHT))
  .then(() => window.ipc.setResizable(false))
  .then(() => window.ipc.toTop())

</script>

<template>
  <div class="w-full h-full overflow-hidden">
    <div class="w-full flex region-drag items-center" :style="{
      height: `${TOPBAR_HEIGHT}px`
    }">
      <Control :maxsize="false" />
    </div>
    <ElImage :src="$window.props.img" class="!w-full" />
  </div>
</template>