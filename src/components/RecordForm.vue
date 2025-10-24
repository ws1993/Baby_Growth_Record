<template>
  <van-form @submit="onSubmit" class="record-form">
    <van-cell-group inset>
      <van-field
        v-model="form.date"
        name="date"
        label="记录日期"
        placeholder="请选择日期"
        :rules="[{ required: true, message: '请选择记录日期' }]"
        @click="showDatePicker = true"
        readonly
      />
      <van-field
        v-model.number="form.height"
        name="height"
        label="身高 (cm)"
        type="number"
        placeholder="请输入身高"
        :rules="[{ required: true, message: '请输入身高' }]"
      />
      <van-field
        v-model.number="form.weight"
        name="weight"
        label="体重 (kg)"
        type="number"
        placeholder="请输入体重"
        :rules="[{ required: true, message: '请输入体重' }]"
      />
    </van-cell-group>

    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        {{ isEdit ? '更新记录' : '添加记录' }}
      </van-button>
    </div>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :max-date="new Date()"
      />
    </van-popup>
  </van-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Record } from '@/types/record';

interface Props {
  initialData?: Record | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [data: Omit<Record, 'id' | 'memberId' | 'createdAt' | 'updatedAt'>];
}>();

const isEdit = ref(false);
const showDatePicker = ref(false);
const selectedDate = ref(new Date());

const form = reactive({
  date: '',
  height: 0,
  weight: 0,
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      isEdit.value = true;
      form.date = data.date;
      form.height = data.height;
      form.weight = data.weight;
    } else {
      isEdit.value = false;
      form.date = new Date().toISOString().split('T')[0];
      form.height = 0;
      form.weight = 0;
    }
  },
  { immediate: true }
);

const onDateConfirm = () => {
  form.date = selectedDate.value.toISOString().split('T')[0];
  showDatePicker.value = false;
};

const onSubmit = () => {
  emit('submit', {
    date: form.date,
    height: form.height,
    weight: form.weight,
    bmi: Number((form.weight / Math.pow(form.height / 100, 2)).toFixed(1)),
  });
};
</script>

<style scoped>
.record-form {
  padding: 16px 0;
}
</style>