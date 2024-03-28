<script setup lang='ts'>
import db from '@/db';
import { ref, watch } from 'vue';
import { Sunny, Moon } from '@element-plus/icons-vue'
const setting = await db.app.getAllSetting('app')

const themeDark = ref(setting.theme ?? false)
window.ipc.reload('theme', !themeDark.value)
watch(themeDark, v => {
  window.ipc.reload('theme', !v)
  db.app.setSetting('theme', 'app', v)
})
</script>

<template>
  <label class="flex items-center">
    <el-text class="!mr-2">颜色模式</el-text>
    <ElSwitch v-model="themeDark" :active-icon="Moon" :inactive-icon="Sunny"></ElSwitch>
  </label>
</template>