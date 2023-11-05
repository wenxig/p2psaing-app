<script setup lang='ts'>
import Layout from '@l/base.vue';
// import { useUserStore } from '@/store';
import { ref } from 'vue'
import SearchBox from './searchBox.c.vue';
// const user = useUserStore()
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

<template>
  <Layout>
    <el-container class=" w-[calc(100% - 3.75rem)] flex-none">
      <el-container class=" !shrink-0 w-[16.3rem] border-r-[1px] border-r-[#DCDFE6] border-solid">
        <el-header class=" bg-[#fff] shrink-0 region-drag flex items-center">
          <SearchBox />
        </el-header>
        <el-main class=" shrink-0 !p-0 overflow-none">
          <el-tree-v2 :data="data" :props="props" :height="height - 60" :item-size="60" v-slot="{ data }"
            empty-text="你没有好友" check-on-click-node>
            <div>
              <p>{{ data }}</p>
            </div>
          </el-tree-v2>
        </el-main>
      </el-container>
      <el-container class="w-full">
        <el-header class="region-drag w-full border-b flex items-center text-xl">
          <!-- {{ appStore.topBar.text }} -->
        </el-header>
        <el-main class="w-full">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </Layout>
</template>