<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'
import { ElInput } from 'element-plus'

const props = defineProps<{
  modelValue: string[]
}>()
const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()

const inputValue = ref('')
const dynamicTags = props.modelValue
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
  dynamicTags.splice(dynamicTags.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

watch(dynamicTags, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>
<template>
  <el-tag v-for="tag in dynamicTags" :key="tag" class="mr-1" closable :disable-transitions="false"
    @close="handleClose(tag)">
    {{ tag }}
  </el-tag>
  <el-input v-if="inputVisible" ref="InputRef" v-model="inputValue" class="!mt-1 !w-20" size="small"
    @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
  <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
    + 初始用户
  </el-button>
</template>
