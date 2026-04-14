<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fetchPublicCategories } from '@/api/modules/categories';
import { useSiteStore } from '@/stores/site';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const siteStore = useSiteStore();

const categories = ref([]);
const loading = ref(false);
const error = ref('');

const totalArticles = computed(() =>
  categories.value.reduce((sum, item) => sum + Number(item.articleCount || 0), 0)
);

const heroStats = computed(() => [
  { label: '分类数量', value: categories.value.length },
  { label: '文章总数', value: totalArticles.value }
]);

async function loadCategories() {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchPublicCategories({ page: 1, pageSize: 50 });
    categories.value = data.items || [];
  } catch (err) {
    error.value = err.message || '分类加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadCategories();
});

watch(
  () => siteStore.siteName,
  (name) => {
    document.title = `${name} - 分类`;
  },
  { immediate: true }
);
</script>

<template>
  <section class="space-y-6">
    <PageHero
      title="分类"
      description="按主题浏览文章，快速进入你关注的技术方向。"
      badge="Categories"
      :stats="heroStats"
    />

    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!categories.length"
      empty-text="暂无分类"
      @retry="loadCategories"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="category in categories"
          :key="category.id"
          :to="{ name: 'category-articles', params: { slug: category.slug } }"
          class="category-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-lg font-semibold text-slate-900">{{ category.name }}</h2>
          <p class="mt-2 line-clamp-2 text-sm text-slate-600">{{ category.description || '暂无分类描述' }}</p>
          <p class="mt-4 text-xs text-slate-400">{{ category.articleCount }} 篇文章</p>
        </RouterLink>
      </div>
    </StateBlock>
  </section>
</template>

<style scoped>
.category-card {
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 14px 28px -20px rgba(15, 23, 42, 0.45);
}
</style>
