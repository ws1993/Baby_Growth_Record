import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  CreateRecordRequest,
  Record,
  RecordStats,
  UpdateRecordRequest,
} from '@/types/record';

interface RecordsState {
  records: Record[];
  loading: boolean;
  error: string | null;
  filters: {
    memberId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export const useRecordsStore = defineStore('records', () => {
  // 状态
  const records = ref<Record[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<RecordsState['filters']>({});

  // 计算属性
  const recordsByMember = computed(
    () => (memberId: string) =>
      records.value
        .filter((record) => record.memberId === memberId)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
  );

  const latestRecord = computed(() => (memberId: string) => {
    const memberRecords = recordsByMember.value(memberId);
    return memberRecords.length > 0 ? memberRecords[0] : null;
  });

  const recordsForChart = computed(() => (memberId: string) => {
    return recordsByMember
      .value(memberId)
      .slice()
      .reverse()
      .map((record) => ({
        date: record.date,
        height: record.height,
        weight: record.weight,
        bmi: record.bmi,
      }));
  });

  // 方法
  const loadRecords = async (memberId?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const storedRecords = localStorage.getItem('baby_growth_records');
      if (storedRecords) {
        const allRecords = JSON.parse(storedRecords) as Record[];

        if (memberId) {
          records.value = allRecords.filter(
            (record) => record.memberId === memberId,
          );
        } else {
          records.value = allRecords;
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载记录数据失败';
    } finally {
      loading.value = false;
    }
  };

  const saveRecords = async (): Promise<void> => {
    try {
      // 获取所有记录（包括其他成员的）
      const storedRecords = localStorage.getItem('baby_growth_records');
      let allRecords: Record[] = [];

      if (storedRecords) {
        allRecords = JSON.parse(storedRecords);
      }

      // 移除当前成员的旧记录
      allRecords = allRecords.filter(
        (record) =>
          !filters.value.memberId || record.memberId !== filters.value.memberId,
      );

      // 添加当前记录
      allRecords.push(...records.value);

      localStorage.setItem('baby_growth_records', JSON.stringify(allRecords));
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存记录数据失败';
      throw err;
    }
  };

  const createRecord = async (data: CreateRecordRequest): Promise<Record> => {
    const bmi = calculateBMI(data.weight, data.height);

    const newRecord: Record = {
      id: generateId(),
      ...data,
      bmi,
      ageMonths: calculateAgeInMonths(
        data.date,
        getMemberBirthDate(data.memberId),
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 计算变化量
    await calculateChanges(newRecord);

    records.value.unshift(newRecord);
    await saveRecords();

    return newRecord;
  };

  const updateRecord = async (data: UpdateRecordRequest): Promise<Record> => {
    const index = records.value.findIndex((record) => record.id === data.id);
    if (index === -1) {
      throw new Error('记录不存在');
    }

    const updatedRecord: Record = {
      ...records.value[index],
      ...data,
      bmi:
        data.weight && data.height
          ? calculateBMI(data.weight, data.height)
          : records.value[index].bmi,
      updatedAt: new Date().toISOString(),
    };

    records.value[index] = updatedRecord;
    await saveRecords();

    return updatedRecord;
  };

  const deleteRecord = async (id: string): Promise<void> => {
    const index = records.value.findIndex((record) => record.id === id);
    if (index === -1) {
      throw new Error('记录不存在');
    }

    records.value.splice(index, 1);
    await saveRecords();
  };

  const setFilters = (newFilters: Partial<RecordsState['filters']>): void => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const calculateBMI = (weight: number, height: number): number => {
    if (weight <= 0 || height <= 0) {
      throw new Error('体重和身高必须大于0');
    }
    const heightInMeters = height / 100;
    return Number((weight / heightInMeters ** 2).toFixed(1));
  };

  const calculateAgeInMonths = (
    recordDate: string,
    birthDate: string,
  ): number => {
    const birth = new Date(birthDate);
    const record = new Date(recordDate);

    let months = (record.getFullYear() - birth.getFullYear()) * 12;
    months += record.getMonth() - birth.getMonth();

    if (record.getDate() < birth.getDate()) {
      months--;
    }

    return Math.max(0, months);
  };

  const getMemberBirthDate = (memberId: string): string => {
    // 这里需要从members store获取，暂时返回默认值
    // 在实际使用中会通过依赖注入或其他方式获取
    return '2020-01-01';
  };

  const calculateChanges = async (record: Record): Promise<void> => {
    const previousRecord = records.value.find(
      (r) =>
        r.memberId === record.memberId &&
        new Date(r.date) < new Date(record.date),
    );

    if (previousRecord) {
      record.heightChange = Number(
        (record.height - previousRecord.height).toFixed(1),
      );
      record.weightChange = Number(
        (record.weight - previousRecord.weight).toFixed(1),
      );
      record.bmiChange = Number(
        ((record.bmi || 0) - (previousRecord.bmi || 0)).toFixed(1),
      );
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  return {
    // 状态
    records: readonly(records),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),

    // 计算属性
    recordsByMember,
    latestRecord,
    recordsForChart,

    // 方法
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    setFilters,
    calculateBMI,
  };
});
