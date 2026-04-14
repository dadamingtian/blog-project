<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  routeName: {
    type: String,
    default: 'tag-articles'
  }
});
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <RouterLink
      v-for="tag in tags"
      :key="tag.id"
      :to="{ name: routeName, params: { slug: tag.slug } }"
      class="group"
    >
      <el-tag round effect="plain" class="cursor-pointer transition group-hover:border-brand group-hover:text-brand">
        # {{ tag.name }}
        <span v-if="typeof tag.articleCount === 'number'" class="ml-1 text-slate-400">
          {{ tag.articleCount }}
        </span>
      </el-tag>
    </RouterLink>
  </div>
</template>
