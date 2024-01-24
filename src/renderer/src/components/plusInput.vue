<script setup lang='ts'>
import { computed, ref } from 'vue';
import { trim } from 'lodash-es';
const focusClass = `!-top-1 !left-[-0.2rem] scale-[0.8]`;
const inputError = ref(false)
const props = withDefaults(defineProps<{
  modelValue: string,
  type?: 'text' | 'email' | 'password' | 'phone',
  lable: string,
  alert?: boolean,
  inspect?: boolean

}>(), {
  type: 'text',
  alert: false,
  inspect: false
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
const isInputFocus = ref(trim(props.modelValue) != '')
const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
const inspect = {
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,10}$/,
  phone: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
  text: /^/
}

const inspectText = (str: string) => props.inspect && (inputError.value = !inspect[props.type].test(str))
</script>

<template>
  <div class="region-no-drag h-10 relative w-full">
    <input :type="type" v-model="value" @focus="isInputFocus = true"
      @blur="trim(value) == '' ? isInputFocus = inputError = false : inspectText(value)"
      class="border-solid border-b-2 h-7 w-full absolute bottom-0 !outline-0 transition-all"
      :class="[(alert || inputError) ? 'border-b-[--el-color-danger]' : 'border-b-[--el-color-primary-light-5]']">
    <el-text
      class="absolute transition-all top-[0.8rem] text-[--el-color-primary-light-5] left-0 select-none pointer-events-none"
      :class="[isInputFocus ? focusClass : '', (alert || inputError) ? '!text-[--el-color-danger]' : '!text-[--el-color-primary-light-5]']">
      {{ lable }}{{ (alert || inputError) ? ' *' : '' }}
    </el-text>
  </div>
</template>