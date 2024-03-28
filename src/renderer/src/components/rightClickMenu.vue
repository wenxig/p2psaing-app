<script lang="ts" setup>
import { shallowRef, ref, nextTick } from 'vue'
type RightMenuPropsTotels = {
  'key': string;
  'label': string;
  'handleSelect': () => boolean | void
  'children'?: RightMenuPropsTotels;
}[]
const totels = shallowRef<RightMenuPropsTotels>([])
const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
let handleSelect: [hs: () => boolean | void, key: string][] = []
function _handleSelect(key: string) {
  const cb = handleSelect.filter(k => k[1] == key)
  for (const totel of cb) totel[0]()
  showDropdown.value = false
}
function handleContextMenu(e: MouseEvent, totel: RightMenuPropsTotels) {
  e.preventDefault()
  const toHs = (totel: RightMenuPropsTotels, ret?: [hs: () => boolean | void, key: string][]): [hs: () => boolean | void, key: string][] => {
    if (!ret) ret =[]
    for (const { key, handleSelect } of totel) ret.push([handleSelect, key])
    for (const { children } of totel.filter(l => 'children' in l)) toHs(children!, ret)
    return ret
  }
  handleSelect = toHs(totel)
  totels.value = totel
  showDropdown.value = false
  nextTick().then(() => {
    showDropdown.value = true
    x.value = e.clientX
    y.value = e.clientY
  })
}
function onClickoutside() {
  showDropdown.value = false
}

</script>
<template>
  <slot :handleContextMenu="handleContextMenu"></slot>
  <n-dropdown placement="bottom-start" trigger="manual" :x="x" :y="y" :options="totels" :show="showDropdown"
    @clickoutside="onClickoutside" @select="_handleSelect" />
</template>