import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchPublicSiteConfig } from '@/api/modules/site';

export const useSiteStore = defineStore('site', () => {
  const config = ref(null);
  const loading = ref(false);
  const error = ref('');

  const siteName = computed(() => config.value?.siteName || import.meta.env.VITE_APP_TITLE || 'Personal Blog');

  async function loadSiteConfig() {
    if (loading.value) {
      return config.value;
    }

    loading.value = true;
    error.value = '';

    try {
      const data = await fetchPublicSiteConfig();
      config.value = data;
      return data;
    } catch (err) {
      error.value = err.message || '站点信息加载失败';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    config,
    loading,
    error,
    siteName,
    loadSiteConfig
  };
});
