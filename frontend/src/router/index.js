import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const BlogLayout = () => import('@/layouts/BlogLayout.vue');
const AdminLayout = () => import('@/layouts/AdminLayout.vue');

const HomeView = () => import('@/views/blog/HomeView.vue');
const ArticleDetailView = () => import('@/views/blog/ArticleDetailView.vue');
const CategoriesView = () => import('@/views/blog/CategoriesView.vue');
const CategoryArticlesView = () => import('@/views/blog/CategoryArticlesView.vue');
const TagsView = () => import('@/views/blog/TagsView.vue');
const TagArticlesView = () => import('@/views/blog/TagArticlesView.vue');
const ArchiveView = () => import('@/views/blog/ArchiveView.vue');
const AboutView = () => import('@/views/blog/AboutView.vue');
const NotFoundView = () => import('@/views/blog/NotFoundView.vue');

const LoginView = () => import('@/views/admin/LoginView.vue');
const DashboardView = () => import('@/views/admin/DashboardView.vue');
const ArticlesView = () => import('@/views/admin/ArticlesView.vue');
const ArticleCreateView = () => import('@/views/admin/ArticleCreateView.vue');
const ArticleEditView = () => import('@/views/admin/ArticleEditView.vue');
const CategoriesManageView = () => import('@/views/admin/CategoriesManageView.vue');
const TagsManageView = () => import('@/views/admin/TagsManageView.vue');
const CommentsManageView = () => import('@/views/admin/CommentsManageView.vue');
const SettingsView = () => import('@/views/admin/SettingsView.vue');

const routes = [
  {
    path: '/',
    component: BlogLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'article/:slug', name: 'article-detail', component: ArticleDetailView },
      { path: 'categories', name: 'categories', component: CategoriesView },
      { path: 'category/:slug', name: 'category-articles', component: CategoryArticlesView },
      { path: 'tags', name: 'tags', component: TagsView },
      { path: 'tag/:slug', name: 'tag-articles', component: TagArticlesView },
      {
        path: 'search',
        name: 'search',
        redirect: (to) => ({
          name: 'home',
          query: {
            ...to.query
          }
        })
      },
      { path: 'archive', name: 'archive', component: ArchiveView },
      { path: 'about', name: 'about', component: AboutView }
    ]
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: LoginView
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: DashboardView },
      { path: 'articles', name: 'admin-articles', component: ArticlesView },
      { path: 'articles/create', name: 'admin-article-create', component: ArticleCreateView },
      { path: 'articles/edit/:id', name: 'admin-article-edit', component: ArticleEditView },
      { path: 'categories', name: 'admin-categories', component: CategoriesManageView },
      { path: 'tags', name: 'admin-tags', component: TagsManageView },
      { path: 'comments', name: 'admin-comments', component: CommentsManageView },
      { path: 'settings', name: 'admin-settings', component: SettingsView }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

function buildLoginRedirect(to) {
  return {
    path: '/admin/login',
    query: { redirect: to.fullPath }
  };
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.hasToken) {
      return buildLoginRedirect(to);
    }

    try {
      await authStore.ensureProfile();
    } catch {
      return buildLoginRedirect(to);
    }
  }

  if (to.path === '/admin/login' && authStore.hasToken) {
    try {
      await authStore.ensureProfile();
      return '/admin/dashboard';
    } catch {
      return true;
    }
  }

  return true;
});

export default router;
