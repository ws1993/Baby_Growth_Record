<template>
  <div class="add-record">
    <header class="page-header">
      <button class="back-btn" @click="$router.go(-1)">← 返回</button>
      <h1>{{ isEdit ? '编辑记录' : '添加记录' }}</h1>
      <div></div>
    </header>

    <main class="content">
      <div v-if="currentMember" class="member-info">
        <div class="member-avatar">
          {{ currentMember.name.charAt(0) }}
        </div>
        <div class="member-details">
          <h2>{{ currentMember.name }}</h2>
          <p>{{ formatDate(currentMember.birthDate) }} 出生</p>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="record-form">
        <div class="form-group">
          <label for="date">记录日期 *</label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            :max="today"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="height">身高 (cm) *</label>
            <input
              id="height"
              v-model.number="form.height"
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder="请输入身高"
              required
            />
          </div>
          <div class="form-group">
            <label for="weight">体重 (kg) *</label>
            <input
              id="weight"
              v-model.number="form.weight"
              type="number"
              step="0.1"
              min="1"
              max="200"
              placeholder="请输入体重"
              required
            />
          </div>
        </div>

        <!-- BMI 自动计算显示 -->
        <div v-if="calculatedBMI" class="bmi-display">
          <div class="bmi-value">
            BMI: <span>{{ calculatedBMI }}</span>
          </div>
          <div class="bmi-status" :class="bmiStatus">
            {{ bmiStatusText }}
          </div>
        </div>

        <!-- 与上次记录对比 -->
        <div v-if="changes && (changes.heightChange || changes.weightChange)" class="changes-display">
          <h3>与上次记录对比</h3>
          <div class="change-item" v-if="changes.heightChange">
            身高变化:
            <span :class="changes.heightChange > 0 ? 'increase' : 'decrease'">
              {{ changes.heightChange > 0 ? '+' : '' }}{{ changes.heightChange }} cm
            </span>
          </div>
          <div class="change-item" v-if="changes.weightChange">
            体重变化:
            <span :class="changes.weightChange > 0 ? 'increase' : 'decrease'">
              {{ changes.weightChange > 0 ? '+' : '' }}{{ changes.weightChange }} kg
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="onCancel">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : (isEdit ? '更新记录' : '添加记录') }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMembersStore, useRecordsStore } from '@/stores';
import { Member } from '@/types/member';
import { Record } from '@/types/record';

const route = useRoute();
const router = useRouter();
const membersStore = useMembersStore();
const recordsStore = useRecordsStore();

// 状态
const submitting = ref(false);
const isEdit = ref(false);
const currentMember = ref<Member | null>(null);
const existingRecord = ref<Record | null>(null);

// 表单数据
const form = reactive({
  date: '',
  height: 0,
  weight: 0,
});

const today = computed(() => new Date().toISOString().split('T')[0]);

// 计算 BMI
const calculatedBMI = computed(() => {
  if (form.height > 0 && form.weight > 0) {
    const heightInMeters = form.height / 100;
    return Number((form.weight / heightInMeters ** 2).toFixed(1));
  }
  return null;
});

// BMI 状态
const bmiStatus = computed(() => {
  if (!calculatedBMI.value) return '';
  const bmi = calculatedBMI.value;
  if (bmi < 18.5) return 'underweight';
  if (bmi < 24) return 'normal';
  if (bmi < 28) return 'overweight';
  return 'obese';
});

// BMI 状态文本
const bmiStatusText = computed(() => {
  const status = bmiStatus.value;
  switch (status) {
    case 'underweight': return '偏瘦';
    case 'normal': return '正常';
    case 'overweight': return '偏胖';
    case 'obese': return '肥胖';
    default: return '';
  }
});

// 与上次记录的变化
const changes = computed(() => {
  if (!currentMember.value || !form.date || !form.height || !form.weight) {
    return null;
  }

  const memberRecords = recordsStore.recordsByMember(currentMember.value.id);
  const previousRecord = memberRecords.find(r => r.date < form.date);

  if (!previousRecord) return null;

  return {
    heightChange: Number((form.height - previousRecord.height).toFixed(1)),
    weightChange: Number((form.weight - previousRecord.weight).toFixed(1)),
  };
});

// 初始化数据
const initData = async () => {
  const memberId = route.params.memberId as string;

  // 获取成员信息
  currentMember.value = membersStore.members.find(m => m.id === memberId) || null;

  if (!currentMember.value) {
    alert('成员不存在');
    router.push('/');
    return;
  }

  // 加载该成员的记录
  await recordsStore.loadRecords(memberId);

  // 检查是否是编辑模式
  const recordId = route.query.recordId as string;
  if (recordId) {
    isEdit.value = true;
    existingRecord.value = recordsStore.records.find(r => r.id === recordId) || null;

    if (existingRecord.value) {
      form.date = existingRecord.value.date;
      form.height = existingRecord.value.height;
      form.weight = existingRecord.value.weight;
    }
  } else {
    // 新增记录，默认日期为今天
    form.date = today.value;
  }
};

// 提交表单
const onSubmit = async () => {
  if (!currentMember.value) return;

  submitting.value = true;
  try {
    const recordData = {
      memberId: currentMember.value.id,
      date: form.date,
      height: form.height,
      weight: form.weight,
    };

    if (isEdit.value && existingRecord.value) {
      await recordsStore.updateRecord({
        id: existingRecord.value.id,
        ...recordData,
      });
      alert('记录更新成功！');
    } else {
      await recordsStore.createRecord(recordData);
      alert('记录添加成功！');
    }

    router.push(`/members`);
  } catch (error) {
    console.error('保存记录失败:', error);
    alert('保存失败，请重试。');
  } finally {
    submitting.value = false;
  }
};

// 取消操作
const onCancel = () => {
  router.back();
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 监听身高体重变化，实时计算BMI
watch([() => form.height, () => form.weight], () => {
  // 触发计算属性的重新计算
}, { immediate: true });

onMounted(async () => {
  await membersStore.loadMembers();
  await initData();
});
</script>

<style scoped>
.add-record {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  color: #666;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.content {
  padding: 16px;
}

.member-info {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.member-details h2 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.member-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.record-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #1989fa;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.bmi-display {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.bmi-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.bmi-value span {
  color: #1989fa;
}

.bmi-status {
  font-size: 14px;
  font-weight: 500;
}

.bmi-status.underweight {
  color: #1677ff;
}

.bmi-status.normal {
  color: #52c41a;
}

.bmi-status.overweight {
  color: #faad14;
}

.bmi-status.obese {
  color: #ff4d4f;
}

.changes-display {
  background: #e6f7ff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.changes-display h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.change-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.change-item:last-child {
  margin-bottom: 0;
}

.increase {
  color: #52c41a;
  font-weight: 500;
}

.decrease {
  color: #ff4d4f;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1989fa;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1677ff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>