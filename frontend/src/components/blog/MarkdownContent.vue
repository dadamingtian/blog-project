<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
});

const viewerRootRef = ref(null);
let viewerInstance = null;

function getContent() {
  return props.content || '';
}

function setViewerContent() {
  if (!viewerInstance) return;
  viewerInstance.setMarkdown(getContent());
}

onMounted(() => {
  if (!viewerRootRef.value) return;

  viewerInstance = new Viewer({
    el: viewerRootRef.value,
    initialValue: getContent(),
    usageStatistics: false
  });
});

watch(
  () => props.content,
  () => {
    setViewerContent();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (viewerInstance) {
    viewerInstance.destroy();
    viewerInstance = null;
  }
});
</script>

<template>
  <div class="markdown-viewer-wrapper rounded-xl border border-slate-200 bg-white p-4 md:p-6">
    <div ref="viewerRootRef" class="markdown-viewer"></div>
  </div>
</template>

<style scoped>
.markdown-viewer-wrapper :deep(.toastui-editor-contents) {
  color: #0f172a;
  font-size: 15px;
  line-height: 1.9;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
}

.markdown-viewer-wrapper :deep(.toastui-editor-contents pre) {
  border-radius: 10px;
}

.markdown-viewer-wrapper :deep(.toastui-editor-contents code) {
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
}

.markdown-viewer-wrapper :deep(.toastui-editor-contents img) {
  border-radius: 10px;
}
</style>
