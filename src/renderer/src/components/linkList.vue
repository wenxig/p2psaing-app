<template>
  <el-tree-v2 :data="data" :props="props" :height="height - 60" :item-size="60" v-slot="{ data }" empty-text="你没有好友" check-on-click-node>
    <div>
      <p>{{ data }}</p>
    </div>
  </el-tree-v2>
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
let height = ref(window.innerHeight)
window.onresize = () => {
  height.value = window.innerHeight;
}

const props = {
  value: 'id',
  label: 'label',
  children: 'children',
}
const data: listItem[] = []

interface listItem {
  value: string | number
  label: string
  children: never[]
}
</script>
