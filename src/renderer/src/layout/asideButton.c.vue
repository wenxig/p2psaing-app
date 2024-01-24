<script setup lang='ts'>
defineProps<{
  primary: boolean,
}>()
defineEmits<{
  click: [payload: MouseEvent]
}>()
</script>

<template>
  <button class="c !transition backdrop-opacity-5 bg-[unset] flex justify-center items-center rounded-md mt-5 !h-[2rem] !w-[2rem]"
    @click="(e) => !primary && $emit('click', e)">
    <el-icon size="1.5rem" class=" transition-colors icon" :color="!primary ? '#888' : 'var(--el-color-primary)'">
      <slot></slot>
    </el-icon>
  </button>
</template>
<style scoped lang='scss'>
.c:hover .icon {
  color: v-bind("!primary ? '#666' : 'var(--el-color-primary-light-3)'");
}


html {
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