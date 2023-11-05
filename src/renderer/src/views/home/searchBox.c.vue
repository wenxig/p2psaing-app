<script setup lang='ts'>
// import { reactive, onMounted, ref } from 'vue';
// import UserTag from './userTag.c.vue';
// import ShowSearchResult from './searchResult.c.vue';
// import { isEmpty } from 'lodash-es';
// import { useLinkUser } from '@h/useLinkUser';
// const linker = useLinkUser()

</script>

<template>
  <el-autocomplete popper-class="autocomplete-pop region-no-drag" placeholder="搜索" class=" h-auto region-no-drag"
    clearable>
    <template #prefix>
      <el-icon class="el-input__icon">
        <i-ep-Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
      <!-- <span class="link">{{ item.link }}</span> -->
    </template>
  </el-autocomplete>
  <el-button class=" ml-2 !w-8 region-no-drag">
    <el-icon>
      <i-ep-Plus></i-ep-Plus>
    </el-icon>
  </el-button>
</template>

<style scoped>
.autocomplete-pop li {
  line-height: normal;
  padding: 7px;
}

.autocomplete-pop li .name {
  text-overflow: ellipsis;
  overflow: hidden;
}

.autocomplete-pop li .addr {
  font-size: 12px;
  color: #b4b4b4;
}

.autocomplete-pop li .highlighted .addr {
  color: #ddd;
}

:global(.el-dialog__body) {
  padding-top: 10px !important;
  height: 100%;
}

:global(.el-dialog__header) {
  display: none !important;
}
</style>