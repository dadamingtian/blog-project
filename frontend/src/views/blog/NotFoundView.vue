<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  document.title = '404 - Page Not Found';

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', 'The page you are looking for does not exist.');
});
</script>

<template>
  <div class="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
    <h1 class="text-4xl font-bold text-slate-800">404</h1>
    <p class="mt-3 text-slate-600">The page you visited does not exist.</p>
    <el-button class="mt-6" type="primary" @click="router.push('/')">Back to Home</el-button>
  </div>
</template>
