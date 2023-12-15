<script setup lang='ts'>
</script>

<template>
  <el-container class=" w-[calc(100% - 3.75rem)] flex-none">
    <el-container class=" !shrink-0 w-[16.3rem] border-r-[1px] border-r-[--el-fill-color-darker] border-solid">
      <el-header class="  shrink-0 region-drag flex items-center">
        <slot name="aside-header" />
      </el-header>
      <el-main class=" shrink-0 !p-0 overflow-none">
        <slot name="aside-main" />
      </el-main>
    </el-container>
    <el-container class="w-full">
      <el-header class="region-drag w-full border-b border-[--el-fill-color-darker] flex items-center text-xl">
        <slot name="main-header" />
      </el-header>
      <el-main class="w-full">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>