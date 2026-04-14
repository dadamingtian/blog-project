<script setup>
import { Search } from '@element-plus/icons-vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchPublicArticles, fetchPublicHotArticles, searchPublicArticles } from '@/api/modules/articles';
import { useSiteStore } from '@/stores/site';
import { formatDate } from '@/utils/format';
import ArticleCard from '@/components/blog/ArticleCard.vue';
import PaginationBar from '@/components/blog/PaginationBar.vue';
import StateBlock from '@/components/blog/StateBlock.vue';
import PageHero from '@/components/blog/PageHero.vue';

const route = useRoute();
const router = useRouter();
const siteStore = useSiteStore();

const keywordInput = ref('');
const activeKeyword = ref('');

const list = ref([]);
const hotList = ref([]);
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 1 });

const loading = ref(false);
const hotLoading = ref(false);
const error = ref('');
const hotError = ref('');

const contentScrollStyle = computed(() => ({
  maxHeight: 'calc(100vh - 336px)'
}));

const isSearchMode = computed(() => Boolean(activeKeyword.value));

const heroStats = computed(() => [
  { label: '当前列表', value: isSearchMode.value ? '搜索结果' : '全部文章' },
  { label: '文章数量', value: pagination.value.total || 0 }
]);

function normalizePage(pageValue) {
  const page = Number(pageValue || 1);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function readQuery() {
  return {
    keyword: String(route.query.keyword || '').trim(),
    page: normalizePage(route.query.page)
  };
}

async function loadArticlesByQuery() {
  const { keyword, page } = readQuery();
  activeKeyword.value = keyword;
  keywordInput.value = keyword;

  loading.value = true;
  error.value = '';

  try {
    const data = keyword
      ? await searchPublicArticles({ keyword, page, pageSize: 10 })
      : await fetchPublicArticles({ page, pageSize: 10 });

    list.value = data.items || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err.message || (keyword ? '搜索结果加载失败' : '文章加载失败');
    list.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadHotArticles() {
  hotLoading.value = true;
  hotError.value = '';

  try {
    const data = await fetchPublicHotArticles({ page: 1, pageSize: 8 });
    hotList.value = [...(data.items || [])].sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0));
  } catch (err) {
    hotError.value = err.message || '热门文章加载失败';
  } finally {
    hotLoading.value = false;
  }
}

function goQuery(keyword, page = 1) {
  const value = String(keyword || '').trim();
  router.push({
    name: 'home',
    query: value
      ? {
          keyword: value,
          page
        }
      : {}
  });
}

function handleSearch() {
  goQuery(keywordInput.value, 1);
}

function handleClearSearch() {
  keywordInput.value = '';
  goQuery('', 1);
}

function handlePageChange(page) {
  goQuery(activeKeyword.value, page);
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadHotArticles();
});

watch(
  () => route.query,
  () => {
    loadArticlesByQuery();
  },
  { immediate: true, deep: true }
);

watch(
  () => siteStore.siteName,
  (name) => {
    document.title = `${name} - 首页`;
  },
  { immediate: true }
);

watch(
  () => siteStore.config,
  (config) => {
    if (!config) return;

    if (config.seoTitle) {
      document.title = config.seoTitle;
    }

    const descriptionContent = config.seoDescription || config.siteDescription || '';
    if (descriptionContent) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', descriptionContent);
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <section class="space-y-6">
    <PageHero
      :title="siteStore.siteName"
      :description="siteStore.config?.siteDescription || '记录技术与生活，持续输出与沉淀。'"
      badge="Home"
      :stats="heroStats"
    >
      <template #actions>
        <div class="mode-panel">
          <div class="mode-dot"></div>
          <div class="min-w-0">
            <p class="mode-title">{{ isSearchMode ? '搜索模式' : '全部文章' }}</p>
            <p class="mode-subtitle" :title="isSearchMode ? `关键词：${activeKeyword}` : '按发布时间倒序展示最新发布内容'">
              {{ isSearchMode ? `关键词：${activeKeyword}` : '按发布时间倒序展示最新发布内容' }}
            </p>
          </div>
          <span class="mode-badge">{{ isSearchMode ? 'Search' : 'Feed' }}</span>
        </div>
      </template>

      <template #footer>
        <div class="mt-1 flex flex-wrap gap-3">
          <el-input
            v-model="keywordInput"
            class="max-w-2xl flex-1"
            placeholder="输入标题、摘要或正文关键词，回车搜索"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClearSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" class="!px-6" @click="handleSearch">搜索</el-button>
          <el-button v-if="isSearchMode" plain @click="handleClearSearch">清空筛选</el-button>
        </div>

        <transition name="fade-slide">
          <p v-if="isSearchMode" class="mt-3 text-sm text-slate-500">
            关键词 “{{ activeKeyword }}” 共找到 {{ pagination.total }} 篇文章
          </p>
        </transition>
      </template>
    </PageHero>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <StateBlock
          :loading="loading"
          :error="error"
          :empty="!list.length"
          :empty-text="isSearchMode ? '未找到匹配文章，请换个关键词试试' : '暂无已发布文章'"
          @retry="loadArticlesByQuery"
        >
          <div class="overflow-y-auto pr-1" :style="contentScrollStyle">
            <transition-group name="card-list" tag="div" class="space-y-4">
              <ArticleCard v-for="article in list" :key="article.id" :article="article" />
            </transition-group>
          </div>

          <div v-if="pagination.total > pagination.pageSize" class="mt-6 border-t border-slate-100 pt-4">
            <PaginationBar
              :page="pagination.page"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              @change="handlePageChange"
            />
          </div>
        </StateBlock>
      </section>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:sticky lg:top-24">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">热门文章</h2>
          <span class="text-xs text-slate-400">按浏览量</span>
        </div>

        <el-skeleton v-if="hotLoading" :rows="6" animated />
        <el-result v-else-if="hotError" icon="error" title="加载失败" :sub-title="hotError" />
        <el-empty v-else-if="!hotList.length" description="暂无热门文章" />

        <ol v-else class="space-y-2">
          <li
            v-for="(item, index) in hotList"
            :key="item.id"
            class="rounded-lg border border-slate-100 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
          >
            <RouterLink :to="{ name: 'article-detail', params: { slug: item.slug } }" class="block">
              <div class="flex items-start justify-between gap-3">
                <span class="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-slate-100 px-1 text-xs text-slate-600">
                  {{ index + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="line-clamp-1 text-sm font-medium text-slate-800 transition hover:text-brand">{{ item.title }}</p>
                  <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{{ formatDate(item.publishedAt || item.createdAt) }}</span>
                    <span>浏览 {{ item.viewCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.mode-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: min(100%, 380px);
  border: 1px solid rgba(15, 118, 110, 0.25);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.95), rgba(236, 253, 245, 0.9));
  box-shadow: 0 10px 24px -20px rgba(5, 150, 105, 0.5);
  padding: 10px 12px;
}

.mode-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #14b8a6;
  box-shadow: 0 0 0 5px rgba(20, 184, 166, 0.18);
  animation: pulseDot 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

.mode-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f766e;
}

.mode-subtitle {
  margin: 2px 0 0;
  color: #0f766e;
  opacity: 0.85;
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-badge {
  margin-left: auto;
  border-radius: 999px;
  border: 1px solid rgba(15, 118, 110, 0.3);
  background: rgba(255, 255, 255, 0.72);
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 10px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.25s ease;
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes pulseDot {
  0% {
    transform: scale(1);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.95;
  }
}

@media (max-width: 768px) {
  .mode-panel {
    min-width: 0;
    width: 100%;
  }
}
</style>
