<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  skeletonRows: {
    type: Number,
    default: 5
  },
  loadingDelay: {
    type: Number,
    default: 120
  },
  loadingMinDuration: {
    type: Number,
    default: 260
  }
});

const emit = defineEmits(['retry']);

const showLoading = ref(false);
let delayTimer = null;
let hideTimer = null;
let loadingShownAt = 0;

function clearTimers() {
  if (delayTimer) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function startLoading() {
  if (showLoading.value || delayTimer) return;

  delayTimer = setTimeout(() => {
    showLoading.value = true;
    loadingShownAt = Date.now();
    delayTimer = null;
  }, Math.max(0, props.loadingDelay));
}

function stopLoading() {
  if (delayTimer) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }

  if (!showLoading.value) return;

  const elapsed = Date.now() - loadingShownAt;
  const remain = Math.max(0, props.loadingMinDuration - elapsed);

  hideTimer = setTimeout(() => {
    showLoading.value = false;
    hideTimer = null;
  }, remain);
}

watch(
  () => props.loading,
  (isLoading) => {
    if (isLoading) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      startLoading();
      return;
    }

    stopLoading();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<template>
  <transition name="fade-slide" mode="out-in">
    <div v-if="showLoading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <el-skeleton :rows="skeletonRows" animated />
    </div>

    <el-result v-else-if="error" icon="error" title="加载失败" :sub-title="error">
      <template #extra>
        <el-button type="primary" @click="emit('retry')">重试</el-button>
      </template>
    </el-result>

    <el-empty v-else-if="empty" :description="emptyText" />

    <div v-else>
      <slot />
    </div>
  </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
