<script setup lang='tsx'>
import { Plus, Search } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
const showMenu = ref(false)
const faseLink = reactive({
  show: false,
  data: ""
})
</script>

<template>
  <el-autocomplete popper-class="autocomplete-pop" placeholder="搜索" class=" h-auto" clearable>
    <template #prefix>
      <el-icon class="el-input__icon">
        <Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
      <!-- <span class="link">{{ item.link }}</span> -->
    </template>
  </el-autocomplete>
  <el-popover :visible="showMenu" placement="bottom" :width="200" trigger="click">
    <template #reference>
      <el-button class=" ml-2 !w-8" @click="showMenu = !showMenu">
        <el-icon>
          <Plus></Plus>
        </el-icon>
      </el-button>
    </template>
    <template #default>
      <div class="w-full h-4" @click="(showMenu = false) || (faseLink.show = true)">发起快速连接</div>
      <ElDivider></ElDivider>
    </template>
  </el-popover>
  <n-modal v-model:show="faseLink.show">
    <ElInput placeholder="uid/email" v-model="faseLink.data"></ElInput>
    <ElButton>确定</ElButton>
  </n-modal>
</template>

<style scoped lang="scss">
.autocomplete-pop {
  li {
    line-height: normal;
    padding: 7px;
    color: #ddd;

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .addr {
      font-size: 12px;
      color: #b4b4b4;
    }

    .highlighted .addr {
      color: #ddd;
    }
  }
}

:global(.el-dialog__body) {
  padding-top: 10px !important;
  height: 100%;
}
</style>