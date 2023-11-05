<script setup lang='ts'>
import type { ElInput } from 'element-plus';
import { nextTick, ref } from 'vue';
const iconRotate = ref('0deg')
const searchData = ref('')
const AddUserCom = ref<typeof ElInput>()
function filteUsers(keyword: string, cb: any) {
  cb([keyword])
}

async function toAddUser() {
  iconRotate.value == '0deg' ? iconRotate.value = '-45deg' : iconRotate.value = '0deg'
  await nextTick()
  if (iconRotate.value != '0deg') {
    AddUserCom.value?.focus()
  }
}
</script>

<template>
  <el-autocomplete v-model="searchData" :fetch-suggestions="filteUsers" popper-class="autocomplete-pop region-no-drag"
    placeholder="uid/p2pid" class=" h-auto region-no-drag" clearable v-if="iconRotate == '0deg'">
    <template #prefix>
      <el-icon class="el-input__icon">
        <i-ep-Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      {{ item }}
    </template>
  </el-autocomplete>
  <ElInput placeholder="uid/p2pid" ref="AddUserCom" v-else></ElInput>
  <el-button class=" ml-2 !w-8 region-no-drag" @click="toAddUser()">
    <el-icon class="search-icon" :size="20">
      <i-ep-Plus></i-ep-Plus>
    </el-icon>
  </el-button>
</template>

<style scoped lang="scss">
.search-icon {
  * {
    transition: transform 300ms ease-in-out;
    transform: rotate(v-bind("iconRotate"));
  }
}
</style>