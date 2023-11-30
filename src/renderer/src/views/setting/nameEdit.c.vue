<script setup lang='ts'>
import { ref } from 'vue';
import { useUserStore, useAppStore } from '@s/index';
const userStoer = useUserStore()
const isOnNameUpdate = ref(false)
const showEditNameIcon = ref(false);
const appStore = useAppStore()
function userRename() {
  if (appStore.settingPage.name == userStoer.user.value.name) {
    return
  }
  isOnNameUpdate.value = true
  userStoer.user.value.name = appStore.settingPage.name
  isOnNameUpdate.value = false
  userStoer.update()
}
</script>

<template>
  <div class="mt-3">
    <transition name="el-fade-in-linear" :duration="150">
      <el-space v-if="!appStore.settingPage.isEditName" class="!absolute ml-2" @mouseenter="showEditNameIcon = true"
        @mouseleave="showEditNameIcon = false">
        <el-text size="large">{{ appStore.settingPage.name || userStoer.user.value.name }}</el-text>
        <transition name="el-fade-in-linear" :duration="100">
          <el-icon color="var(--el-color-info)" v-if="showEditNameIcon" size="large"
            @click.stop="appStore.settingPage.isEditName = true">
            <i-ep-Edit></i-ep-Edit>
          </el-icon>
        </transition>
      </el-space>
    </transition>
    <transition name="el-fade-in-linear" :duration="150">
      <el-input @click.stop class="!absolute !w-60" type="text" :model-value="appStore.settingPage.name"
        @update:model-value="val => appStore.settingPage.name = val" :disabled="isOnNameUpdate"
        v-if="appStore.settingPage.isEditName">
        <template #suffix>
          <el-icon @click="appStore.settingPage.name = userStoer.user.value.name"><i-ep-Refresh /></el-icon>
          <el-icon @click="(userRename() as any) && (appStore.settingPage.isEditName = false)" :disabled="isOnNameUpdate"
            class="ml-1 cursor-pointer"><i-ep-Check /></el-icon>
        </template>
      </el-input>
    </transition>
  </div>
</template>