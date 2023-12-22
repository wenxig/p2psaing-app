<script setup lang="ts">
import elZhCn from 'element-plus/dist/locale/zh-cn';
import { zhCN as nZhCn, dateZhCN as nDateZhCN } from 'naive-ui'
import katex from 'katex'
import 'katex/dist/katex.css'
import hljs from 'highlight.js';
import 'highlight.js/scss/atom-one-light.scss';
import { useLightTheme } from '@h/useTheme';
import { useThemeVars } from 'naive-ui';
import { useUserStore } from './store/user';
useLightTheme(useThemeVars())
const user = useUserStore()
</script>

<template>
  <n-config-provider :locale="nZhCn" :date-locale="nDateZhCN" class="w-full h-full" :katex="(katex as any)" :hljs="hljs">
    <n-global-style />
    <el-config-provider :locale="elZhCn">
      <Suspense>
        <router-view></router-view>
      </Suspense>
    </el-config-provider>
  </n-config-provider>
  <Teleport to="body">
    <!-- 水印 -->
    <div class="opacity-5 fixed top-1 left-1/2 -translate-x-1/2  pointer-events-none text-[--el-bg-color]">
      <template v-if="!!user.user.name">
        name:{{ user.user.name }}<br>
        uid:{{ user.user.uid }}
      </template>
      <template v-else>
        user not login
      </template>
    </div>
  </Teleport>
</template>