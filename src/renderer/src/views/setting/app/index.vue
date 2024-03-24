<script setup lang='ts'>
import Layout from '@l/base.vue';
import { ref } from 'vue'
import Style from './style.c.vue'
import About from './about.c.vue'
import AppSetting from './app.c.vue'
const activeName = ref('app')
const openUserSetting = () => window.ipc.createChildWindow({ width: 800, height: 500, url: '/main/setting/user' })
</script>

<template>
  <Layout>
    <el-container class="w-full h-full p-2 overflow-y-auto">
      <el-tabs v-model="activeName" class="w-full" @tab-change="to => to == 'user' && openUserSetting">
        <el-tab-pane label="应用设置" name="app" class="!h-full">
          <AppSetting  v-if="activeName == 'app'"/>
        </el-tab-pane>
        <el-tab-pane label="插件设置" name="plugin" class="!h-full">插件设置</el-tab-pane>
        <el-tab-pane label="样式设置" name="style" class="!h-full">
          <Style v-if="activeName == 'style'"></Style>
        </el-tab-pane>
        <el-tab-pane label="用户设置" name="user" class="!h-full">
          <template v-if="activeName == 'user'">
            在打开窗口中设置<ElButton class="ml-2" @click="openUserSetting">打开
            </ElButton>
          </template>
        </el-tab-pane>
        <el-tab-pane label="关于" name="about" class="!h-full">
          <About v-if="activeName == 'about'"></About>
        </el-tab-pane>
      </el-tabs>
    </el-container>
  </Layout>
</template>
<style scoped lang='scss'>
:deep(.el-tabs__header) {
  -webkit-app-region: drag;

  & .el-tabs__nav {
    -webkit-app-region: no-drag;
  }
}
</style>