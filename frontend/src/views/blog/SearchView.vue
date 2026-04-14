<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  router.replace({
    name: 'home',
    query: {
      ...route.query
    }
  });
});
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
    正在跳转到首页搜索...
  </section>
</template>
