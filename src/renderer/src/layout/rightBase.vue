<script setup lang='ts'>
</script>

<template>
  <n-container class=" w-[calc(100% - 3.75rem)] flex-none">
    <n-container class=" !shrink-0 w-[16.3rem] border-r-[1px] border-r-[--n-fill-color-darker] border-solid">
      <n-header class="  shrink-0 region-drag flex items-center">
        <slot name="aside-header" />
      </n-header>
      <n-main class=" shrink-0 !p-0 overflow-none">
        <slot name="aside-main" />
      </n-main>
    </n-container>
    <n-container class="w-full">
      <n-header class="region-drag w-full border-b border-[--n-fill-color-darker] flex items-center text-xl">
        <slot name="main-header" />
      </n-header>
      <n-main class="w-full !p-0">
        <slot />
      </n-main>
    </n-container>
  </n-container>
</template>