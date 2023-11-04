<script setup lang='ts'>
import { reactive, onMounted, ref } from 'vue';
import UserTag from './userTag.c.vue';
import ShowSearchResult from './searchResult.c.vue';
import { isEmpty } from 'lodash-es';
import { useLinkUser } from '@h/useLinkUser';
const linker = useLinkUser()
interface LinkItem {
  value: string
  link: string
}

const state = ref('')
const links = ref<LinkItem[]>([])

const querySearch = (queryString: string, cb: (arg0: LinkItem[]) => void) => {
  const results = queryString
    ? links.value.filter(createFilter(queryString))
    : links.value
  cb(results)
}
const createFilter = (queryString: string) => {
  return (restaurant: { value: string; }) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
const loadAll = () => {
  return [
    { value: '你搜你吗呢', link: 'https://github.com/wenxig' },
  ]
}
const handleSelect = (aitem: Record<string, any>): any => {
  const item = aitem as LinkItem
  console.log(item)
}

const handleIconClick = (ev: Event) => {
  console.log(ev)
}
onMounted(() => {
  links.value = loadAll()
})
const dialogShow = ref(false)



const formValOfLink = reactive({
  uid: 0
})
const timeLink = reactive({
  uid: 0
})
const formValOfGrlop = reactive({
  gid: ""
})
const formValOfAddGrlop = reactive({
  name: "",
  users: [] as string[]
})
const tabSel = ref('发送申请')

const searchUserEl = ref<typeof ShowSearchResult>()
const isSearching = ref(false)
let results: User.WebDbSave[]
async function toS() {
  isSearching.value = true
  if (!searchUserEl.value) {
    return
  }
  results = await searchUserEl.value.search(formValOfLink.uid);
  isSearching.value = false
}

const searchUserEl2 = ref<typeof ShowSearchResult>()
let results2: User.WebDbSave[]
async function toL() {
  isSearching.value = true
  if (!searchUserEl2.value) {
    return
  }
  results2 = await searchUserEl2.value.search(timeLink.uid);
  isSearching.value = false
}
async function toLink() {
  if (tabSel.value == '发送申请') {
    if (isEmpty(results[0])) {
      ElMessage.error('请输入连接者uid');
      return
    }
    const link = results[0]
      ; link;
    return
  }
  if (tabSel.value == '发起连接') {
    if (isEmpty(results2[0])) {
      ElMessage.error('请输入连接者uid');
      return
    }
    const link = results2[0]


    let waiting = ElMessage({
      message: '等待对方同意连接',
      duration: 0
    })
    let waitingTimeout = setTimeout(() => {
      ElMessage.error('等待连接超时')
      endWite()
    }, 10000);
    let endWaitingLink = await linker.linkto(link.id, () => {
      ElMessage.success('对方同意了连接')
      // router.push(`/link/${id}`)
      waiting.close()
      clearTimeout(waitingTimeout)
    }, () => {
      ElMessage.error('对方拒绝了连接')
      endWite()
    })
    const endWite = () => {
      waiting.close()
      clearTimeout(waitingTimeout)
      endWaitingLink()
    }
    linker.peerObj.once("error", () => {
      ElMessage.error('连接失败')
      endWite()
    })
    return
  }
}

</script>

<template>
  <el-autocomplete v-model="state" :fetch-suggestions="querySearch" popper-class="autocomplete-pop region-no-drag"
    placeholder="搜索" @select="handleSelect" class=" h-auto region-no-drag" clearable>
    <template #prefix>
      <el-icon class="el-input__icon" @click="handleIconClick">
        <i-ep-Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
      <!-- <span class="link">{{ item.link }}</span> -->
    </template>
  </el-autocomplete>
  <el-button class=" ml-2 !w-8 region-no-drag" @click="dialogShow = true">
    <el-icon>
      <i-ep-Plus></i-ep-Plus>
    </el-icon>
  </el-button>
  <el-dialog v-model="dialogShow" class="!h-1/2 region-no-drag relative" align-center width="60%" destroy-on-close center
    modal-class="region-drag">
    <el-tabs v-model="tabSel" class="!w-full !h-full">
      <el-tab-pane label="添加好友" name="发送申请">
        <el-form :model="formValOfLink" label-position="top" class="!h-full">
          <el-form-item label="用户uid">
            <n-input-number v-model:value="formValOfLink.uid" :min="0" @blur="toS" class="!w-full" :show-button="false"
              :keyboard="{ ArrowUp: false, ArrowDown: false }" />
          </el-form-item>
          <ShowSearchResult one ref="searchUserEl" />
        </el-form>
      </el-tab-pane>


      <el-tab-pane label="临时连接" name="发起连接">
        <el-form :model="timeLink" label-position="top" class="!h-full">
          <el-form-item label="用户uid">
            <n-input-number v-model:value="timeLink.uid" :min="0" @blur="toL" class="!w-full" :show-button="false"
              :keyboard="{ ArrowUp: false, ArrowDown: false }" />
          </el-form-item>
          <ShowSearchResult one ref="searchUserEl2" />
        </el-form>
      </el-tab-pane>



      <el-tab-pane label="加入群聊" name="申请加入">
        <el-form :model="formValOfGrlop" label-position="top" class="!h-full">
          <el-form-item label="群聊gid">
            <el-input v-model="formValOfGrlop.gid"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>



      <el-tab-pane label="创建群聊" name="确定创建">
        <el-form :model="formValOfAddGrlop" label-position="top" class="!h-full">
          <el-form-item label="创建群聊">
            <el-input v-model="formValOfAddGrlop.name"></el-input>
          </el-form-item>
          <el-form-item>
            <UserTag v-model="formValOfAddGrlop.users" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>


    <el-form-item class="!absolute bottom-3 right-5">
      <el-button @click="dialogShow = false">取消</el-button>
      <el-button type="primary" :loading="isSearching" @click="toLink">{{ tabSel }}</el-button>
    </el-form-item>


    <el-icon class="!absolute right-7 top-7 cursor-pointer -translate-y-1/2 translate-x-1/2" size="20px"
      @click="dialogShow = false"><i-ep-Close /></el-icon>
  </el-dialog>
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