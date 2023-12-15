<script setup lang="ts">
import elZhCn from 'element-plus/dist/locale/zh-cn';
import { zhCN as nZhCn, dateZhCN as nDateZhCN } from 'naive-ui'
import katex from 'katex'
import 'katex/dist/katex.css'
import hljs from 'highlight.js';
import 'highlight.js/scss/atom-one-light.scss';
import { useLightTheme } from '@h/useTheme';
import { useThemeVars } from 'naive-ui';
useLightTheme(useThemeVars())
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
</template>