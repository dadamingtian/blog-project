<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  stats: {
    type: Array,
    default: () => []
  }
});

const normalizedStats = computed(() =>
  (props.stats || []).filter(
    (item) => item && typeof item === 'object' && item.label && typeof item.value !== 'undefined'
  )
);
</script>

<template>
  <section class="page-hero rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur md:p-7">
    <span class="hero-orb hero-orb-a"></span>
    <span class="hero-orb hero-orb-b"></span>

    <div class="relative z-[1] flex flex-wrap items-start justify-between gap-5">
      <div class="hero-main space-y-2">
        <p
          v-if="badge"
          class="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand"
        >
          {{ badge }}
        </p>

        <h1 class="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{{ title }}</h1>

        <p v-if="description" class="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {{ description }}
        </p>
      </div>

      <div class="hero-actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="normalizedStats.length" class="hero-stats relative z-[1] mt-5">
      <div
        v-for="(item, index) in normalizedStats"
        :key="`${item.label}-${index}`"
        class="hero-stat-item"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <p class="hero-stat-value">{{ item.value }}</p>
        <p class="hero-stat-label">{{ item.label }}</p>
      </div>
    </div>

    <div class="relative z-[1] mt-5">
      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  animation: heroFadeIn 0.4s ease;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(10px);
}

.hero-orb-a {
  right: -54px;
  top: -42px;
  width: 190px;
  height: 190px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.24), transparent 68%);
  animation: floatA 8.6s ease-in-out infinite;
}

.hero-orb-b {
  left: 30%;
  bottom: -110px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.16), transparent 72%);
  animation: floatB 10.5s ease-in-out infinite;
}

.hero-main {
  animation: riseIn 0.34s ease;
  pointer-events: auto;
}

.hero-actions {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1;
  pointer-events: auto;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  pointer-events: auto;
}

.hero-stat-item {
  border: 1px solid rgba(15, 118, 110, 0.16);
  background: rgba(248, 255, 253, 0.92);
  border-radius: 12px;
  padding: 10px 12px;
  animation: riseIn 0.32s ease both;
  pointer-events: auto;
}

.page-hero :deep(input),
.page-hero :deep(button),
.page-hero :deep(a),
.page-hero :deep(textarea),
.page-hero :deep(.el-input),
.page-hero :deep(.el-button),
.page-hero :deep(.el-input__wrapper) {
  pointer-events: auto;
}

.hero-stat-value {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f766e;
  line-height: 1.2;
}

.hero-stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: #0f766e;
  opacity: 0.82;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatA {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-10px, 10px, 0) scale(1.06);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes floatB {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(12px, -8px, 0) scale(0.96);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 768px) {
  .hero-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
