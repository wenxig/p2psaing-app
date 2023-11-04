import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export const useAppStore = defineStore("app", () => {
  const loadProgress=ref(0)
  const topBar=reactive({
    text:""
  })
  return { loadProgress, topBar }
})