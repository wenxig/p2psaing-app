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
    class="c !transition backdrop-opacity-5 flex justify-center items-center rounded-md mt-5 !h-[2rem] !w-[2rem]">
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


html {
  .c {
    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:active {
      background-color: var(--el-fill-color) !important;
    }
  }

  &.dark {
    .c {
      &:hover {
        background-color: var(--el-fill-color);
      }

      &:active {
        background-color: var(--el-fill-color-light) !important;
      }
    }
  }
}
</style>