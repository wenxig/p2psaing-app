<script setup lang='tsx'>
import { reactive, ref } from 'vue';
interface Props {
  exit?: boolean
  minsize?: boolean
  maxsize?: boolean
  type?: 'quit' | 'haid',
  for?: string
}
const props = withDefaults(defineProps<Props>(), {
  exit: true,
  minsize: true,
  maxsize: true,
  type: 'haid',
  for: "mainWindow"
})
let isFocus = ref(true)
let isHover = ref(false)
let isMaxSize = ref(false)
window.ipcRenderer.on(`${props.for}_focus`, () => {
  isFocus.value = true
})
window.ipcRenderer.on(`${props.for}_blur`, () => {
  isFocus.value = false
})

const mainClass = `flex items-center justify-around rounded-full h-3 w-3 border-[0.1px] border-[#909399] border-solid`.split(" ")
const ifClass = [!isFocus ? '!bg-[#C0C4CC]' : '']
const classes = reactive([
  [
    ...mainClass,
    ...ifClass,
    'bg-red-500',
    'active:bg-red-700'
  ], [
    ...mainClass,
    ...ifClass,
    'bg-yellow-400',
    "active:bg-yellow-700"
  ], [
    ...mainClass,
    ...ifClass,
    'bg-green-500',
    'active:bg-green-700'
  ]
])

const clickEvent = reactive([
  () => window.ipcRenderer.invoke(props.type == 'haid' ? `${props.for}_close` : 'app_quit'),
  () => window.ipcRenderer.invoke(`${props.for}_minimize`),
  () => window.ipcRenderer.invoke(`${props.for}_maximize`, (isMaxSize.value = true)),
  () => window.ipcRenderer.invoke(`${props.for}_unmaximize`, (isMaxSize.value = false))
])
const ifShow = reactive([
  props.exit,
  props.minsize,
  props.maxsize,
  props.maxsize
])

const IconElements = {
  a: <i-ep-CloseBold></i-ep-CloseBold>,
  b: <i-ep-Minus></i-ep-Minus>,
  c: <i-ep-DCaret class="rotate-[-45deg]"></i-ep-DCaret>,
  d: (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="rotate-[-45deg]">
      <path
        d="m524.3337,447.3337l285.99972,-319.3337l-596,0l310.00028,319.3337zm-303.33425,444.6663l621.66823,1l-318.0011,-356.0011l-303.66713,355.0011z"
        fill="currentColor" />
    </svg>
  )
}
</script>

<template>
  <el-space class="region-no-drag !w-[3.75rem] h-5 !pl-1 !pr-1" @mouseenter="isHover = true"
    @mouseleave="isHover = false">
    <template v-for="(_show, index) in ifShow">
      <div :class="classes[index == 3 ? 2 : index]"
        v-if="((index == 3) || (!isMaxSize || index == 0 || index == 1)) && _show"
        @click="$window.console.log(void clickEvent[index]())">
        <el-icon size="0.5rem" v-if="isHover">
          <IconElements.a v-if="index == 0" />
          <IconElements.b v-if="index == 1" />
          <IconElements.c v-if="index == 2" />
          <IconElements.d v-if="index == 3" />
        </el-icon>
      </div>
    </template>
  </el-space>
</template>