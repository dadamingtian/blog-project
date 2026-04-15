<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue';
import { fetchAdminDashboardOverview } from '@/api/modules/admin/dashboard';

const router = useRouter();
const loading = ref(false);

const stats = ref({
  articleTotal: 0,
  publishedTotal: 0,
  draftTotal: 0,
  categoryTotal: 0,
  tagTotal: 0,
  commentPending: 0,
  commentApproved: 0,
  commentRejected: 0
});
const trendData = ref([]);
const commentStatusData = ref([]);
const hotArticles = ref([]);
const totalViewTrend7d = ref([]);

const trendChartRef = ref(null);
const statusChartRef = ref(null);
const hotChartRef = ref(null);
const hotDetailChartRef = ref(null);
let trendChartInstance = null;
let statusChartInstance = null;
let hotChartInstance = null;
let hotDetailChartInstance = null;

const activeHotArticle = ref(null);

const hasHotArticles = computed(() => hotArticles.value.length > 0);

const cards = computed(() => [
  { label: '文章总数', value: stats.value.articleTotal },
  { label: '已发布文章', value: stats.value.publishedTotal },
  { label: '草稿文章', value: stats.value.draftTotal },
  { label: '分类总数', value: stats.value.categoryTotal },
  { label: '标签总数', value: stats.value.tagTotal },
  { label: '待审核评论', value: stats.value.commentPending }
]);

function renderHotDetailChart(article) {
  if (!hotDetailChartRef.value) return;

  if (!hotDetailChartInstance) {
    hotDetailChartInstance = echarts.init(hotDetailChartRef.value);
  }

  const isAllTrend = !article;
  const trend = isAllTrend ? totalViewTrend7d.value : article?.trend7d || [];

  hotDetailChartInstance.setOption({
    color: [isAllTrend ? '#3b82f6' : '#10b981'],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.map((item) => item.label)
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: isAllTrend ? '总阅读量' : '阅读量',
        type: 'line',
        smooth: true,
        data: trend.map((item) => item.views)
      }
    ]
  });
}

function initCharts() {
  if (trendChartRef.value && !trendChartInstance) {
    trendChartInstance = echarts.init(trendChartRef.value);
  }
  if (statusChartRef.value && !statusChartInstance) {
    statusChartInstance = echarts.init(statusChartRef.value);
  }
  if (hotChartRef.value && !hotChartInstance) {
    hotChartInstance = echarts.init(hotChartRef.value);
  }

  if (trendChartInstance) {
    trendChartInstance.setOption({
      color: ['#3b82f6', '#f97316', '#10b981'],
      tooltip: { trigger: 'axis' },
      legend: { data: ['文章总数', '已发布', '草稿'] },
      grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.value.map((item) => item.label)
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { name: '文章总数', type: 'line', smooth: true, data: trendData.value.map((item) => item.total) },
        { name: '已发布', type: 'line', smooth: true, data: trendData.value.map((item) => item.published) },
        { name: '草稿', type: 'line', smooth: true, data: trendData.value.map((item) => item.draft) }
      ]
    });
  }

  if (statusChartInstance) {
    statusChartInstance.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '评论状态',
          type: 'pie',
          radius: ['45%', '72%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { formatter: '{b}: {c}' },
          data: commentStatusData.value.map((item) => ({
            value: item.count,
            name: item.label
          }))
        }
      ]
    });
  }

  if (hotChartInstance) {
    const displayList = [...hotArticles.value].reverse();

    hotChartInstance.setOption({
      color: ['#6366f1'],
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click',
        axisPointer: { type: 'shadow' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: {
        type: 'category',
        data: displayList.map((item) => item.title),
        axisLabel: {
          interval: 0,
          width: 220,
          overflow: 'truncate'
        }
      },
      series: [
        {
          name: '阅读量',
          type: 'bar',
          barWidth: 16,
          data: displayList.map((item) => item.viewCount)
        }
      ]
    });

    hotChartInstance.off('updateAxisPointer');
    hotChartInstance.off('globalout');

    hotChartInstance.on('updateAxisPointer', (event) => {
      const axisInfo = (event?.axesInfo || []).find((item) => item.axisDim === 'y');
      if (!axisInfo || axisInfo.value === undefined || axisInfo.value === null) return;

      const rawValue = axisInfo.value;
      let dataIndex = Number(rawValue);
      if (Number.isNaN(dataIndex)) {
        dataIndex = displayList.findIndex((item) => item.title === String(rawValue));
      }
      if (dataIndex < 0 || dataIndex >= displayList.length) return;

      const target = displayList[dataIndex];
      if (!target) return;
      if (activeHotArticle.value?.id === target.id) return;

      activeHotArticle.value = target;
      renderHotDetailChart(target);
    });

    hotChartInstance.on('globalout', () => {
      activeHotArticle.value = null;
      renderHotDetailChart(null);
    });
  }

  activeHotArticle.value = null;
  renderHotDetailChart(null);
  resizeCharts();
}

