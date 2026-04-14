<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import {
  createAdminTag,
  deleteAdminTag,
  fetchAdminTags,
  updateAdminTag
} from '@/api/modules/admin/tags';

const loading = ref(false);
const saving = ref(false);
const list = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');

const formRef = ref();
const form = reactive({
  name: '',
  slug: ''
});

const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 64, message: '名称长度应为 1-64 个字符', trigger: 'blur' }
  ],
  slug: [{ min: 1, max: 128, message: '别名长度应为 1-128 个字符', trigger: 'blur' }]
};

async function loadList() {
  loading.value = true;
  try {
    const data = await fetchAdminTags({ page: 1, pageSize: 50 });
    list.value = data.items || [];
  } catch (err) {
    ElMessage.error(err.message || '加载标签列表失败');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = '';
  form.slug = '';
}

function handleCreate() {
  isEdit.value = false;
  currentId.value = '';
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row) {
  isEdit.value = true;
  currentId.value = row.id;
  form.name = row.name || '';
  form.slug = row.slug || '';
  dialogVisible.value = true;
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除标签“${row.name}”吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    });
  } catch {
    return;
  }

  try {
    await deleteAdminTag(row.id);
    ElMessage.success('删除成功');
    loadList();
  } catch (err) {
    ElMessage.error(err.message || '删除失败');
  }
}

async function handleSubmit() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined
    };

    if (isEdit.value) {
      await updateAdminTag(currentId.value, payload);
      ElMessage.success('标签更新成功');
    } else {
      await createAdminTag(payload);
      ElMessage.success('标签创建成功');
    }

    dialogVisible.value = false;
    loadList();
  } catch (err) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  document.title = '博客后台管理 - 标签管理';
  loadList();
});
</script>

<template>
  <section>
    <AdminPageHeader title="标签管理" description="维护文章标签，便于主题聚合与检索。">
      <template #actions>
        <el-button type="primary" @click="handleCreate">新建标签</el-button>
      </template>
    </AdminPageHeader>

    <el-card>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="名称" min-width="220" />
        <el-table-column prop="slug" label="别名" min-width="220" />
        <el-table-column prop="articleCount" label="文章数" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '新建标签'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="别名" prop="slug">
          <el-input v-model="form.slug" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>
