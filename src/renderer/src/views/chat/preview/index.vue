<script setup lang='ts'>
import ImgPerview from './img.c.vue';
import CodePerview from './code.c.vue';
import VideoPerview from './video.c.vue';
import ArticlePerview from './article.c.vue';
</script>

<template>
  <ImgPerview v-if="$route.params.type == 'image'" />
  <CodePerview v-if="$route.params.type == 'code'" />
  <VideoPerview v-if="$route.params.type == 'video'" />
  <ArticlePerview v-if="$route.params.type == 'article'" />
</template>