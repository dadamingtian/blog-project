<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fetchPublicSiteConfig } from '@/api/modules/site';
import { useSiteStore } from '@/stores/site';
import MarkdownContent from '@/components/blog/MarkdownContent.vue';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const siteStore = useSiteStore();

const config = ref(null);
const loading = ref(false);
const error = ref('');

const heroStats = computed(() => [
  { label: '社交链接', value: config.value?.socialLinks?.length || 0 },
  { label: '关于内容', value: config.value?.aboutContent ? '已配置' : '待完善' }
]);

async function loadData() {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchPublicSiteConfig();
    config.value = data;
  } catch (err) {
    error.value = err.message || '关于信息加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadData();
});

watch(
  () => siteStore.siteName,
  (name) => {
    document.title = `${name} - 关于`;
  },
  { immediate: true }
);
</script>

<template>
  <section class="space-y-6">
    <PageHero
      title="关于"
      description="关于站点与作者的介绍，包含个人说明与外部链接。"
      badge="About"
      :stats="heroStats"
    />

    <StateBlock :loading="loading" :error="error" :empty="!config" empty-text="暂无关于信息" @retry="loadData">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-4">
          <el-avatar :size="64" :src="config.avatar">
            {{ (config.siteName || 'B').slice(0, 1) }}
          </el-avatar>
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ config.siteName }}</h2>
            <p class="mt-1 text-sm text-slate-600">{{ config.siteDescription || '专注技术记录与实践分享。' }}</p>
          </div>
        </div>

        <div v-if="config.aboutContent" class="border-t border-slate-100 pt-5">
          <MarkdownContent :content="config.aboutContent" />
        </div>

        <div v-if="config.socialLinks?.length" class="mt-6 border-t border-slate-100 pt-5">
          <h3 class="mb-3 text-base font-semibold text-slate-900">社交链接</h3>
          <div class="flex flex-wrap gap-3">
            <a
              v-for="item in config.socialLinks"
              :key="`${item.name}-${item.url}`"
              :href="item.url"
              target="_blank"
              rel="noreferrer"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand hover:text-brand"
            >
              {{ item.name }}
            </a>
          </div>
        </div>
      </div>
    </StateBlock>
  </section>
</template>
