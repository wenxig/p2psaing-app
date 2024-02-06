<script setup lang='ts'>
import { ref } from 'vue'
import lightLangs from '@/assets/lightLang.json';
import { InfoFilled, Close } from '@element-plus/icons-vue'
import { useSender } from "@p/chat/inject";
import { inject } from 'vue';
const tempMsg = defineModel<{
  text: string;
  code_is: number;
}>({ required: true })
const showCodeModel = ref(false)
defineExpose({
  open() {
    showCodeModel.value = true
  },
  close() {
    showCodeModel.value = false
  }
})
const sender = inject(useSender)!
</script>

<template>
  <NModal v-model:show="showCodeModel">
    <div class="w-2/3 !h-[60vh] bg-white rounded-sm ">
      <div class="h-1/6 flex items-center">
        <div class=" flex items-center w-1/4 pl-3">
          <el-icon :size="25">
            <InfoFilled />
          </el-icon>
          <span class="font-bold text-xl ml-1">检查代码</span>
        </div>
        <div class=" w-2/4 flex items-center justify-center">
          <el-select-v2 v-model="tempMsg.code_is" class="mr-2" :options="lightLangs" placeholder="选择语言" filterable />
          <ElButton type="primary" @click="sender('code')">确定</ElButton>
        </div>
        <div class=" w-1/4 relative flex items-center">
          <el-icon class="!absolute right-3" :size="25" @click="showCodeModel = false">
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="absolute !w-full !h-5/6 bottom-0 overflow-auto p-2">
        <NCode :code="tempMsg.text" :language="lightLangs[tempMsg.code_is].label" show-line-numbers></NCode>
      </div>
    </div>
  </NModal>
</template>