function resizeCharts() {
  trendChartInstance?.resize();
  statusChartInstance?.resize();
  hotChartInstance?.resize();
  hotDetailChartInstance?.resize();
}

async function loadDashboard() {
  loading.value = true;
  try {
    const data = await fetchAdminDashboardOverview();
    stats.value = {
      articleTotal: data.stats?.articleTotal || 0,
      publishedTotal: data.stats?.publishedTotal || 0,
      draftTotal: data.stats?.draftTotal || 0,
      categoryTotal: data.stats?.categoryTotal || 0,
      tagTotal: data.stats?.tagTotal || 0,
      commentPending: data.stats?.commentPending || 0,
      commentApproved: data.stats?.commentApproved || 0,
      commentRejected: data.stats?.commentRejected || 0
    };
    trendData.value = data.articleTrend7d || [];
    commentStatusData.value = data.commentStatus || [];
    hotArticles.value = (data.hotArticles || []).slice(0, 10);
    totalViewTrend7d.value = data.totalViewTrend7d || [];
  } catch (err) {
    ElMessage.error(err.message || '加载仪表盘数据失败');
  } finally {
    loading.value = false;
  }

  await nextTick();
  initCharts();
  requestAnimationFrame(() => {
    resizeCharts();
  });
}

onMounted(async () => {
  document.title = '博客后台管理 - 仪表盘';
  await loadDashboard();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  trendChartInstance?.dispose();
  statusChartInstance?.dispose();
  hotChartInstance?.dispose();
  hotDetailChartInstance?.dispose();
  trendChartInstance = null;
  statusChartInstance = null;
  hotChartInstance = null;
  hotDetailChartInstance = null;
});
</script>

<template>
  <section>
    <AdminPageHeader title="仪表盘" description="快速查看内容规模、近七天趋势、评论状态与文章热度。">
      <template #actions>
        <div class="flex gap-2">
          <el-button type="primary" @click="router.push('/admin/articles/create')">新建文章</el-button>
          <el-button @click="router.push('/admin/comments')">评论审核</el-button>
        </div>
      </template>
    </AdminPageHeader>

    <el-skeleton v-if="loading" :rows="10" animated />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <el-card v-for="item in cards" :key="item.label" shadow="hover">
          <p class="text-sm text-slate-500">{{ item.label }}</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ item.value }}</p>
        </el-card>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-2">
        <el-card shadow="hover">
          <template #header>近 7 天文章创建趋势</template>
          <div ref="trendChartRef" class="h-[320px] w-full"></div>
        </el-card>

        <el-card shadow="hover">
          <template #header>评论审核状态占比</template>
          <div ref="statusChartRef" class="h-[320px] w-full"></div>
        </el-card>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-2">
        <el-card shadow="hover">
          <template #header>文章热度统计（Top 10）</template>

          <el-empty v-if="!hasHotArticles" description="暂无已发布文章，暂不展示热度统计" />
          <div v-else ref="hotChartRef" class="h-[420px] w-full"></div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>阅读量趋势</span>
              <span class="text-xs text-slate-400">
                {{ hasHotArticles ? (activeHotArticle ? activeHotArticle.title : '展示全部文章近 7 天总阅读量') : '暂无热度数据' }}
              </span>
            </div>
          </template>
          <div ref="hotDetailChartRef" class="h-[380px] w-full"></div>
        </el-card>
      </div>
    </template>
  </section>
</template>
