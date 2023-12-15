<script setup lang='ts'>
import { ref } from 'vue';
import { useUserStore } from '@s/user';
import { useAppStore } from '@s/appdata';
import { useEventListener } from '@vant/use';
import { Edit, Refresh, Check } from '@element-plus/icons-vue'
const userStoer = useUserStore()
const isOnNameUpdate = ref(false)
const showEditNameIcon = ref(false);
const appStore = useAppStore()
useEventListener('mousedown', () => {
  appStore.settingPage.isEditName = false
}, { target: document.body })
function userRename() {
  if (appStore.settingPage.name == userStoer.user.name) {
    return
  }
  isOnNameUpdate.value = true
  userStoer.user.name = appStore.settingPage.name
  isOnNameUpdate.value = false
  userStoer.commit()
}
</script>

<template>
  <div class="mt-3">
    <transition name="el-fade-in-linear" :duration="150">
      <el-space v-if="!appStore.settingPage.isEditName" class="!absolute ml-2" @mouseenter="showEditNameIcon = true"
        @mouseleave="showEditNameIcon = false">
        <el-text size="large">{{ appStore.settingPage.name || userStoer.user.name }}</el-text>
        <transition name="el-fade-in-linear" :duration="100">
          <el-icon color="var(--el-color-info)" v-if="showEditNameIcon" size="large"
            @click.stop="appStore.settingPage.isEditName = true">
            <Edit>
            </Edit>
          </el-icon>
        </transition>
      </el-space>
    </transition>
    <transition name="el-fade-in-linear" :duration="150">
      <el-input @click.stop type="text" class="absolute w-60"
        :model-value="appStore.settingPage.name || userStoer.user.name"
        @update:model-value="val => appStore.settingPage.name = val" :disabled="isOnNameUpdate"
        v-if="appStore.settingPage.isEditName">
        <template #suffix>
          <el-icon @click="appStore.settingPage.name = userStoer.user.name">
            <Refresh />
          </el-icon>
          <el-icon @click="(userRename() as any) && (appStore.settingPage.isEditName = false)" :disabled="isOnNameUpdate"
            class="ml-1 cursor-pointer">
            <Check />
          </el-icon>
        </template>
      </el-input>
    </transition>
  </div>
</template>