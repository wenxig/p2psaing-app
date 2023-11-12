<script setup lang='ts'>
import { type ElAutocomplete, type AutocompleteFetchSuggestionsCallback, ElLoading } from 'element-plus';
import { nextTick, ref } from 'vue';
const api = window.useServer()
const emit = defineEmits<{
  'select': [value: any]
}>()
const iconRotate = ref('0deg')
const filteData = ref('')
const searchData = ref('')
const AddUserCom = ref<typeof ElAutocomplete>()
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

function getLisetData(keyword: string, cb: AutocompleteFetchSuggestionsCallback) {
  cb([{
    data: keyword,
    text: `搜素用户: `,
    async method(data: string) {
      const loading = ElLoading.service({
        text: '查询数据中...'
      })
      const result = await api.do({
        action: 'get',
        tag: data
      })
      loading.close()
      emit('select', result)
    }
  }, {
    data: keyword,
    text: `搜索群: `,
    async method(data: string) {
      const loading = ElLoading.service({
        text: '查询数据中...'
      })
      const result = await api.do({
        action: 'get',
        tag: data
      })
      loading.close()
      emit('select', result)
    }
  }])
}
</script>

<template>
  <el-input v-model="filteData" :fetch-suggestions="filteUsers" placeholder="uid/p2pid" class=" h-auto region-no-drag"
    clearable v-if="iconRotate == '0deg'">
  </el-input>
  <el-autocomplete ref="AddUserCom" @select="item => item.method(item.data)" v-model="searchData"
    :fetch-suggestions="getLisetData" popper-class="autocomplete region-no-drag" placeholder="uid/p2pid"
    class=" h-auto region-no-drag" clearable v-else>
    <template #prefix>
      <el-icon class="el-input__icon">
        <i-ep-Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div>{{ item.text }} {{ item.data }}</div>
    </template>
  </el-autocomplete>
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

.autocomplete {
  li {
    line-height: normal;
    padding: 7px;

    .addr {
      font-size: 12px;
      color: #b4b4b4;
    }

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .highlighted .addr {
      color: #ddd;
    }
  }
}
</style>