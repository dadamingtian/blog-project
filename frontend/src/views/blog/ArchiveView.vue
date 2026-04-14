<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fetchArchiveList } from '@/api/modules/articles';
import { useSiteStore } from '@/stores/site';
import { formatDate } from '@/utils/format';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const siteStore = useSiteStore();

const groups = ref([]);
const loading = ref(false);
const error = ref('');

const totalCount = computed(() => groups.value.reduce((sum, group) => sum + Number(group.count || 0), 0));

const heroStats = computed(() => [
  { label: '归档月份', value: groups.value.length },
  { label: '归档文章', value: totalCount.value }
]);

function monthLabel(year, month) {
  return `${year} 年 ${String(month).padStart(2, '0')} 月`;
}

async function loadArchive() {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchArchiveList();
    groups.value = data || [];
  } catch (err) {
    error.value = err.message || '归档加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadArchive();
});

watch(
  () => siteStore.siteName,
  (name) => {
    document.title = `${name} - 归档`;
  },
  { immediate: true }
);
</script>

<template>
  <section class="space-y-6">
    <PageHero
      title="归档"
      description="按年月查看已发布文章，回顾持续积累的内容轨迹。"
      badge="Archive"
      :stats="heroStats"
    />

    <StateBlock :loading="loading" :error="error" :empty="!groups.length" empty-text="暂无归档数据" @retry="loadArchive">
      <div class="space-y-5">
        <section
          v-for="group in groups"
          :key="`${group.year}-${group.month}`"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-lg font-semibold text-slate-900">
            {{ monthLabel(group.year, group.month) }}
            <span class="ml-2 text-sm text-slate-500">({{ group.count }})</span>
          </h2>

          <ul class="mt-4 space-y-3">
            <li v-for="item in group.items" :key="item.slug" class="flex items-center justify-between gap-3">
              <RouterLink :to="{ name: 'article-detail', params: { slug: item.slug } }" class="text-slate-700 transition hover:text-brand">
                {{ item.title }}
              </RouterLink>
              <span class="text-xs text-slate-400">{{ formatDate(item.publishedAt) }}</span>
            </li>
          </ul>
        </section>
      </div>
    </StateBlock>
  </section>
</template>
