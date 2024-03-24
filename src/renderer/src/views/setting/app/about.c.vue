<script setup lang='ts'>
import { map } from 'lodash-es';

const versions = map(window.ipc.getVersion(), (v, k) => ({ value: v, key: k }))
</script>

<template>
  <el-text type="primary">使用包的版本:</el-text>
  <ul class="w-full pl-8">
    <li v-for="version of versions" class="flex">
      <el-text class="block">{{ version.key }}:</el-text>
      <el-text type="info" class="!ml-1 block">{{ version.value }}</el-text>
    </li>
  </ul>
</template>