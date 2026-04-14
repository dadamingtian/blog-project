<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <span
      v-for="item in bubbles"
      :key="item.id"
      class="absolute rounded-full blur-3xl"
      :style="item.style"
    ></span>

    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_36%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.08),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.08),transparent_40%)]"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const bubbles = computed(() => {
  const seeds = [
    { left: '6%', top: '12%', size: 240, color: 'rgba(56,189,248,0.22)', duration: '18s', delay: '0s' },
    { left: '72%', top: '18%', size: 180, color: 'rgba(99,102,241,0.2)', duration: '22s', delay: '-5s' },
    { left: '30%', top: '64%', size: 220, color: 'rgba(16,185,129,0.18)', duration: '20s', delay: '-8s' },
    { left: '84%', top: '72%', size: 200, color: 'rgba(14,165,233,0.16)', duration: '24s', delay: '-3s' },
    { left: '48%', top: '32%', size: 160, color: 'rgba(129,140,248,0.18)', duration: '19s', delay: '-11s' }
  ];

  return seeds.map((item, index) => ({
    id: index,
    style: {
      left: item.left,
      top: item.top,
      width: `${item.size}px`,
      height: `${item.size}px`,
      background: item.color,
      animation: `floatBubble ${item.duration} ease-in-out ${item.delay} infinite`
    }
  }));
});
</script>

<style scoped>
@keyframes floatBubble {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    transform: translate3d(10px, -12px, 0) scale(1.05);
  }
  50% {
    transform: translate3d(-8px, -20px, 0) scale(0.96);
  }
  75% {
    transform: translate3d(12px, 8px, 0) scale(1.03);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>
