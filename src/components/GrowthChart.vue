<template>
  <div class="growth-chart">
    <div class="chart-header">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="身高" name="height" />
        <van-tab title="体重" name="weight" />
        <van-tab title="BMI" name="bmi" />
      </van-tabs>
    </div>

    <div class="chart-container" ref="chartRef"></div>

    <div class="chart-stats">
      <van-grid :column-num="3" :border="false">
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value">{{ latestValue }}</div>
            <div class="stat-label">{{ statLabel }}</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value">{{ changeValue }}</div>
            <div class="stat-label">较上次</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value">{{ totalChange }}</div>
            <div class="stat-label">总变化</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Record } from '@/types/record';

interface Props {
  records: Record[];
}

const props = defineProps<Props>();

const activeTab = ref('height');
const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

const latestValue = ref('0');
const changeValue = ref('0');
const totalChange = ref('0');
const statLabel = ref('');

const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chart || !props.records.length) return;

  const dates = props.records.map(r => r.date).reverse();
  let data: number[] = [];
  let unit = '';
  let color = '#1989fa';

  switch (activeTab.value) {
    case 'height':
      data = props.records.map(r => r.height).reverse();
      unit = 'cm';
      color = '#1989fa';
      statLabel.value = '身高';
      break;
    case 'weight':
      data = props.records.map(r => r.weight).reverse();
      unit = 'kg';
      color = '#07c160';
      statLabel.value = '体重';
      break;
    case 'bmi':
      data = props.records.map(r => r.bmi || 0).reverse();
      unit = '';
      color = '#ff976a';
      statLabel.value = 'BMI';
      break;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.axisValueLabel}<br/>${statLabel.value}: ${param.value}${unit}`;
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: unit,
    },
    series: [
      {
        data,
        type: 'line',
        smooth: true,
        lineStyle: {
          color,
          width: 3,
        },
        itemStyle: {
          color,
        },
        areaStyle: {
          opacity: 0.3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '10' },
            ],
          },
        },
      },
    ],
  };

  chart.setOption(option);
  updateStats();
};

const updateStats = () => {
  if (!props.records.length) {
    latestValue.value = '0';
    changeValue.value = '0';
    totalChange.value = '0';
    return;
  }

  const sortedRecords = [...props.records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let getValue: (record: Record) => number;
  let unit = '';

  switch (activeTab.value) {
    case 'height':
      getValue = (r) => r.height;
      unit = 'cm';
      break;
    case 'weight':
      getValue = (r) => r.weight;
      unit = 'kg';
      break;
    case 'bmi':
      getValue = (r) => r.bmi || 0;
      unit = '';
      break;
  }

  const latest = sortedRecords[sortedRecords.length - 1];
  const previous = sortedRecords[sortedRecords.length - 2];
  const first = sortedRecords[0];

  const latestVal = getValue(latest);
  const previousVal = previous ? getValue(previous) : latestVal;
  const firstVal = getValue(first);

  latestValue.value = `${latestVal}${unit}`;
  changeValue.value = `${latestVal - previousVal > 0 ? '+' : ''}${(latestVal - previousVal).toFixed(1)}${unit}`;
  totalChange.value = `${latestVal - firstVal > 0 ? '+' : ''}${(latestVal - firstVal).toFixed(1)}${unit}`;
};

const onTabChange = () => {
  updateChart();
};

watch(() => props.records, updateChart, { deep: true });

onMounted(() => {
  nextTick(initChart);
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
  }
});
</script>

<style scoped>
.growth-chart {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-container {
  height: 300px;
  margin-bottom: 16px;
}

.chart-stats {
  border-top: 1px solid #ebedf0;
  padding-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}
</style>