<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import { formatDateTime } from '@/utils/format';
import { deleteAdminArticle, fetchAdminArticles } from '@/api/modules/admin/articles';

const router = useRouter();
const loading = ref(false);
const list = ref([]);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

const filters = reactive({
  keyword: '',
  status: ''
});

async function loadList(page = pagination.value.page) {
  loading.value = true;

  try {
    const data = await fetchAdminArticles({
      page,
      pageSize: pagination.value.pageSize,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined
    });

    list.value = data.items || [];
    pagination.value = {
      page: data.pagination?.page || page,
      pageSize: data.pagination?.pageSize || 10,
      total: data.pagination?.total || 0
    };
  } catch (err) {
    ElMessage.error(err.message || '加载文章列表失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  loadList(1);
}

function handleReset() {
  filters.keyword = '';
  filters.status = '';
  loadList(1);
}

function handleCreate() {
  router.push('/admin/articles/create');
}

function handleEdit(row) {
  router.push(`/admin/articles/edit/${row.id}`);
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除文章「${row.title}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    });
  } catch {
    return;
  }

  try {
    await deleteAdminArticle(row.id);
    ElMessage.success('删除成功');
    const targetPage = list.value.length === 1 && pagination.value.page > 1
      ? pagination.value.page - 1
      : pagination.value.page;
    loadList(targetPage);
  } catch (err) {
    ElMessage.error(err.message || '删除失败');
  }
}

function handlePageChange(page) {
  loadList(page);
}

onMounted(() => {
  document.title = '后台管理 - 文章管理';
  loadList(1);
});
</script>

<template>
  <section>
    <AdminPageHeader title="文章管理" description="支持分页、筛选、新建、编辑和删除文章。">
      <template #actions>
        <el-button type="primary" @click="handleCreate">新建文章</el-button>
      </template>
    </AdminPageHeader>

    <el-card>
      <div class="mb-4 flex flex-wrap gap-3">
        <el-input
          v-model="filters.keyword"
          clearable
          placeholder="按标题/摘要/正文关键词搜索"
          class="w-[260px]"
          @keyup.enter="handleSearch"
        />

        <el-select v-model="filters.status" clearable placeholder="状态" class="w-[160px]">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="56" />
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="120">
          <template #default="{ row }">{{ row.category?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="阅读量" prop="viewCount" width="90" />
        <el-table-column label="更新时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </section>
</template>
