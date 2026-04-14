<script setup>
import { View } from '@element-plus/icons-vue';
import { computed } from 'vue';
import { formatDate } from '@/utils/format';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});

const publishTime = computed(() => props.article.publishedAt || props.article.createdAt);
const readingMinutes = computed(() => {
  const content = props.article?.content || '';
  if (!content) return 1;
  const plainLength = String(content).replace(/\s+/g, '').length;
  return Math.max(1, Math.round(plainLength / 420));
});
</script>

<template>
  <article class="article-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
      <div class="flex min-w-0 items-center gap-2">
        <el-tag v-if="article.isTop" size="small" type="danger" effect="light">置顶</el-tag>
        <span>{{ formatDate(publishTime) }}</span>
        <span>/</span>
        <span>{{ readingMinutes }} 分钟阅读</span>
        <span v-if="article.category">/</span>
        <RouterLink
          v-if="article.category"
          :to="{ name: 'category-articles', params: { slug: article.category.slug } }"
          class="truncate transition hover:text-brand"
        >
          {{ article.category.name }}
        </RouterLink>
      </div>

      <div class="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
        <el-icon><View /></el-icon>
        <span class="font-medium">{{ article.viewCount || 0 }}</span>
      </div>
    </div>

    <RouterLink :to="{ name: 'article-detail', params: { slug: article.slug } }" class="group block">
      <h2 class="text-xl font-semibold text-slate-900 transition duration-200 group-hover:text-brand">
        {{ article.title }}
      </h2>
    </RouterLink>

    <p v-if="article.summary" class="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
      {{ article.summary }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <RouterLink
        v-for="tag in article.tags"
        :key="tag.id"
        :to="{ name: 'tag-articles', params: { slug: tag.slug } }"
      >
        <el-tag size="small" effect="plain" round># {{ tag.name }}</el-tag>
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.article-card::after {
  content: '';
  position: absolute;
  right: -26px;
  top: -26px;
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15, 118, 110, 0.12), transparent 70%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.22s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.3);
  box-shadow: 0 14px 30px -22px rgba(15, 23, 42, 0.48);
}

.article-card:hover::after {
  opacity: 1;
}
</style>
