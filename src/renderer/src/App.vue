<script setup lang="ts">
//@ts-ignore
import elZhCn from 'element-plus/dist/locale/zh-cn';
import { zhCN as nZhCn, dateZhCN as nDateZhCN, type GlobalThemeOverrides } from 'naive-ui'
import { reactive } from 'vue';
import katex from 'katex'
import 'katex/dist/katex.css'

import hljs from 'highlight.js';
import 'highlight.js/scss/atom-one-light.scss';

const cssVarName = [
  "--el-font-family",
  "--el-font-family",
  "--el-font-weight-primary",
  "--el-font-weight-primary",
  "--el-transition-function-ease-in-out-bezier",
  "--el-border-radius-base",
  "--el-border-radius-small",
  "--el-font-size-base",
  "--el-font-size-small",
  "--el-font-size-extra-small",
  "--el-font-size-large",
  "--el-font-size-extra-large",
  "--el-font-size-base",
  "--el-font-line-height-primary",
  "--el-fill-color-blank",
  "--el-color-primary",
  "--el-color-primary-light-3",
  "--el-color-primary-dark-2",
  "--el-color-primary-light-3",
  "--el-color-info",
  "--el-color-info-light-3",
  "--el-color-info-dark-2",
  "--el-color-info-light-3",
  "--el-color-success",
  "--el-color-success-light-3",
  "--el-color-success-dark-2",
  "--el-color-success-light-3",
  "--el-color-warning",
  "--el-color-warning-light-3",
  "--el-color-warning-dark-2",
  "--el-color-warning-light-3",
  "--el-color-danger",
  "--el-color-danger-light-3",
  "--el-color-danger-dark-2",
  "--el-color-danger-light-3",
  "--el-fill-color-light",
  "--el-border-color",
  "--el-text-color-primary",
  "--el-text-color-regular",
  "--el-text-color-regular",
  "--el-text-color-regular",
  "--el-text-color-disabled",
  "--el-text-color-placeholder",
  "--el-text-color-disabled",
  "--el-text-color-disabled",
  "--el-box-shadow-light",
  "--el-box-shadow",
  "--el-box-shadow-dark"
]
const styleName = [
  "fontFamily",
  "fontFamilyMono",
  "fontWeight",
  "fontWeightStrong",
  "cubicBezierEaseInOut",
  "borderRadius",
  "borderRadiusSmall",
  "fontSize",
  "fontSizeMini",
  "fontSizeTiny",
  "fontSizeLarge",
  "fontSizeHuge",
  "fontSizeMedium",
  "lineHeight",
  "baseColor",
  "primaryColor",
  "primaryColorHover",
  "primaryColorPressed",
  "primaryColorSuppl",
  "infoColor",
  "infoColorHover",
  "infoColorPressed",
  "infoColorSuppl",
  "successColor",
  "successColorHover",
  "successColorPressed",
  "successColorSuppl",
  "warningColor",
  "warningColorHover",
  "warningColorPressed",
  "warningColorSuppl",
  "errorColor",
  "errorColorHover",
  "errorColorPressed",
  "errorColorSuppl",
  "dividerColor",
  "borderColor",
  "textColorBase",
  "textColor1",
  "textColor2",
  "textColor3",
  "textColorDisabled",
  "placeholderColor",
  "placeholderColorDisabled",
  "iconColor",
  "boxShadow1",
  "boxShadow2",
  "boxShadow3"
]
const theme: GlobalThemeOverrides = reactive({
  common: {}
})
styleName.forEach((tag, index) => {
  //@ts-ignore
  theme.common[tag] = getComputedStyle(document.documentElement).getPropertyValue(cssVarName[index]).trim()
})
</script>

<template>
  <n-config-provider :locale="nZhCn" :date-locale="nDateZhCN" class="w-full h-full" :theme-overrides="theme"
    :katex="(katex as any)" :hljs="hljs">
    <n-global-style />
    <el-config-provider :locale="elZhCn">
      <router-view></router-view>
    </el-config-provider>
  </n-config-provider>
</template>