<script setup lang='ts'>
import { Plus, Search } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
import { isEmpty, toNumber } from "lodash-es";
import { ElMessage } from 'element-plus'
import { z } from 'zod'
import { searchByEmail } from '@/db/network';
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user';
import { Chat } from '@/api/chat';
const user = useUserStore()
const showMenu = ref(false)
const router = useRouter()
const fastlink = reactive({
  show: false,
  data: ""
})
async function link() {
  const loading = NLoading.service({
    text: '发起中...'
  })
  if (isEmpty(fastlink.data)) {
    ElMessage.warning("请输入内容")
    return
  }
  if (z.string().email().safeParse(fastlink.data).success) {
    const result = await searchByEmail(fastlink.data)
    await _link(result.uid)
    return loading.close()
  }
  if (!(/^[0-9]+$/g.test(fastlink.data))) {
    ElMessage.error('输入正确的内容')
    return
  }
  const uid = toNumber(fastlink.data)
  await _link(uid)
  return loading.close()
  async function _link(uid: number) {
    if (fastlink.data == user.user.email || fastlink.data == user.user.uid.toString()) {
      return void ElMessage.error('你不能连接到你自己')
    }
    try {
      console.log('before create');
      const link = await Chat.ref.create(uid, {
        type: 'client',
      })
      console.log('after create');
      if (link[1]) {
        ElMessage.success('成功')
        router.replace(`/main/chat/temp/${uid}`)
        return link
      }
      ElMessage.error('无法连接')
      return link
    } catch {
      ElMessage.error('无法连接')
    }
    fastlink.show = false
  }
}
</script>

<template>
  <n-autocomplete popper-class="autocomplete-pop" placeholder="搜索" class=" h-auto" clearable>
    <template #prefix>
      <n-icon class="n-input__icon">
        <Search />
      </n-icon>
    </template>
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
      <!-- <el-text class="link">{{ item.link }}</el-text> -->
    </template>
  </n-autocomplete>
  <n-popover :visible="showMenu" placement="bottom" :width="200" trigger="click">
    <template #reference>
      <n-button class=" ml-2 !w-8" @click="showMenu = !showMenu">
        <n-icon>
          <Plus></Plus>
        </n-icon>
      </n-button>
    </template>
    <template #default>
      <n-button class="!w-full !h-10 !border-none" @click="(showMenu = false) || (fastlink.show = true)"
        quaternary>发起快速连接</n-button>
      <NDivider class="!my-1"></NDivider>
    </template>
  </n-popover>
  <n-modal v-model:show="fastlink.show" preset="card" size="small" class="!w-1/2 !h-[50vh]">
    <template #default>
      <div>
        <NInput placeholder="uid/email" v-model="fastlink.data"></NInput>
        <NButton @click="link()">确定</NButton>
      </div>
    </template>
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

:global(.n-dialog__body) {
  padding-top: 10px !important;
  height: 100%;
}
</style>