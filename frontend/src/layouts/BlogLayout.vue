<script setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSiteStore } from '@/stores/site';
import DynamicBackground from '@/components/blog/DynamicBackground.vue';

const siteStore = useSiteStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  siteStore.loadSiteConfig();
});

const navItems = [
  { label: '首页', path: '/' },
  { label: '分类', path: '/categories' },
  { label: '标签', path: '/tags' },
  { label: '归档', path: '/archive' },
  { label: '关于', path: '/about' }
];

const isHomePath = computed(() => route.path === '/');

function isNavActive(path) {
  const currentPath = route.path;

  if (path === '/') {
    return currentPath === '/';
  }

  if (path === '/categories') {
    return currentPath === '/categories' || currentPath.startsWith('/category/');
  }

  if (path === '/tags') {
    return currentPath === '/tags' || currentPath.startsWith('/tag/');
  }

  if (path === '/archive') {
    return currentPath === '/archive';
  }

  if (path === '/about') {
    return currentPath === '/about';
  }

  return currentPath.startsWith(path);
}

function navLinkClass(path, isMobile = false) {
  const active = isNavActive(path);

  if (isMobile) {
    return [
      'rounded-full border px-3 py-1.5 transition',
      active
        ? 'border-brand/50 bg-brand/10 text-brand'
        : 'border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand'
    ];
  }

  return [
    'rounded-lg px-3 py-1.5 transition duration-200',
    active ? 'bg-brand/10 text-brand shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-brand'
  ];
}

function handleBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/');
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col text-slate-800">
    <DynamicBackground />

    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div class="flex min-w-0 items-center gap-2 md:gap-3">
          <el-button
            v-if="!isHomePath"
            :icon="ArrowLeft"
            text
            class="!px-2"
            @click="handleBack"
          >
            返回
          </el-button>
          <RouterLink to="/" class="truncate text-lg font-bold tracking-wide text-slate-900">
            {{ siteStore.siteName }}
          </RouterLink>
        </div>

        <nav class="hidden items-center gap-2 text-sm md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="navLinkClass(item.path)"
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            to="/admin/login"
            class="ml-2 rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark"
          >
            后台管理
          </RouterLink>
        </nav>
      </div>

      <div class="border-t border-slate-100 bg-white/70 px-4 py-2 md:hidden">
        <div class="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto whitespace-nowrap text-xs">
          <RouterLink
            v-for="item in navItems"
            :key="`mobile-${item.path}`"
            :to="item.path"
            :class="navLinkClass(item.path, true)"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="mt-auto border-t border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto w-full max-w-6xl px-4 py-8 text-center text-sm text-slate-500">
        <p>{{ siteStore.config?.siteDescription || '记录技术与生活，沉淀思考与实践。' }}</p>
        <p class="mt-2">© {{ new Date().getFullYear() }} {{ siteStore.siteName }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.24s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
