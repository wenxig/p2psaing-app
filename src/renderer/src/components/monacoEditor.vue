<script setup lang="ts">
import { onMounted, computed, watch, ref, nextTick, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import loader from "@monaco-editor/loader";
loader.config({ monaco });
loader.config({
  "vs/nls": {
    // availableLanguages: { "*": "de" },
    availableLanguages: { "*": "zh-cn" },
  },
});
function useMonacoEditor(language: string = 'css') {
  // 编辑器示例
  let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null
  // 目标元素
  const monacoEditorRef = ref<HTMLElement | null>(null)

  // 创建实例
  function createEditor(editorOption: monaco.editor.IStandaloneEditorConstructionOptions = {}) {
    if (!monacoEditorRef.value) return
    return (async () => {
      const monacoInstance = await loader.init()
      monacoEditor = monacoInstance.editor.create(monacoEditorRef.value!, {
        // 初始模型
        model: monacoInstance.editor.createModel('', language),
        // 是否启用预览图
        minimap: { enabled: true },
        // 圆角
        roundedSelection: true,
        // 主题
        theme: 'vs',
        // 主键
        multiCursorModifier: 'ctrlCmd',
        // 滚动条
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8
        },
        // 行号
        lineNumbers: 'on',
        // tab大小
        tabSize: 2,
        //字体大小
        fontSize: 16,
        // 控制编辑器在用户键入、粘贴、移动或缩进行时是否应自动调整缩进
        autoIndent: 'advanced',
        // 自动布局
        automaticLayout: true,
        ...editorOption
      })
      return monacoEditor
    })()
  }

  // 格式化
  const formatDoc = async () => await monacoEditor?.getAction('editor.action.formatDocument')?.run()

  // 数据更新
  const updateVal = (val: string) => nextTick(() => {
    if (getOption(monaco.editor.EditorOption.readOnly)) updateOptions({ readOnly: false })
    monacoEditor?.setValue(val)
    setTimeout(async () => await formatDoc(), 10)
  })

  // 配置更新
  const updateOptions = (opt: monaco.editor.IStandaloneEditorConstructionOptions) => monacoEditor?.updateOptions(opt)

  // 获取配置
  const getOption = (name: monaco.editor.EditorOption) => monacoEditor?.getOption(name)

  // 获取实例
  const getEditor = () => monacoEditor

  // 页面离开 销毁
  onBeforeUnmount(() => monacoEditor && monacoEditor.dispose())

  return {
    monacoEditorRef,
    createEditor,
    getEditor,
    updateVal,
    updateOptions,
    getOption,
    formatDoc
  }
}
const props = withDefaults(defineProps<{
  width?: string | number,
  height?: string | number,
  language?: string,
  editorOption?: Object,
  modelValue: string
}>(), {
  width: '100%',
  height: '100%',
  language: 'css',
  editorOption: () => ({}),
  modelValue: ''
})

const emits = defineEmits<{
  (e: 'blue'): void,
  (e: 'update:modelValue', val: string): void,
  (e: 'mounted'): void
}>()

const monacoEditorStyle = computed(() => ({
  width: typeof props.width === 'string' ? props.width : props.width + 'px',
  height: typeof props.height === 'string' ? props.height : props.height + 'px'
}))

const { monacoEditorRef, createEditor, updateVal, updateOptions, getEditor } = useMonacoEditor(props.language)
onMounted(async () => {
  const monacoEditor = await createEditor(props.editorOption)
  updateMonacoVal(props.modelValue);
  monacoEditor?.onDidChangeModelContent(() => emits('update:modelValue', monacoEditor!.getValue()));
  monacoEditor?.onDidBlurEditorText(() => emits('blue'))
  emits('mounted')
})

watch(() => props.modelValue, () => updateMonacoVal(props.modelValue))

const updateMonacoVal = (val: string) => val !== getEditor()?.getValue() && updateVal(val)
defineExpose({ updateOptions })
</script>
<template>
  <div ref="monacoEditorRef" :style="monacoEditorStyle" class="monaco"></div>
</template>
