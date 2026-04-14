<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchPublicArticleBySlug } from '@/api/modules/articles';
import { createPublicComment, fetchPublicCommentsByArticleId } from '@/api/modules/comments';
import { useSiteStore } from '@/stores/site';
import { formatDateTime } from '@/utils/format';
import MarkdownContent from '@/components/blog/MarkdownContent.vue';
import StateBlock from '@/components/blog/StateBlock.vue';

const route = useRoute();
const siteStore = useSiteStore();

const article = ref(null);
const loading = ref(false);
const error = ref('');

const commentLoading = ref(false);
const commentSubmitting = ref(false);
const comments = ref([]);

const commentFormRef = ref();
const commentForm = reactive({
  nickname: '',
  email: '',
  website: '',
  content: ''
});

const commentRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 64, message: '昵称长度需在 2-64 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  website: [{ max: 200, message: '网站链接最多 200 个字符', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 2, max: 1000, message: '评论长度需在 2-1000 个字符', trigger: 'blur' }
  ]
};

async function loadArticle() {
  loading.value = true;
  error.value = '';
  article.value = null;

  try {
    const data = await fetchPublicArticleBySlug(route.params.slug);
    article.value = data;
    document.title = `${data.seoTitle || data.title} - ${siteStore.siteName}`;

    const descriptionContent = data.seoDescription || data.summary || '';
    if (descriptionContent) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', descriptionContent);
    }

    await loadComments();
  } catch (err) {
    error.value = err.message || '文章加载失败';
    document.title = `${siteStore.siteName} - 文章`;
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  if (!article.value?.id) {
    comments.value = [];
    return;
  }

  commentLoading.value = true;
  try {
    comments.value = await fetchPublicCommentsByArticleId(article.value.id);
  } catch {
    comments.value = [];
  } finally {
    commentLoading.value = false;
  }
}

async function handleCommentSubmit() {
  if (!article.value?.id || !commentFormRef.value) return;

  const valid = await commentFormRef.value.validate().catch(() => false);
  if (!valid) return;

  commentSubmitting.value = true;
  try {
    const data = await createPublicComment({
      article: article.value.id,
      nickname: commentForm.nickname.trim(),
      email: commentForm.email.trim(),
      website: commentForm.website.trim(),
      content: commentForm.content.trim()
    });

    const tip = data?.status === 'approved' ? '评论已发布' : '评论已提交，等待审核';
    ElMessage.success(tip);
    commentForm.nickname = '';
    commentForm.email = '';
    commentForm.website = '';
    commentForm.content = '';
    await loadComments();
  } catch (err) {
    ElMessage.error(err.message || '评论提交失败');
  } finally {
    commentSubmitting.value = false;
  }
}

onMounted(() => {
  siteStore.loadSiteConfig();
  loadArticle();
});

watch(
  () => route.params.slug,
  () => {
    loadArticle();
  }
);
</script>

<template>
  <StateBlock
    :loading="loading"
    :error="error"
    :empty="!article"
    empty-text="文章不存在或已下线"
    @retry="loadArticle"
  >
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-bold leading-tight text-slate-900">{{ article.title }}</h1>

      <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>发布时间 {{ formatDateTime(article.publishedAt || article.createdAt) }}</span>
        <span>阅读 {{ article.viewCount || 0 }}</span>
        <RouterLink
          v-if="article.category"
          :to="{ name: 'category-articles', params: { slug: article.category.slug } }"
          class="hover:text-brand"
        >
          分类：{{ article.category.name }}
        </RouterLink>
      </div>

      <div v-if="article.tags?.length" class="mt-4 flex flex-wrap gap-2">
        <RouterLink v-for="tag in article.tags" :key="tag.id" :to="{ name: 'tag-articles', params: { slug: tag.slug } }">
          <el-tag size="small" round effect="plain"># {{ tag.name }}</el-tag>
        </RouterLink>
      </div>

      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        alt="cover"
        class="mt-6 max-h-[420px] w-full rounded-xl object-cover"
      >

      <div class="mt-8">
        <MarkdownContent :content="article.content" />
      </div>

      <div class="mt-8 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <RouterLink
          v-if="article.previousArticle"
          :to="{ name: 'article-detail', params: { slug: article.previousArticle.slug } }"
          class="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand"
        >
          <p class="text-xs text-slate-500">上一篇</p>
          <p class="mt-1 text-slate-800">{{ article.previousArticle.title }}</p>
        </RouterLink>
        <div v-else class="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-400">暂无上一篇</div>

        <RouterLink
          v-if="article.nextArticle"
          :to="{ name: 'article-detail', params: { slug: article.nextArticle.slug } }"
          class="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand"
        >
          <p class="text-xs text-slate-500">下一篇</p>
          <p class="mt-1 text-slate-800">{{ article.nextArticle.title }}</p>
        </RouterLink>
        <div v-else class="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-400">暂无下一篇</div>
      </div>
    </article>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-slate-900">评论</h2>

      <el-form ref="commentFormRef" :model="commentForm" :rules="commentRules" label-position="top" class="mt-4">
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="commentForm.nickname" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="commentForm.email" placeholder="请输入邮箱" />
          </el-form-item>
        </div>

        <el-form-item label="网站" prop="website">
          <el-input v-model="commentForm.website" placeholder="可选" />
        </el-form-item>

        <el-form-item label="评论内容" prop="content">
          <el-input v-model="commentForm.content" type="textarea" :rows="4" placeholder="请输入评论内容" />
        </el-form-item>

        <el-button type="primary" :loading="commentSubmitting" @click="handleCommentSubmit">
          提交评论
        </el-button>
      </el-form>

      <div class="mt-6" v-loading="commentLoading">
        <el-empty v-if="!comments.length" description="暂无评论" />

        <div v-else class="space-y-4">
          <article v-for="item in comments" :key="item.id" class="rounded-lg border border-slate-200 p-4">
            <div class="flex items-center justify-between">
              <p class="font-medium text-slate-900">{{ item.nickname }}</p>
              <p class="text-xs text-slate-500">{{ formatDateTime(item.createdAt) }}</p>
            </div>
            <p class="mt-2 whitespace-pre-line text-sm text-slate-700">{{ item.content }}</p>
          </article>
        </div>
      </div>
    </section>
  </StateBlock>
</template>
