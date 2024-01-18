<script setup lang='ts'>
import MonacoEditor from '@/components/monacoEditor.vue'
import db from '@/db';
import { CircleCheck, CircleClose, Plus, Delete, Close, Edit } from '@element-plus/icons-vue';
import { ElMessageBox, UploadRawFile } from 'element-plus';
import { remove } from 'lodash-es';
import { reactive, watch, ref } from 'vue';
const isUpLoadReady = ref(true)
const isUpLoadSetup = ref(false)
const editPage = reactive({
  code: '',
  options: {
    colorDecorators: true,
    lineHeight: 24,
    tabSize: 2,
  },
  show: false,
  name: '',
  reset() {
    this.code = ''
    this.name = ''
    this.about = ''
    this.time = null
    this.isLoad = null
    this.nameEditable = true
  },
  isReady: false,
  close() {
    ElMessageBox.confirm('你要放弃更改并关闭吗？', '退出', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      this.reset()
      this.show = false
    }).catch(() => { })
  },
  upLoad() {
    const find = styles.findIndex(({ name }) => name == this.name)
    const data = {
      about: this.about,
      code: this.code,
      isLoad: this.isLoad ?? true,
      time: this.time ?? new Date(),
      name: this.name
    }
    if (find + 1) {
      styles[find] = data
    } else {
      styles.push(data)
    }
    this.reset()
  },
  time: <Date | null>null,
  isLoad: <boolean | null>null,
  nameEditable: true,
  about: ''
})
const BASE_ROW_HEIGHT = 50
const styles = reactive<db.app.Code[]>([])
db.app.getAllStyle().then((ss) => {
  styles.splice(0, Infinity)
  styles.push(...ss)
  isUpLoadSetup.value = true
  watch(styles, (val) => {
    isUpLoadReady.value = false;
    (async () => {
      for (const code of val) {
        await db.app.addStyle(code, code.name)
      }
    })().then(() => {
      editPage.show = false
      isUpLoadReady.value = true
    })
  })
})
function removeCSS(name: string) {
  db.app.removeStyle(name)
  return remove(styles, { name })
}
function editCSS(name: string) {
  const find = styles.find((t) => name == t.name)!
  editPage.code = find.code
  editPage.name = find.name
  editPage.about = find.about
  editPage.time = find.time
  editPage.isLoad = find.isLoad
  editPage.nameEditable = false
  editPage.show = true
}
function upLoadCSSFile(raw: UploadRawFile) {
  const fr = new FileReader()
  fr.readAsText(raw)
  fr.onloadend = ({ target }) => {
    const res = target!.result!.toString()
    editPage.code = res
    editPage.show = true
  }
  return false
}
</script>

<template>
  <el-text>当前加载的css</el-text>
  <div class="w-full h-[30rem] border rounded-lg" v-loading="!isUpLoadSetup">
    <NVirtualList class="w-full h-full bg-transparent overflow-y-auto" :itemSize="BASE_ROW_HEIGHT" :items="styles">
      <template #default="{ item }: { item: db.app.Code }">
        <div class="flex items-center w-full border-b border-[--el-border-color]"
          :style="{ height: `${BASE_ROW_HEIGHT}px` }">
          <ElIcon class="!w-[5%]" :size="20">
            <CircleCheck class="text-[--el-color-success]" v-if="item.isLoad" />
            <CircleClose class="text-[--el-color-danger]" v-else />
          </ElIcon>
          <ElSpace class="!w-[85%]" :size="20">
            <ElText size="large" class="whitespace-nowrap text-ellipsis">{{ item.name }}</ElText>
            <ElText class="whitespace-nowrap ml-2 text-ellipsis" type="info">{{ item.about }}</ElText>
            <ElText size="small" class="whitespace-nowrap ml-2 text-ellipsis" type="info">
              <NTime :time="item.time" format="yyyy-MM-dd hh:mm" />
            </ElText>
          </ElSpace>
          <el-space class="10%">
            <el-button type="primary" :icon="Edit" circle @click="editCSS(item.name)" />
            <el-button :icon="Delete" type="danger" circle @click="removeCSS(item.name)" />
            <ElSwitch v-model="item.isLoad" :loading="!isUpLoadReady" />
          </el-space>
        </div>
      </template>
    </NVirtualList>
  </div>
  <el-space class="mt-1" size="small">
    <ElUpload :beforeUpload="upLoadCSSFile" :show-file-list="false" :limit="1">
      <el-button :icon="Plus">添加css文件</el-button>
    </ElUpload>
    <el-button :icon="Plus" @click="editPage.show = true">输入css</el-button>
  </el-space>
  <n-modal v-model:show="editPage.show" :maskClosable="false" :trapFocus="false">
    <n-spin :show="!editPage.isReady" class="!w-[80%] rounded-lg border !bg-[--el-bg-color]" :style="{
      height: `${$window.innerHeight / 100 * 80}px`
    }">
      <div class=" relative h-full">
        <div class="h-[10%] w-full relative p-2 !bg-transparent  border-b border-[--el-border-color]">
          <el-input class="absolute left-0 !w-[80%]" placeholder="名字" v-model="editPage.name"
            :disabled="!editPage.nameEditable"></el-input>
          <el-button :loading="!isUpLoadReady" type="primary" class="ml-1" @click="ElMessageBox.prompt('输入简介', '保存', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            'inputValue': editPage.about
          }).then(a => void ((editPage.about = a.value) && editPage.upLoad())).catch(() => { })">保存</el-button>
          <n-button quaternary class="absolute right-1" circle @click="editPage.close()">
            <template #icon>
              <n-icon>
                <Close />
              </n-icon>
            </template>
          </n-button>
        </div>
        <MonacoEditor @mounted="editPage.isReady = true" class="absolute bottom-0 !h-[90%] w-full" language="css"
          v-model="editPage.code" :editor-option="editPage.options" />
      </div>
    </n-spin>
  </n-modal>
</template>
<style scoped lang='scss'>
:deep(.n-spin-content) {
  height: 100% !important;
}
</style>