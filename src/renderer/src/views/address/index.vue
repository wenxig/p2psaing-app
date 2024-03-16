<script setup lang='ts'>
import Layout from '@l/base.vue';
import MainLayout from '@l/rightBase.vue';
import SearchBox from './searchBox.c.vue';
import { getUserAddress } from '@/db/network';
import { NVirtualList } from 'naive-ui';
import { useUserStore } from '@/store/user';
const ITEM_HEIGHT = 40
const { user } = useUserStore()
const allAddress = await getUserAddress(user.uid)

</script>

<template>
  <Layout>
    <MainLayout>
      <template #aside-header>
        <SearchBox />
      </template>
      <template #aside-main>
        <ElAutoResizer v-slot="{ height, width }">
          <NVirtualList v-slot="{ item }: { item: number }" :items="allAddress"
            :style="`height:${height}px;width:${width}px;`" :itemSize="ITEM_HEIGHT">
            <div>
              {{ item }}
            </div>
          </NVirtualList>
        </ElAutoResizer>
      </template>
      <template #default>
        <router-view></router-view>
      </template>
    </MainLayout>
  </Layout>
</template>