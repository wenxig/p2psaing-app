<script setup lang='ts'>
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
import { ref } from 'vue'
import SearchBox from './searchBox.c.vue';
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
    <MainLayout>
      <template #aside-header>
        <SearchBox />
      </template>
      <template #aside-main>
        <el-tree-v2 :data="data" :props="props" :height="height - 60" :item-size="60" v-slot="{ data }" empty-text="你没有好友"
          check-on-click-node>
          <div>
            <p>{{ data }}</p>
          </div>
        </el-tree-v2>
      </template>
      <template #default>
        <router-view></router-view>
      </template>
    </MainLayout>
  </Layout>
</template>