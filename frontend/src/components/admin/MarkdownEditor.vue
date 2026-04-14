<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Editor } from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/zh-cn';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '560px'
  },
  placeholder: {
    type: String,
    default: '请输入 Markdown 内容'
  },
  uploadImage: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const editorRootRef = ref(null);
let editorInstance = null;
let isSyncingFromOuter = false;

function wrapSelection(cm, marker) {
  if (!cm) return;

  const doc = cm.getDoc();
  const selected = doc.getSelection();

  if (!selected) {
    const cursor = doc.getCursor();
    doc.replaceRange(`${marker}${marker}`, cursor);
    doc.setCursor({ line: cursor.line, ch: cursor.ch + marker.length });
    cm.focus();
    return;
  }

  doc.replaceSelection(`${marker}${selected}${marker}`, 'around');
  cm.focus();
}

function setMarkdown(value) {
  if (!editorInstance) return;

  const nextValue = value || '';
  const currentValue = editorInstance.getMarkdown();

  if (currentValue === nextValue) return;

  isSyncingFromOuter = true;
  editorInstance.setMarkdown(nextValue);
  isSyncingFromOuter = false;
}

async function handleAddImageBlob(blob, callback) {
  if (!props.uploadImage) {
    return true;
  }

  try {
    const imageUrl = await props.uploadImage(blob);
    if (!imageUrl) {
      throw new Error('图片上传接口返回为空');
    }
    callback(imageUrl, blob?.name || 'image');
  } catch (error) {
    ElMessage.error(error?.message || '图片上传失败');
  }

  return false;
}

onMounted(() => {
  editorInstance = new Editor({
    el: editorRootRef.value,
    height: props.height,
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    placeholder: props.placeholder,
    initialValue: props.modelValue || '',
    usageStatistics: false,
    language: 'zh-CN',
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock']
    ],
    hooks: {
      addImageBlobHook: handleAddImageBlob
    }
  });

  editorInstance.addCommand('markdown', 'bold', (_, cm) => {
    wrapSelection(cm, '**');
    return true;
  });

  editorInstance.addCommand('markdown', 'italic', (_, cm) => {
    wrapSelection(cm, '*');
    return true;
  });

  editorInstance.on('change', () => {
    if (isSyncingFromOuter) return;

    const value = editorInstance.getMarkdown();
    emit('update:modelValue', value);
    emit('change', value);
  });
});

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!editorInstance) return;
    setMarkdown(nextValue);
  }
);

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
});
</script>

<template>
  <div class="markdown-editor">
    <div ref="editorRootRef"></div>
  </div>
</template>

<style scoped>
.markdown-editor {
  --md-font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', 'Noto Sans CJK SC',
    'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif;
  --md-font-size: 14px;
  --md-line-height: 1.8;
}

.markdown-editor :deep(.toastui-editor-defaultUI) {
  border-color: #dbe4f0;
  border-radius: 10px;
}

.markdown-editor :deep(.toastui-editor-toolbar) {
  background: #f8fafc;
}

.markdown-editor :deep(.toastui-editor-main),
.markdown-editor :deep(.toastui-editor-main *),
.markdown-editor :deep(.CodeMirror),
.markdown-editor :deep(.CodeMirror *),
.markdown-editor :deep(.toastui-editor-md-preview),
.markdown-editor :deep(.toastui-editor-md-preview *),
.markdown-editor :deep(.toastui-editor-contents),
.markdown-editor :deep(.toastui-editor-contents *) {
  font-family: var(--md-font-family) !important;
  font-weight: 400;
  letter-spacing: 0;
  text-size-adjust: 100%;
  font-variant-east-asian: normal;
  font-synthesis: weight style;
}

.markdown-editor :deep(.CodeMirror),
.markdown-editor :deep(.CodeMirror pre),
.markdown-editor :deep(.CodeMirror-line),
.markdown-editor :deep(.CodeMirror-line span) {
  font-size: var(--md-font-size) !important;
  line-height: var(--md-line-height) !important;
}

.markdown-editor :deep(.toastui-editor-md-preview),
.markdown-editor :deep(.toastui-editor-contents) {
  font-size: 15px;
  line-height: 1.9;
}

.markdown-editor :deep(.cm-header),
.markdown-editor :deep(.toastui-editor-contents h1),
.markdown-editor :deep(.toastui-editor-contents h2),
.markdown-editor :deep(.toastui-editor-contents h3),
.markdown-editor :deep(.toastui-editor-contents h4),
.markdown-editor :deep(.toastui-editor-contents h5),
.markdown-editor :deep(.toastui-editor-contents h6),
.markdown-editor :deep(.cm-strong),
.markdown-editor :deep(.toastui-editor-contents strong) {
  font-weight: 700 !important;
}

.markdown-editor :deep(.cm-em),
.markdown-editor :deep(.toastui-editor-md-preview em),
.markdown-editor :deep(.toastui-editor-contents em) {
  font-style: italic !important;
  font-synthesis: style !important;
}

.markdown-editor :deep(.toastui-editor-md-preview em),
.markdown-editor :deep(.toastui-editor-contents em) {
  display: inline-block;
  transform: skewX(-8deg);
  transform-origin: left center;
}

.markdown-editor :deep(.toastui-editor-contents code),
.markdown-editor :deep(.toastui-editor-md-code),
.markdown-editor :deep(.toastui-editor-md-code-block-line-background),
.markdown-editor :deep(.cm-comment),
.markdown-editor :deep(.cm-inline-code),
.markdown-editor :deep(.cm-code) {
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace !important;
}
</style>
