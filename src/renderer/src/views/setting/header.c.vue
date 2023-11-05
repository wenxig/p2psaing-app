<script setup lang='ts'>
import { ref } from 'vue';
import { useUserStore } from '@s/index';
const userStoer = useUserStore()
const isOnNameUpdate = ref(false)
const showEditNameIcon = ref(false);
const props = defineProps<{
  isEditName: boolean,
  resetName: () => void,
  userName: string
}>()
defineEmits<{
  'update:isEditName': [value: boolean]
  'update:userName': [value: string]
}>()

function userRename() {
  if (props.userName == userStoer.user.value.name) {
    return
  }
  isOnNameUpdate.value = true
  userStoer.user.value.name = props.userName
  isOnNameUpdate.value = false
}
</script>

<template>
  <transition name="el-fade-in-linear" :duration="150">
    <el-space v-if="!isEditName" class="!absolute" @mouseenter="showEditNameIcon = true"
      @mouseleave="showEditNameIcon = false">
      <el-text size="large">{{ userName }}</el-text>
      <transition name="el-fade-in-linear" :duration="100">
        <el-icon color="var(--el-color-info)" v-if="showEditNameIcon" size="large"
          @click.stop="$emit('update:isEditName', true)">
          <i-ep-Edit></i-ep-Edit>
        </el-icon>
      </transition>
    </el-space>
  </transition>
  <transition name="el-fade-in-linear" :duration="150">
    <el-input @click.stop class="!absolute !w-60" type="text" :model-value="userName"
      @update:model-value="val => $emit('update:userName', val)" :disabled="isOnNameUpdate" v-if="isEditName">
      <template #suffix>
        <el-icon @click="resetName" class="cursor-pointer"><i-ep-Refresh /></el-icon>
        <el-icon @click="(userRename() as any) && ($emit('update:isEditName', false))" :disabled="isOnNameUpdate"
          class="ml-1 cursor-pointer"><i-ep-Check /></el-icon>
      </template>
    </el-input>
  </transition>
</template>