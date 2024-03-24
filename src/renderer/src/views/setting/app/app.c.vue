<script setup lang='ts'>
import db from '@/db';
import { ref, watch } from 'vue';

const setting = await db.app.getAllSetting('app')

const themeDark = ref(setting.theme ?? false)
window.ipc.reload('theme', !themeDark.value)
watch(themeDark, v => {
  window.ipc.reload('theme', !v)
  db.app.setSetting('theme', 'app', v)
})
</script>

<template>
  <ElSwitch v-model="themeDark"></ElSwitch>
</template>