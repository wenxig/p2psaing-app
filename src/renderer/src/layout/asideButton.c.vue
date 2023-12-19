<script setup lang='ts'>
import { ref } from 'vue';

const props = defineProps<{
  primary: boolean
}>()
const color = ref(!props.primary ? '#888' : 'var(--n-color-primary)')
const textColor = ref(!props.primary ? '#666' : 'var(--n-color-primary-light-3)')

</script>

<template>
  <button class="c !transition backdrop-opacity-5 flex justify-center items-center rounded-md mt-5 !h-[2rem] !w-[2rem]">
    <n-icon size="1.5rem" :color="color">
      <slot></slot>
    </n-icon>
  </button>
</template>
<style scoped lang='scss'>
.c:hover .n-icon {
  transition: color 150ms;
  color: v-bind("textColor");
}


html {
  .c {
    &:hover {
      background-color: var(--n-fill-color-light);
    }

    &:active {
      background-color: var(--n-fill-color) !important;
    }
  }

  &.dark {
    .c {
      &:hover {
        background-color: var(--n-fill-color);
      }

      &:active {
        background-color: var(--n-fill-color-light) !important;
      }
    }
  }
}
</style>