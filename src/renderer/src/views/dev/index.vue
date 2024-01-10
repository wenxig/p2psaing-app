<script setup lang='ts'>
import db from '@/db';
import Layout from '@l/base.vue';

</script>

<template>
  <Layout>
    <el-button @click="$window.ipc.createMainlessWindow({ windowChannel: '123' })">新应用实例(伪)</el-button>
    <el-button @click="db.base.clear()">清除数据库</el-button>
    <el-button @click="$router.push('/main/dev/chat')">聊天测试</el-button>
    <el-button @click="$router.push('/main/dev/state')">状态机测试</el-button>
  </Layout>
</template>