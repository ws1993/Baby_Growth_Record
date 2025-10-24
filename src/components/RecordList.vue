<template>
  <div class="record-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell v-for="record in records" :key="record.id" class="record-item">
        <template #title>
          <div class="record-date">{{ formatDate(record.date) }}</div>
        </template>
        <template #value>
          <div class="record-data">
            <span class="height">身高: {{ record.height }}cm</span>
            <span class="weight">体重: {{ record.weight }}kg</span>
            <span v-if="record.bmi" class="bmi">BMI: {{ record.bmi }}</span>
          </div>
        </template>
        <template #right-icon>
          <div class="record-actions">
            <van-button size="mini" type="primary" @click="$emit('edit', record)">
              编辑
            </van-button>
            <van-button size="mini" type="danger" @click="$emit('delete', record)">
              删除
            </van-button>
          </div>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { Record } from '@/types/record';
import { formatDate } from '@/utils/date';

interface Props {
  records: Record[];
  loading?: boolean;
  finished?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  finished: false,
});

const emit = defineEmits<{
  load: [];
  edit: [record: Record];
  delete: [record: Record];
}>();

const onLoad = () => {
  emit('load');
};
</script>

<style scoped>
.record-list {
  padding: 0 16px;
}

.record-item {
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.record-date {
  font-weight: 600;
  color: #323233;
}

.record-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.record-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.height,
.weight,
.bmi {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.height {
  background: #e8f3ff;
  color: #1989fa;
}

.weight {
  background: #f0f9ff;
  color: #07c160;
}

.bmi {
  background: #fff7e6;
  color: #ff976a;
}
</style>