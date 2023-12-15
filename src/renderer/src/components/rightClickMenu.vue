<template>
  <slot :handleContextMenu="{ handleContextMenu }"></slot>
  <n-dropdown placement="bottom-start" trigger="manual" :x="x" :y="y" :options="totels" :show="showDropdown"
    :on-clickoutside="onClickoutside" @select="_handleSelect" />
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { isEmpty } from 'lodash-es'
const props = defineProps<Props>()
interface Props {
  totels: Array<{
    'key': string | number,
    'label': string | number,
    'children': Props["totels"]
  }>,
  handleSelect(sel: string | number): boolean | void
}
const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)

function _handleSelect(key: string | number) {
  const cb = props.handleSelect(key)
  if ((cb == true) || isEmpty(cb)) {
    showDropdown.value = false
    return
  }
  showDropdown.value = true
}
function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  showDropdown.value = false
  nextTick().then(() => {
    showDropdown.value = true
    x.value = e.clientX
    y.value = e.clientY
  })
}
function onClickoutside(fn: () => boolean | void) {
  const cb = fn()
  if ((cb == true) || isEmpty(cb)) {
    showDropdown.value = false
    return
  }
  showDropdown.value = true
}

</script>