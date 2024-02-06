<script setup lang='ts'>
import lightLangs from '@/assets/lightLang.json';
const TOPBAR_HEIGHT = 30;
window.ipc.setResizable(true)
  .then(() => window.ipc.setSize(700, 500 + TOPBAR_HEIGHT))
  .then(() => window.ipc.toTop())
</script>

<template>
  <div class="w-full h-full overflow-hidden">
    <div class="w-full flex region-drag items-center" :style="{
      height: `${TOPBAR_HEIGHT}px`
    }">
      <Control :maxsize="false" />
      <ElText type="info">{{ lightLangs[$window.props.codeType].label }}</ElText>
    </div>
    <div class="w-full h-full overflow-auto p-2">
      <NCode :language="lightLangs[$window.props.codeType].label" :code="$window.props.code" show-line-numbers />
    </div>
  </div>
</template>