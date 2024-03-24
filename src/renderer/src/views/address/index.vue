<script setup lang='ts'>
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
import SearchBox from './searchBox.c.vue';
import AddressList from './list.c.vue';
</script>

<template>
  <Layout>
    <MainLayout>
      <template #aside-header>
        <SearchBox />
      </template>
      <template #aside-main>
        <AddressList />
      </template>
      <template #default>
        <router-view></router-view>
      </template>
    </MainLayout>
  </Layout>
</template>