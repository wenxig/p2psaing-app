<script setup lang='tsx'>
import { ref } from 'vue';
import { CloseBold, Minus, DCaret } from '@element-plus/icons-vue'
const props = withDefaults(defineProps<{
  exit?: boolean
  minsize?: boolean
  maxsize?: boolean
  type?: 'quit' | 'haid',
  for?: string
}>(), {
  exit: true,
  minsize: true,
  maxsize: true,
  type: 'haid',
})
const isFocus = ref(true)
const isHover = ref(false)
const isMaxSize = ref(false)
window.ipc.addRouter(`/emit/focus`, () => isFocus.value = true)
window.ipc.addRouter(`/emit/blur`, () => isFocus.value = false)
const classes = [[
  'bg-red-500',
  'active:bg-red-700'
], [
  'bg-yellow-400',
  "active:bg-yellow-700"
], [
  'bg-green-500',
  'active:bg-green-700'
]]
const clickEvent = [
  () => ((props.type == 'haid') || (window.instance_name.my != 1)) ? window.ipc.close() : window.ipc.relanch(),
  () => window.ipc.minimize(),
  () => {
    window.ipc.maximize()
    isMaxSize.value = true
  },
  () => {
    window.ipc.unmaximize()
    isMaxSize.value = false
  }]
const ifShow = [
  props.exit,
  props.minsize,
  props.maxsize,
  props.maxsize
]

const IconNements = [
  <CloseBold></CloseBold>,
  <Minus></Minus>,
  <DCaret class="rotate-[-45deg]"></DCaret>,
  (<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="rotate-[-45deg]">
    <path
      d="m524.3337,447.3337l285.99972,-319.3337l-596,0l310.00028,319.3337zm-303.33425,444.6663l621.66823,1l-318.0011,-356.0011l-303.66713,355.0011z"
      fill="currentColor" />
  </svg>)
]
</script>

<template>
  <el-space class="region-no-drag !w-[3.75rem] h-5 !pl-1 !pr-1" @mouseenter="isHover = true"
    @mouseleave="isHover = false">
    <div v-for="(show, index) of ifShow" class=" h-3 w-3">
      <div :class="[!isFocus && '!bg-[#C0C4CC]', ...classes[index == 3 ? 2 : index]]"
        class="flex items-center justify-around rounded-full w-full h-full border-[0.1px] border-[#909399] border-solid"
        v-if="show && ((index == 0 || index == 1) || (!isMaxSize && index == 2) || (isMaxSize && index == 3))">
        <el-icon size="0.5rem" v-if="isHover" @click="clickEvent[index]">
          <component :is="IconNements[index]" />
        </el-icon>
      </div>
    </div>
  </el-space>
</template>