<script setup lang='ts'>
import { ref } from 'vue';
import { useUserStore } from '@s/user';
import { useAppStore } from '@s/appdata';
import { useEventListener } from '@vant/use';
import { storeToRefs } from 'pinia';
import { Edit, Refresh, Check } from '@element-plus/icons-vue'
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isOnNameUpdate = ref(false)
const showEditNameIcon = ref(false);
const { settingPage } = storeToRefs(useAppStore())
useEventListener('mousedown', ({ target }) => {
  const el = target! as HTMLElement
  if (el.id != 'p-name-eide-input' && el.id != 'p-name-eide-icon') settingPage.value.isEditName = false
}, { target: document.body })
function userRename() {
  if (settingPage.value.name == user.value.name) return
  isOnNameUpdate.value = true
  user.value.name = settingPage.value.name
  isOnNameUpdate.value = false
  userStore.$commit()
}
</script>

<template>
  <div class="mt-3">
    <transition name="el-fade-in-linear" :duration="150">
      <el-space v-if="!settingPage.isEditName" class="!absolute ml-2" @mouseenter="showEditNameIcon = true"
        @mouseleave="showEditNameIcon = false">
        <el-text size="large" @click.stop="settingPage.isEditName = true">{{ settingPage.name || user.name }}</el-text>
        <transition name="el-fade-in-linear" :duration="100">
          <el-icon color="var(--el-color-info)" v-if="showEditNameIcon" size="large"
            @click.stop="settingPage.isEditName = true">
            <Edit>
            </Edit>
          </el-icon>
        </transition>
      </el-space>
    </transition>
    <transition name="el-fade-in-linear" :duration="150">
      <el-input id="p-name-eide-input" type="text" class="!absolute !w-60" :model-value="settingPage.name || user.name"
        @update:model-value="val => settingPage.name = val" :disabled="isOnNameUpdate" v-if="settingPage.isEditName">
        <template #suffix>
          <el-icon @click="settingPage.name = user.name" id="p-name-eide-icon">
            <Refresh />
          </el-icon>
          <el-icon @click="(userRename() as any) && (settingPage.isEditName = false)" :disabled="isOnNameUpdate"
            class="ml-1 cursor-pointer">
            <Check />
          </el-icon>
        </template>
      </el-input>
    </transition>
  </div>
</template>