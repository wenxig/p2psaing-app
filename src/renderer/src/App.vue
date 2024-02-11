<script setup lang="ts">
import elZhCn from 'element-plus/dist/locale/zh-cn';
import { zhCN as nZhCn, dateZhCN as nDateZhCN } from 'naive-ui'
import katex from 'katex'
import 'katex/dist/katex.css'
import hljs from 'highlight.js';
import 'highlight.js/scss/atom-one-light.scss';
import { useLightTheme } from '@h/useTheme';
import { useThemeVars } from 'naive-ui';
import { useUserStore } from '@s/user';
import { useStyleTag } from '@vueuse/core';
import db from './db';
import { actor } from "@c/index";
import { useAppStore } from './store/appdata';
import { createPeer } from '@/api';
import { storeToRefs } from 'pinia';
useLightTheme(useThemeVars())
const { user } = storeToRefs(useUserStore())
const joinStyle = useStyleTag('', { id: 'app-inject-style' })
let isLoadCSS = false
db.app.sub((styles) => {
  if (!isLoadCSS) {
    actor.send({ type: 'loadCSS' })
    isLoadCSS = true
  }
  styles = styles.filter(({ isLoad }) => isLoad)
  joinStyle.css.value = styles.map(({ code }) => code).join('\n')
}, true)
if (!useAppStore().peer && location.hash.includes('/main')) createPeer(user.value.lid).then(peer => useAppStore().peer = peer as any)
</script>

<template>
  <n-config-provider :locale="nZhCn" :date-locale="nDateZhCN" class="w-full h-full" :katex="(katex as any)" :hljs="hljs">
    <n-global-style />
    <el-config-provider :locale="elZhCn">
      <Suspense>
        <router-view class="overflow-hidden"></router-view>
        <template #fallback>
          <NSpin :delay="1000" class="!w-full !h-full">
            <template #description>从网络加载内容中</template>
          </NSpin>
        </template>
      </Suspense>
    </el-config-provider>
  </n-config-provider>
  <Teleport to="body">
    <!-- 水印 -->
    <div class="opacity-5 fixed top-1 left-1/2 -translate-x-1/2  pointer-events-none text-[--el-bg-color-page]">
      <template v-if="!!user.name">
        name:{{ user.name }}<br>
        uid:{{ user.uid }}
      </template>
      <template v-else>
        user not login
      </template>
    </div>
  </Teleport>
</template>