<script setup lang='ts'>
import { MD5 } from 'crypto-js';
import { Picture } from '@element-plus/icons-vue'

defineProps<{
  value: Peer.Msg.All
  isMe: boolean
}>()
</script>

<template>
  <div v-if="value.type == 'text'" :class="isMe ? 'popMe' : 'popThey'" v-once
    class="max-w-[45%] inline-block rounded-md p-2 px-3 before:content-['']  before:w-2 before:h-2 before:block before:m-0 before:!absolute before:rotate-45 relative !break-all">
    <span v-for="text in value.main.split('\n')">
      {{ text ?? '\n' }}<br />
    </span>
  </div>
  <template v-if="value.type == 'img'" v-once>
    <el-image v-if="MD5(value.main).toString() == value.md5" :class="isMe ? 'popMe' : 'popThey'" fit="cover" class="rounded-md w-1/3" :src="value.main" @click="() => {
      $ipc.createChildWindow({ parents: $window.instance_name.my, url: '/main/chat/img/preview', windowChannel: 'preview' })
      $window.localStorage.setItem('preview', value.main)
    }"></el-image>
    <el-image v-else class="rounded-md">
      <template #error>
        <div class="image-slot">
          <el-icon>
            <Picture />
          </el-icon>
        </div>
      </template>
    </el-image>
  </template>
</template>

<style scoped lang='scss'>
@use 'sass:list';

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

$colors: (
  var(--el-color-primary-light-5),
  var(--el-color-primary-light-9)
);

.popMe {
  background-color: list.nth($colors, 1);

  &::before {
    background-color: list.nth($colors, 1);
  }

  @apply mr-2 before:right-0 before:translate-x-1/2;
}

.popThey {
  background-color: list.nth($colors, 2);

  &::before {
    background-color: list.nth($colors, 2);
  }

  @apply ml-2 before:left-0 before:-translate-x-1/2;
}
</style>