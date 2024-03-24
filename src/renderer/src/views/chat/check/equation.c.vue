<script setup lang='ts'>
import { ref } from 'vue'
import { InfoFilled, Close } from '@element-plus/icons-vue'
import { useSender } from "@p/chat/inject";
import { inject } from 'vue';
import { KatexOptions } from 'katex'

const tempMsg = defineModel<{
  text: string;
}>({ required: true })
const showEquationModel = ref(false)
defineExpose({
  open() {
    showEquationModel.value = true
  },
  close() {
    showEquationModel.value = false
  }
})
const sender = inject(useSender)!
const options: KatexOptions = {
  fleqn: true,
  throwOnError: false,
  errorColor: 'var(--el-color-danger)',
  displayMode: true,
}
</script>

<template>
  <NModal v-model:show="showEquationModel">
    <div class="w-2/3 !h-[60vh] bg-[--el-bg-color] rounded-sm ">
      <div class="h-1/6 flex items-center">
        <div class=" flex items-center w-2/4 pl-3">
          <el-icon :size="25">
            <InfoFilled />
          </el-icon>
          <span class="font-bold text-xl ml-1">检查公式</span>
        </div>
        <div class=" w-[40%] flex items-center justify-end">
          <ElButton type="primary" @click="sender('equation')">确定</ElButton>
        </div>
        <div class=" w-[10%] relative flex items-center">
          <el-icon class="!absolute right-3" :size="25" @click="showEquationModel = false">
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="pl-2 -mt-3 mb-3 flex items-center">
        <span>使用
          <el-link type="primary"
            @click="$ipc.openExternal('https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference')">latex语法(英文)(全)</el-link>
          或
          <el-link type="primary"
            @click="$ipc.openExternal('https://www.cnblogs.com/duyuanshang/p/emlogpro_ccgxk_katex.html')">中文(不全)</el-link>编写公式</span>
      </div>
      <div class=" !w-full !h-full overflow-auto p-2">
        <NEquation class=" !w-full !h-full " :value="tempMsg.text.replaceAll('$$','')" :katex-options="options" />
      </div>
      <div class="absolute !w-full !h-2/6 bottom-0 overflow-hidden p-2">
        <NInput v-model:value="tempMsg.text" type="textarea" class="!h-full !w-full !resize-none" />
      </div>
    </div>
  </NModal>
</template>