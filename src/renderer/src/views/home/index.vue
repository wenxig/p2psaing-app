<script setup lang='ts'>
import searchBox from './searchBox.c.vue';
import linkList from './linkList.c.vue';
import { useAppStore } from '@s/appdata';
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
const appStore = useAppStore();

window.ipc.setSize(900,770)
window.ipc.setResizable(true)
</script>

<template>
  <Layout>
    <MainLayout>
      <template #aside-header>
        <search-box></search-box>
      </template>
      <template #aside-main>
        <link-list></link-list>
      </template>
      <template #main-header>
        <component v-if="(typeof appStore.topBar.value) != 'string'" :is="appStore.topBar.value">
        </component>
        <span v-else>{{ appStore.topBar.value }}</span>
      </template>
      <template #default>
        <router-view></router-view>
      </template>
    </MainLayout>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.el-avatar img) {
  user-select: none;
  -webkit-user-drag: none;
}
</style>