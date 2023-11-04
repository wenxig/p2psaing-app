<script setup lang='ts'>
import { isEmpty } from 'lodash-es';
import { reactive, ref } from 'vue';

const server = window.useServer()
const props = defineProps<{
  one: boolean
}>()

const isSearch = ref(false)
let results: User.WebDbSave[] = reactive([])
async function search(value: number) {
  isSearch.value = false
  if (props.one) {
    results.splice(0);
    let data = JSON.parse((await server.do({
      action: 'get',
      tag: value
    })).data[value]) as User.WebDbSave
    if (data as any != 'null' && data as any != null) {
      results.push(data)
      return results
    }
  }
  isSearch.value = true
}

defineExpose({
  search
})
</script>

<template>
  <div class="!w-full">
    <n-scrollbar class="!h-[15%] !w-full">
      <n-thing v-for="user in results" class="!w-full border rounded-lg pl-1">
        <template #avatar>
          <el-image :src="isEmpty(user.img) ? '/userIcon.png' : user.img" class="block rounded-xl !w-20" fit="cover">
            <template #error>
              <div
                class="flex w-full h-full justify-center items-center bg-[var(--el-fill-color-light)] text-2xl text-[var(--el-text-color-secondary)]">
                <el-icon class="!text-2xl"><i-ep-Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
        <template #header>
          {{ user.name }}
        </template>
        <template #description>
          {{ user.email }}
        </template>
      </n-thing>
    </n-scrollbar>
    <div v-if="isEmpty(results) && isSearch" class="w-full flex justify-center text-[var(--el-color-info)]">没有搜索结果</div>
  </div>
</template>

<style scoped lang='scss'>
:global(.el-card__body) {
  padding: 0% !important;
}

:global(.n-thing-avatar) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0 !important;
}
</style>