<script setup>
import { UploadFilled } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import MarkdownEditor from '@/components/admin/MarkdownEditor.vue';
import { fetchAdminSiteConfig, updateAdminSiteConfig } from '@/api/modules/admin/site';
import { uploadAdminImage } from '@/api/modules/admin/upload';

const loading = ref(false);
const saving = ref(false);
const uploadingAvatar = ref(false);
const formRef = ref();

const form = reactive({
  siteName: '',
  siteDescription: '',
  aboutContent: '',
  avatar: '',
  seoTitle: '',
  seoDescription: '',
  socialLinks: []
});

const rules = {
  siteName: [
    { required: true, message: '请输入站点名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度应为 1-100 个字符', trigger: 'blur' }
  ],
  siteDescription: [{ max: 300, message: '最多 300 个字符', trigger: 'blur' }],
  seoTitle: [{ max: 120, message: '最多 120 个字符', trigger: 'blur' }],
  seoDescription: [{ max: 300, message: '最多 300 个字符', trigger: 'blur' }]
};

function setForm(data) {
  form.siteName = data.siteName || '';
  form.siteDescription = data.siteDescription || '';
  form.aboutContent = data.aboutContent || '';
  form.avatar = data.avatar || '';
  form.seoTitle = data.seoTitle || '';
  form.seoDescription = data.seoDescription || '';
  form.socialLinks = Array.isArray(data.socialLinks)
    ? data.socialLinks.map((item) => ({
        name: item.name || '',
        url: item.url || ''
      }))
    : [];
}

async function loadData() {
  loading.value = true;
  try {
    const data = await fetchAdminSiteConfig();
    setForm(data);
  } catch (err) {
    ElMessage.error(err.message || '加载站点设置失败');
  } finally {
    loading.value = false;
  }
}

function addSocialLink() {
  form.socialLinks.push({ name: '', url: '' });
}

function removeSocialLink(index) {
  form.socialLinks.splice(index, 1);
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

async function handleAvatarUpload(option) {
  const { file } = option;
  if (!validateImageFile(file)) return;

  uploadingAvatar.value = true;
  try {
    const data = await uploadAdminImage(file);
    const imageUrl = resolveUploadUrl(data);
    if (!imageUrl) {
      throw new Error('上传返回数据异常');
    }
    form.avatar = imageUrl;
    ElMessage.success('头像上传成功');
  } catch (err) {
    ElMessage.error(err.message || '头像上传失败');
  } finally {
    uploadingAvatar.value = false;
  }
}

async function handleAboutImageUpload(file) {
  if (!validateImageFile(file)) {
    throw new Error('图片校验失败，请更换后重试');
  }

  const data = await uploadAdminImage(file);
  const imageUrl = resolveUploadUrl(data);
  if (!imageUrl) {
    throw new Error('上传返回数据异常');
  }
  return imageUrl;
}

async function handleSave() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  const socialLinks = form.socialLinks
    .map((item) => ({
      name: item.name.trim(),
      url: item.url.trim()
    }))
    .filter((item) => item.name && item.url);

  saving.value = true;
  try {
    const payload = {
      siteName: form.siteName.trim(),
      siteDescription: form.siteDescription.trim(),
      aboutContent: form.aboutContent,
      avatar: form.avatar.trim(),
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      socialLinks
    };

    await updateAdminSiteConfig(payload);
    ElMessage.success('站点设置保存成功');
    loadData();
  } catch (err) {
    ElMessage.error(err.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  document.title = '博客后台管理 - 站点设置';
  loadData();
});
</script>

<template>
  <section>
    <AdminPageHeader title="站点设置" description="维护站点基础信息、关于页内容与社交链接。" />

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="站点名称" prop="siteName">
          <el-input v-model="form.siteName" />
        </el-form-item>

        <el-form-item label="站点描述" prop="siteDescription">
          <el-input v-model="form.siteDescription" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="头像" prop="avatar">
          <div class="w-full space-y-3">
            <el-upload
              :show-file-list="false"
              :http-request="handleAvatarUpload"
              accept=".jpg,.jpeg,.png,.webp,.gif"
            >
              <el-button :icon="UploadFilled" :loading="uploadingAvatar">上传头像</el-button>
            </el-upload>
            <p class="text-xs text-slate-400">支持 JPG / PNG / WEBP / GIF，大小不超过 2MB</p>
            <el-avatar v-if="form.avatar" :src="form.avatar" :size="72">
              {{ (form.siteName || 'B').slice(0, 1) }}
            </el-avatar>
          </div>
        </el-form-item>

        <el-form-item label="关于页内容">
          <div class="w-full space-y-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              使用高级 Markdown 编辑器，支持图片上传与实时预览。
            </div>
            <MarkdownEditor
              v-model="form.aboutContent"
              height="520px"
              placeholder="请输入关于页内容..."
              :upload-image="handleAboutImageUpload"
            />
          </div>
        </el-form-item>

        <el-form-item label="SEO 标题" prop="seoTitle">
          <el-input v-model="form.seoTitle" />
        </el-form-item>

        <el-form-item label="SEO 描述" prop="seoDescription">
          <el-input v-model="form.seoDescription" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="社交链接">
          <div class="w-full space-y-3">
            <div v-for="(item, index) in form.socialLinks" :key="index" class="flex flex-wrap items-center gap-2">
              <el-input v-model="item.name" placeholder="平台名称" class="w-[180px]" />
              <el-input v-model="item.url" placeholder="链接地址" class="flex-1 min-w-[280px]" />
              <el-button type="danger" plain @click="removeSocialLink(index)">删除</el-button>
            </div>
            <el-button @click="addSocialLink">新增社交链接</el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存站点设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
