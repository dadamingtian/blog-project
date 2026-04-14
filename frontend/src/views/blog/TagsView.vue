<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fetchPublicTags } from '@/api/modules/tags';
import { useSiteStore } from '@/stores/site';
import TagList from '@/components/blog/TagList.vue';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const siteStore = useSiteStore();

const tags = ref([]);
const loading = ref(false);
const error = ref('');

const heroStats = computed(() => [
  { label: '标签数量', value: tags.value.length },
  {
    label: '平均文章数',
    value: tags.value.length
      ? (tags.value.reduce((sum, item) => sum + Number(item.articleCount || 0), 0) / tags.value.length).toFixed(1)
      : 0
  }
]);

async function loadTags() {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchPublicTags({ page: 1, pageSize: 50 });
    tags.value = data.items || [];
  } catch (err) {
    error.value = err.message || '标签加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadTags();
});

watch(
  () => siteStore.siteName,
  (name) => {
    document.title = `${name} - 标签`;
  },
  { immediate: true }
);
</script>

<template>
  <section class="space-y-6">
    <PageHero
      title="标签"
      description="通过标签快速定位主题内容，横向阅读同类文章。"
      badge="Tags"
      :stats="heroStats"
    />

    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!tags.length"
      empty-text="暂无标签"
      @retry="loadTags"
    >
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TagList :tags="tags" />
      </div>
    </StateBlock>
  </section>
</template>
