<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import MarkdownEditor from '@/components/admin/MarkdownEditor.vue';
import { createAdminArticle, fetchAdminArticleById, updateAdminArticle } from '@/api/modules/admin/articles';
import { fetchAdminCategories } from '@/api/modules/admin/categories';
import { fetchAdminTags } from '@/api/modules/admin/tags';
import { uploadAdminImage } from '@/api/modules/admin/upload';

const props = defineProps({
  mode: {
    type: String,
    default: 'create'
  }
});

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => props.mode === 'edit');
const loading = ref(false);
const submitting = ref(false);
const uploadingCover = ref(false);
const formRef = ref();

const categoryOptions = ref([]);
const tagOptions = ref([]);

const form = reactive({
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  status: 'draft',
  category: null,
  tags: [],
  isTop: false,
  seoTitle: '',
  seoDescription: ''
});

const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度应为 1-200 个字符', trigger: 'blur' }
  ],
  slug: [{ min: 1, max: 220, message: '文章别名长度应为 1-220 个字符', trigger: 'blur' }],
  summary: [{ max: 500, message: '摘要最多 500 个字符', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'change' }],
  coverImage: [{ max: 500, message: '封面链接最多 500 个字符', trigger: 'blur' }],
  category: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  seoTitle: [{ max: 200, message: 'SEO 标题最多 200 个字符', trigger: 'blur' }],
  seoDescription: [{ max: 300, message: 'SEO 描述最多 300 个字符', trigger: 'blur' }]
};

function toPayload(statusOverride) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    summary: form.summary.trim(),
    content: form.content,
    coverImage: form.coverImage.trim(),
    status: statusOverride || form.status,
    category: form.category,
    tags: form.tags,
    isTop: Boolean(form.isTop),
    seoTitle: form.seoTitle.trim(),
    seoDescription: form.seoDescription.trim()
  };
}

async function loadOptions() {
  const [categoryRes, tagRes] = await Promise.all([
    fetchAdminCategories({ page: 1, pageSize: 50 }),
    fetchAdminTags({ page: 1, pageSize: 50 })
  ]);

  categoryOptions.value = categoryRes.items || [];
  tagOptions.value = tagRes.items || [];
}

function patchForm(data) {
  form.title = data.title || '';
  form.slug = data.slug || '';
  form.summary = data.summary || '';
  form.content = data.content || '';
  form.coverImage = data.coverImage || '';
  form.status = data.status || 'draft';
  form.category = data.category?.id || null;
  form.tags = (data.tags || []).map((item) => item.id);
  form.isTop = Boolean(data.isTop);
  form.seoTitle = data.seoTitle || '';
  form.seoDescription = data.seoDescription || '';
}

async function loadEditData() {
  if (!isEdit.value) return;

  const id = route.params.id;
  if (!id) {
    ElMessage.error('缺少文章 ID');
    router.replace('/admin/articles');
    return;
  }

  const data = await fetchAdminArticleById(id);
  patchForm(data);
}

function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('仅支持 JPG / PNG / WEBP / GIF 格式图片');
    return false;
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB');
    return false;
  }

  return true;
}

function resolveUploadUrl(uploadData) {
  if (uploadData?.url) return uploadData.url;
  if (uploadData?.path && uploadData.path.startsWith('/')) {
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    if (/^https?:\/\//i.test(apiBaseURL)) {
      const origin = new URL(apiBaseURL).origin;
      return `${origin}${uploadData.path}`;
    }
    return uploadData.path;
  }
  return '';
}

async function uploadImage(file) {
  if (!validateImageFile(file)) {
    throw new Error('图片校验失败，请更换文件后重试');
  }

  const data = await uploadAdminImage(file);
  const imageUrl = resolveUploadUrl(data);

  if (!imageUrl) {
    throw new Error('上传接口返回数据异常');
  }

  return imageUrl;
}

async function handleCoverUpload(option) {
  const { file } = option;
  uploadingCover.value = true;
  try {
    const coverUrl = await uploadImage(file);
    form.coverImage = coverUrl;
    ElMessage.success('封面上传成功');
  } catch (err) {
    ElMessage.error(err.message || '封面上传失败');
  } finally {
    uploadingCover.value = false;
  }
}

async function handleInlineImageUpload(file) {
  return uploadImage(file);
}

async function submit(statusOverride) {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const payload = toPayload(statusOverride);

    if (isEdit.value) {
      await updateAdminArticle(route.params.id, payload);
      ElMessage.success(statusOverride === 'published' ? '文章发布成功' : '文章保存成功');
    } else {
      await createAdminArticle(payload);
      ElMessage.success(statusOverride === 'published' ? '文章发布成功' : '文章创建成功');
    }

    router.push('/admin/articles');
  } catch (err) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

function saveDraft() {
  submit('draft');
}

function publishArticle() {
  submit('published');
}

function handleContentChange(content) {
  form.content = content;
  nextTick(() => {
    formRef.value?.validateField('content').catch(() => {});
  });
}

onMounted(async () => {
  document.title = isEdit.value ? '博客后台管理 - 编辑文章' : '博客后台管理 - 新建文章';

  loading.value = true;
  try {
    await loadOptions();
    await loadEditData();
  } catch (err) {
    ElMessage.error(err.message || '加载页面数据失败');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section>
    <AdminPageHeader
      :title="isEdit ? '编辑文章' : '新建文章'"
      description="支持 Markdown 编辑、封面上传、分类标签管理与 SEO 基础配置。"
    />

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="文章别名" prop="slug">
          <el-input v-model="form.slug" placeholder="可选，不填写会自动生成" />
        </el-form-item>

        <el-form-item label="文章摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" />
        </el-form-item>

        <el-form-item label="文章内容" prop="content">
          <div class="w-full space-y-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              编辑器内置图片上传能力，支持直接粘贴或拖拽图片并自动上传。
            </div>
            <MarkdownEditor
              v-model="form.content"
              height="620px"
              placeholder="请输入 Markdown 内容..."
              :upload-image="handleInlineImageUpload"
              @change="handleContentChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="封面图" prop="coverImage">
          <div class="w-full space-y-3">
            <el-input v-model="form.coverImage" placeholder="封面图片链接" />
            <el-upload
              :show-file-list="false"
              :http-request="handleCoverUpload"
              accept=".jpg,.jpeg,.png,.webp,.gif"
            >
              <el-button :loading="uploadingCover">上传封面图片</el-button>
            </el-upload>
            <img
              v-if="form.coverImage"
              :src="form.coverImage"
              alt="封面预览"
              class="h-36 rounded-md border border-slate-200 object-cover"
            />
          </div>
        </el-form-item>

        <el-form-item label="文章分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" class="w-full">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="文章标签">
          <el-select v-model="form.tags" multiple collapse-tags placeholder="请选择标签" class="w-full">
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否置顶">
          <el-switch v-model="form.isTop" />
        </el-form-item>

        <el-form-item label="SEO 标题" prop="seoTitle">
          <el-input v-model="form.seoTitle" placeholder="可选" />
        </el-form-item>

        <el-form-item label="SEO 描述" prop="seoDescription">
          <el-input v-model="form.seoDescription" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>

        <el-form-item>
          <div class="flex flex-wrap gap-3">
            <el-button :loading="submitting" @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" :loading="submitting" @click="publishArticle">发布文章</el-button>
            <el-button @click="router.push('/admin/articles')">返回列表</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
