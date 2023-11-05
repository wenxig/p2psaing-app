<script setup lang='ts'>
import { useRoute } from 'vue-router';
import { ref } from 'vue'
import SetUser from './setUser.c.vue';
import { useUserStore } from '@s/index';
const route = useRoute()
const windowName = route.query.name as string
const userStoer = useUserStore()
const db = window.useDatabase(userStoer.user.value.id)
const isEditName = ref(false)
const ipc = window.ipcRenderer
const userName = ref(userStoer.user.value.name)

ipc.invoke(`${windowName}_setSize`, {
  height: 500,
  width: 800
})

function resetName() {
  userName.value = userStoer.user.value.name
  return true
}

</script>

<template>
  <el-container>
    <el-header class="region-drag !bg-[var(--el-color-info-light-7)] flex justify-center items-center !text-xl"
      height="25px">
    </el-header>
    <el-main @click="resetName() && (isEditName = false)">
      <SetUser v-model:is-edit-name="isEditName" v-model:user-name="userName" :resetName="resetName" />
      <el-divider />
      <el-button @click="() => {
        db.clear()
        $ipc.invoke('app_quit')
      }
        " type="danger">退出登陆</el-button>
    </el-main>
    <control class="absolute top-0 left-0" :maxsize="false" :for="windowName">
    </control>
  </el-container>
</template>

