<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchPublicArticlesByCategorySlug } from '@/api/modules/categories';
import { useSiteStore } from '@/stores/site';
import ArticleCard from '@/components/blog/ArticleCard.vue';
import PaginationBar from '@/components/blog/PaginationBar.vue';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const route = useRoute();
const siteStore = useSiteStore();

const category = ref(null);
const list = ref([]);
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
const loading = ref(false);
const error = ref('');

const heroStats = computed(() => [
  { label: '文章总数', value: pagination.value.total || 0 },
  { label: '当前页', value: pagination.value.page || 1 }
]);

async function loadData(page = 1) {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchPublicArticlesByCategorySlug(route.params.slug, { page, pageSize: 10 });
    category.value = data.category;
    list.value = data.items || [];
    pagination.value = data.pagination || pagination.value;
    document.title = `${siteStore.siteName} - 分类：${data.category?.name || ''}`;
  } catch (err) {
    error.value = err.message || '分类文章加载失败';
    category.value = null;
    list.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadData(1);
});

watch(
  () => route.params.slug,
  () => {
    loadData(1);
  }
);

function handlePageChange(page) {
  loadData(page);
}
</script>

<template>
  <section class="space-y-6">
    <PageHero
      :title="`分类：${category?.name || route.params.slug}`"
      :description="category?.description || '该分类下的已发布文章列表'"
      badge="Category"
      :stats="heroStats"
    />

    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!list.length"
      empty-text="该分类暂无文章"
      @retry="loadData(1)"
    >
      <div class="space-y-4">
        <ArticleCard v-for="article in list" :key="article.id" :article="article" />
      </div>

      <div class="mt-6" v-if="pagination.total > pagination.pageSize">
        <PaginationBar
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @change="handlePageChange"
        />
      </div>
    </StateBlock>
  </section>
</template>
