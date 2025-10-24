<template>
  <div class="stat-card">
    <div class="stat-icon">
      <van-icon :name="icon" :color="iconColor" size="24" />
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="change" class="stat-change" :class="changeType">
      <van-icon :name="changeIcon" size="12" />
      <span>{{ change }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: string | number;
  label: string;
  icon: string;
  iconColor?: string;
  change?: string | number;
  changeType?: 'increase' | 'decrease';
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#1989fa',
  changeType: 'increase',
});

const changeIcon = computed(() => {
  return props.changeType === 'increase' ? 'arrow-up' : 'arrow-down';
});
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-top: 2px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.increase {
  color: #07c160;
}

.stat-change.decrease {
  color: #ee0a24;
}
</style>