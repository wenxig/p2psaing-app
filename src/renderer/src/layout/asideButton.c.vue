<script setup lang='ts'>
import { ref } from 'vue';

const props = defineProps<{
  primary: boolean
}>()
const color = ref(!props.primary ? '#888' : 'var(--el-color-primary)')
const textColor = ref(!props.primary ? '#666' : 'var(--el-color-primary-light-3)')

</script>

<template>
  <button
    class="c !transition hover:!bg-gray-200 backdrop-opacity-5 flex justify-center items-center region-no-drag rounded-md mt-5 !h-[2rem] !w-[2rem] active:!bg-gray-300">
    <el-icon size="1.5rem" :color="color">
      <slot></slot>
    </el-icon>
  </button>
</template>
<style scoped lang='scss'>
.c:hover .el-icon {
  transition: color 150ms;
  color: v-bind("textColor");
}
</style>