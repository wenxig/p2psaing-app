<script setup lang=ts generic="T">
import { ref, computed, shallowRef, watch } from 'vue'
import { useEventListener } from "@vant/use"
import { cloneDeep, toNumber } from 'lodash-es';
const props = defineProps<{
  listData: T[],
  itemMinHeight: number,
  scrollHeight: number,
}>()

const visibleCount = Math.ceil(props.scrollHeight / props.itemMinHeight) + 1
const start = ref(0)
const end = computed(() => Math.min(start.value + 2 * visibleCount - 1, renderData.value.length))
const paddingTop = computed(() => start.value * props.itemMinHeight)
const renderData = ref(cloneDeep(props.listData))
const paddingBottom = computed(() => (renderData.value.length - end.value) * props.itemMinHeight)
const visibleItems = computed(() => {
  const v = renderData.value.slice(start.value, end.value)
  console.log(v)
  return
})
const scrollBox = ref<HTMLInputElement>();
let lastIndex = start.value;

const handleScroll = rafThrottle(() => {
  onScrollToBottom();
  onScrolling();
});
const reload = () => {
  renderData.value = props.listData
  handleScroll()
}
watch(() => props.listData, reload)

const onScrolling = () => {
  const scrollTop = scrollBox.value!.scrollTop;
  let thisStartIndex = Math.floor(scrollTop / props.itemMinHeight);
  const isSomeStart = thisStartIndex == lastIndex;
  if (isSomeStart) return;
  const isEndIndexOverListLen = thisStartIndex + 2 * visibleCount - 1 >= renderData.value.length;
  if (isEndIndexOverListLen) {
    thisStartIndex = renderData.value.length - (2 * visibleCount - 1);
  }
  lastIndex = thisStartIndex;
  start.value = thisStartIndex;
}

const onScrollToBottom = () => {
  const scrollTop = scrollBox.value!.scrollTop;
  const clientHeight = scrollBox.value!.clientHeight;
  const scrollHeight = scrollBox.value!.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight) {
    reload();
  }
}
function rafThrottle<T extends (...args: any) => any>(fn: T) {
  let lock = false;
  return function (...args: Parameters<T>) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(args);
      lock = false;
    });
  };
}
useEventListener('scroll', handleScroll, { target: scrollBox })

function scrollToBottom() {
  scrollBox.value?.scrollTo({ top: toNumber(window.getComputedStyle(scrollBox.value!).height.match(/\d+/g)) })
}
defineExpose<{
  scrollToBottom(): void
}>({
  scrollToBottom
})
defineSlots<{
  default(props: {
    item: T,
    index: number
  }): any
}>()
</script>

<template>
  <div class="overflow-y-auto" ref="scrollBox" :style="{ height: scrollHeight + 'px' }">
    <div class="relative" :style="{ paddingTop: paddingTop + 'px', paddingBottom: paddingBottom + 'px' }">
      <div v-for="(item, index) in visibleItems" :key="index" :style="{ minHeight: itemMinHeight + 'px' }">
        <slot name="item" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>