<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activePath = computed(() => route.path);
const adminName = computed(() => authStore.profile?.nickname || authStore.profile?.username || '管理员');

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘' },
  { path: '/admin/articles', label: '文章管理' },
  { path: '/admin/categories', label: '分类管理' },
  { path: '/admin/tags', label: '标签管理' },
  { path: '/admin/comments', label: '评论管理' },
  { path: '/admin/settings', label: '站点设置' }
];

function handleSelect(path) {
  if (path !== route.path) {
    router.push(path);
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确认退出当前管理员账号吗？', '退出确认', {
      confirmButtonText: '退出登录',
      cancelButtonText: '取消',
      type: 'warning'
    });
  } catch {
    return;
  }

  authStore.logout();
  ElMessage.success('已退出登录');
  router.replace('/admin/login');
}
</script>

<template>
  <div class="admin-shell h-screen overflow-hidden bg-slate-100">
    <el-container class="h-full">
      <el-aside width="228px" class="h-full border-r border-slate-200 bg-white">
        <div class="h-16 border-b border-slate-200 px-5 leading-[64px]">
          <RouterLink to="/admin/dashboard" class="text-lg font-semibold text-slate-900">博客后台管理</RouterLink>
        </div>

        <el-menu :default-active="activePath" class="h-[calc(100%-64px)] border-r-0 overflow-y-auto" @select="handleSelect">
          <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
            {{ item.label }}
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container class="h-full">
        <el-header class="h-16 border-b border-slate-200 bg-white px-6">
          <div class="flex h-full items-center justify-between">
            <div class="text-sm text-slate-600">欢迎你，{{ adminName }}</div>
            <div class="flex items-center gap-3">
              <RouterLink to="/" target="_blank" class="text-sm text-brand hover:underline">查看前台博客</RouterLink>
              <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
            </div>
          </div>
        </el-header>

        <el-main class="h-[calc(100%-64px)] overflow-y-auto p-6">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
