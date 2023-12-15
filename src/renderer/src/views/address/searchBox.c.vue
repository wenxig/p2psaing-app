<script setup lang='ts'>
import { type ElAutocomplete, type AutocompleteFetchSuggestionsCallback, ElLoading } from 'element-plus';
import { nextTick, ref } from 'vue';
import * as api from '@/db/network';
import { Plus } from '@element-plus/icons-vue'
import router from '@/router';
const emit = defineEmits<{
  'select': [value: [undefined, false] | [User.WebDbSaveDeep, true]]
}>()
const iconRotate = ref('0deg')
const filteData = ref('')
const searchData = ref('')
const AddUserCom = ref<InstanceType<typeof ElAutocomplete>>()
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
      await router.push(`/main/address/${data}`)
      // const result = await api.get(data)
      loading.close()
      emit('select', [undefined, false])
    }
  }, {
    data: keyword,
    text: `搜索群: `,
    async method(data: string) {
      const loading = ElLoading.service({
        text: '查询数据中...'
      })
      const result = await api.get(data)
      loading.close()
      emit('select', result)
    }
  }])
}
</script>

<template>
  <el-input v-model="filteData" :fetch-suggestions="filteUsers" placeholder="uid/p2pid" class=" h-auto" clearable
    v-if="iconRotate == '0deg'">
  </el-input>
  <el-autocomplete ref="AddUserCom" @select="item => item.method(item.data)" v-model="searchData"
    :fetch-suggestions="getLisetData" popper-class="autocomplete region-no-drag" placeholder="uid/p2pid" class=" h-auto"
    clearable v-else>
    <template #prefix>
      <el-icon class="el-input__icon">
        <Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div>{{ item.text }} {{ item.data }}</div>
    </template>
  </el-autocomplete>
  <el-button class=" ml-2 !w-8" @click="toAddUser()">
    <el-icon class="search-icon" :size="20">
      <Plus>
      </Plus>
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

// .autocomplete {
//   li {
//     line-height: normal;
//     padding: 7px;

//     .addr {
//       font-size: 12px;
//       color: #b4b4b4;
//     }

//     .name {
//       text-overflow: ellipsis;
//       overflow: hidden;
//     }

//     .highlighted .addr {
//       color: #ddd;
//     }
//   }
// }
</style>