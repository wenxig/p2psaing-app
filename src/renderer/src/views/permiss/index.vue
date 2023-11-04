<script setup lang='ts'>
let nameArr = ["烟绯", "yanfei"]

</script>

<template>
  <el-container class="h-full region-drag">
    <control class="fixed top-0 left-0"
      :for="($route.query.name as string).startsWith('/') ? ($route.query.name as string).substring(1) : ($route.query.name as string)">
    </control>
    <el-header height="50px" class="flex justify-center items-center mt-4">
      <p class="!text-xl">《用户许可》</p>
    </el-header>
    <el-main class="!pt-0">
      <p>
        1. 用户账号归属权属于开发者，只是提供给用户使用，用户没有对账号的处分权
      </p>
      <p>
        2. 用户数据为本地与云端均存储，但云端不会存储用户的聊天数据
      </p>
      <p>
        3. 用户名中不得出现"{{ nameArr[0] }}","{{ nameArr[1] }}"等字眼
      </p>
    </el-main>
  </el-container>
</template>

<style scoped lang='scss'>
p {
  margin-bottom: 1rem;
  font-size: 14px;
}
</style>