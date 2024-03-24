<script setup lang='ts'>
import round from "lodash-es/round";
import style from "./atricle.c.css?raw";
import { marked } from 'marked'
const TOPBAR_HEIGHT = 30;
const height = round((window.screen.availHeight / 3) * 2);
const width = round((window.screen.availWidth / 5) * 2);
window.ipc.setResizable(true)
window.ipc.setSize({ width, height })
window.ipc.toTop()

const md = marked(window.props.main, {
  gfm: true,
  breaks: true,
  async: false
});
const dom = `
<!DOCTYPE html>
<html lang="zh-CN" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
  ${style}
  </style>
</head>
<body class="ck-content markdown-body">${md}</body>
</html>
`
</script>

<template>
  <div class="w-full h-full overflow-hidden select-none">
    <div class="w-full flex region-drag items-center" :style="{
      height: `${TOPBAR_HEIGHT}px`
    }">
      <Control :maxsize="false" />
    </div>
    <iframe :srcdoc="dom" frameborder="0" class="w-full" :style="{
      height: `calc(100vh - ${TOPBAR_HEIGHT}px)`
    }"></iframe>
  </div>
</template>