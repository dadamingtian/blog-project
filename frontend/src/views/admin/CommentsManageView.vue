<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import { formatDateTime } from '@/utils/format';
import {
  deleteAdminComment,
  fetchAdminComments,
  updateAdminCommentStatus
} from '@/api/modules/admin/comments';

const loading = ref(false);
const list = ref([]);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

const filters = reactive({
  status: ''
});

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
];

const statusText = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
};

const statusTag = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
};

async function loadList(page = pagination.value.page) {
  loading.value = true;

  try {
    const data = await fetchAdminComments({
      page,
      pageSize: pagination.value.pageSize,
      status: filters.status || undefined
    });

    list.value = data.items || [];
    pagination.value = {
      page: data.pagination?.page || page,
      pageSize: data.pagination?.pageSize || 10,
      total: data.pagination?.total || 0
    };
  } catch (err) {
    ElMessage.error(err.message || '加载评论列表失败');
  } finally {
    loading.value = false;
  }
}

async function handleChangeStatus(row, status) {
  try {
    await updateAdminCommentStatus(row.id, status);
    ElMessage.success('评论状态更新成功');
    loadList(pagination.value.page);
  } catch (err) {
    ElMessage.error(err.message || '更新评论状态失败');
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该评论吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    });
  } catch {
    return;
  }

  try {
    await deleteAdminComment(row.id);
    ElMessage.success('删除成功');
    const targetPage = list.value.length === 1 && pagination.value.page > 1
      ? pagination.value.page - 1
      : pagination.value.page;
    loadList(targetPage);
  } catch (err) {
    ElMessage.error(err.message || '删除失败');
  }
}

function handleFilter() {
  loadList(1);
}

function handlePageChange(page) {
  loadList(page);
}

onMounted(() => {
  document.title = '后台管理 - 评论管理';
  loadList(1);
});
</script>

<template>
  <section>
    <AdminPageHeader title="评论管理" description="审核评论状态并执行删除操作。" />

    <el-card>
      <div class="mb-4 flex items-center gap-3">
        <el-select v-model="filters.status" clearable placeholder="评论状态" class="w-[180px]">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleFilter">筛选</el-button>
      </div>

      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="56" />
        <el-table-column label="文章" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.article?.title || '-' }}</template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status] || 'info'">{{ statusText[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="168">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-3">
              <el-dropdown trigger="click">
                <el-button link type="primary">审核</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleChangeStatus(row, 'pending')">标记为待审核</el-dropdown-item>
                    <el-dropdown-item @click="handleChangeStatus(row, 'approved')">审核通过</el-dropdown-item>
                    <el-dropdown-item @click="handleChangeStatus(row, 'rejected')">审核拒绝</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
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
