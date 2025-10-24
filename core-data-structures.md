# 核心数据结构定义

## 📋 接口定义文件

### 1. 成员相关接口 (src/types/member.ts)

```typescript
// 性别枚举
export type Gender = 'male' | 'female';

// 成员接口
export interface Member {
  id: string;                    // 唯一标识符 (UUID)
  name: string;                  // 姓名
  gender: Gender;               // 性别
  birthDate: string;            // 出生日期 (YYYY-MM-DD)
  avatar?: string;              // 头像URL（可选）
  createdAt: string;            // 创建时间 (ISO string)
  updatedAt: string;            // 最后更新时间 (ISO string)
}

// 成员创建接口
export interface CreateMemberRequest {
  name: string;
  gender: Gender;
  birthDate: string;
  avatar?: string;
}

// 成员更新接口
export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  id: string;
}

// 成员统计信息
export interface MemberStats {
  id: string;
  name: string;
  recordCount: number;          // 记录总数
  firstRecordDate?: string;     // 首次记录日期
  lastRecordDate?: string;      // 最近记录日期
  heightRange?: {              // 身高范围
    min: number;
    max: number;
  };
  weightRange?: {              // 体重范围
    min: number;
    max: number;
  };
}
```

### 2. 记录相关接口 (src/types/record.ts)

```typescript
// 成长记录接口
export interface Record {
  id: string;                  // 唯一标识符 (UUID)
  memberId: string;            // 关联的成员ID
  date: string;                // 记录日期 (YYYY-MM-DD)
  height: number;              // 身高 (cm)
  weight: number;              // 体重 (kg)
  bmi?: number;                // 自动计算的BMI值
  heightChange?: number;       // 与上次记录的身高变化 (cm)
  weightChange?: number;       // 与上次记录的体重变化 (kg)
  bmiChange?: number;          // 与上次记录的BMI变化
  ageMonths?: number;          // 记录时的年龄（月）
  createdAt: string;           // 创建时间 (ISO string)
  updatedAt: string;           // 最后更新时间 (ISO string)
}

// 记录创建接口
export interface CreateRecordRequest {
  memberId: string;
  date: string;
  height: number;
  weight: number;
}

// 记录更新接口
export interface UpdateRecordRequest extends Partial<CreateRecordRequest> {
  id: string;
}

// 记录统计信息
export interface RecordStats {
  totalRecords: number;
  heightTrend: 'increasing' | 'decreasing' | 'stable';
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  averageHeightGain: number;   // 平均月身高增长 (cm/month)
  averageWeightGain: number;   // 平均月体重增长 (kg/month)
}
```

### 3. 设置相关接口 (src/types/settings.ts)

```typescript
// WebDAV配置接口
export interface WebDAVConfig {
  url: string;                 // WebDAV服务器地址
  username: string;            // 用户名
  password: string;            // 密码
}

// 应用设置接口
export interface AppSettings {
  webdav: WebDAVConfig;
  encryptionPassword: string;  // 加密密码（仅本地存储）
  theme: 'light' | 'dark' | 'auto';  // 主题设置
  language: 'zh-CN' | 'en-US';       // 语言设置
  autoSync: boolean;          // 是否自动同步
  lastSyncTime?: string;      // 最后同步时间
}

// 导出数据接口
export interface ExportData {
  version: string;            // 数据版本号
  exportTime: string;         // 导出时间
  members: Member[];          // 成员数据
  records: Record[];          // 记录数据
  settings?: AppSettings;     // 设置数据（可选）
}

// 导入验证结果
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataCount: {
    members: number;
    records: number;
  };
}
```

### 4. 图表相关接口 (src/types/chart.ts)

```typescript
// 图表数据点接口
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// 身高图表数据
export interface HeightChartData {
  dates: string[];
  heights: number[];
  ageLabels: string[];        // 年龄标签（如："2岁3个月"）
}

// 体重图表数据
export interface WeightChartData {
  dates: string[];
  weights: number[];
  ageLabels: string[];
}

// BMI图表数据
export interface BMIChartData {
  dates: string[];
  bmis: number[];
  ageLabels: string[];
  standardRanges?: {          // 标准BMI范围
    underweight: number;
    normal: [number, number];
    overweight: number;
    obese: number;
  };
}

// 综合图表配置
export interface GrowthChartConfig {
  showHeight: boolean;
  showWeight: boolean;
  showBMI: boolean;
  showStandardCurves: boolean; // 是否显示标准曲线
  dateRange: {
    start: string;
    end: string;
  };
}
```

### 5. API相关接口 (src/types/api.ts)

```typescript
// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 同步状态
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: string;
  syncError?: string;
  pendingChanges: number;
}
```

## 🏪 Pinia Store 结构定义

### 1. 成员Store (src/stores/members.ts)

```typescript
import { defineStore } from 'pinia';
import type { Member, CreateMemberRequest, UpdateMemberRequest, MemberStats } from '@/types/member';

interface MembersState {
  members: Member[];
  currentMemberId: string | null;
  loading: boolean;
  error: string | null;
}

export const useMembersStore = defineStore('members', {
  state: (): MembersState => ({
    members: [],
    currentMemberId: null,
    loading: false,
    error: null
  }),

  getters: {
    currentMember: (state) =>
      state.members.find(member => member.id === state.currentMemberId),

    membersCount: (state) => state.members.length,

    membersWithStats: (state) => state.members.map(member => ({
      ...member,
      stats: // 计算统计信息
    }))
  },

  actions: {
    async loadMembers(): Promise<void>,
    async createMember(data: CreateMemberRequest): Promise<Member>,
    async updateMember(data: UpdateMemberRequest): Promise<Member>,
    async deleteMember(id: string): Promise<void>,
    setCurrentMember(id: string | null): void,
    async exportMembers(): Promise<string>,
    async importMembers(data: string): Promise<void>
  }
});
```

### 2. 记录Store (src/stores/records.ts)

```typescript
import { defineStore } from 'pinia';
import type { Record, CreateRecordRequest, UpdateRecordRequest, RecordStats } from '@/types/record';

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

export const useRecordsStore = defineStore('records', {
  state: (): RecordsState => ({
    records: [],
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    recordsByMember: (state) => (memberId: string) =>
      state.records
        .filter(record => record.memberId === memberId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

    latestRecord: (state) => (memberId: string) =>
      // 获取最新记录

    recordsForChart: (state) => (memberId: string) =>
      // 获取用于图表的数据格式
  },

  actions: {
    async loadRecords(memberId?: string): Promise<void>,
    async createRecord(data: CreateRecordRequest): Promise<Record>,
    async updateRecord(data: UpdateRecordRequest): Promise<Record>,
    async deleteRecord(id: string): Promise<void>,
    async calculateBMI(record: Record): Promise<number>,
    async calculateChanges(record: Record): Promise<void>,
    setFilters(filters: Partial<RecordsState['filters']>): void
  }
});
```

### 3. 设置Store (src/stores/settings.ts)

```typescript
import { defineStore } from 'pinia';
import type { AppSettings, SyncStatus } from '@/types/settings';

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: {
      webdav: {
        url: '',
        username: '',
        password: ''
      },
      encryptionPassword: '',
      theme: 'auto',
      language: 'zh-CN',
      autoSync: false
    },
    loading: false,
    syncStatus: {
      isOnline: false,
      isSyncing: false,
      pendingChanges: 0
    },
    error: null
  }),

  getters: {
    isWebDAVConfigured: (state) =>
      state.settings.webdav.url &&
      state.settings.webdav.username &&
      state.settings.webdav.password,

    canSync: (state) =>
      state.isWebDAVConfigured &&
      state.settings.encryptionPassword &&
      state.syncStatus.isOnline
  },

  actions: {
    async loadSettings(): Promise<void>,
    async saveSettings(): Promise<void>,
    async testWebDAVConnection(): Promise<boolean>,
    async syncToWebDAV(): Promise<void>,
    async syncFromWebDAV(): Promise<void>,
    async exportData(): Promise<string>,
    async importData(jsonData: string): Promise<void>,
    updateSettings(newSettings: Partial<AppSettings>): void
  }
});
```

## 🛠️ 工具函数定义

### 1. BMI计算 (src/utils/bmi.ts)

```typescript
/**
 * 计算BMI值
 * @param weight 体重 (kg)
 * @param height 身高 (cm)
 * @returns BMI值 (保留1位小数)
 */
export const calculateBMI = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) {
    throw new Error('体重和身高必须大于0');
  }

  const heightInMeters = height / 100;
  const bmi = weight / Math.pow(heightInMeters, 2);
  return Number(bmi.toFixed(1));
};

/**
 * 获取BMI状态分类
 * @param bmi BMI值
 * @param age 年龄（月）
 * @param gender 性别
 * @returns BMI分类和健康建议
 */
export const getBMIStatus = (
  bmi: number,
  age: number,
  gender: 'male' | 'female'
): {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
  suggestion: string;
} => {
  // 根据儿童BMI标准进行分类
  // 这里需要根据年龄和性别使用不同的标准
  // ...
};
```

### 2. 日期处理 (src/utils/date.ts)

```typescript
/**
 * 计算年龄（月）
 * @param birthDate 出生日期
 * @param targetDate 目标日期（默认为今天）
 * @returns 年龄（月）
 */
export const calculateAgeInMonths = (
  birthDate: string,
  targetDate: string = new Date().toISOString().split('T')[0]
): number => {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);

  let months = (target.getFullYear() - birth.getFullYear()) * 12;
  months += target.getMonth() - birth.getMonth();

  if (target.getDate() < birth.getDate()) {
    months--;
  }

  return Math.max(0, months);
};

/**
 * 格式化年龄显示
 * @param months 年龄（月）
 * @returns 格式化的年龄字符串
 */
export const formatAge = (months: number): string => {
  if (months < 12) {
    return `${months}个月`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years}岁`;
  }

  return `${years}岁${remainingMonths}个月`;
};
```

### 3. 数据验证 (src/utils/validation.ts)

```typescript
/**
 * 验证成员数据
 */
export const validateMember = (member: CreateMemberRequest): string[] => {
  const errors: string[] = [];

  if (!member.name || member.name.trim().length === 0) {
    errors.push('姓名不能为空');
  }

  if (member.name && member.name.length > 20) {
    errors.push('姓名不能超过20个字符');
  }

  if (!member.birthDate) {
    errors.push('出生日期不能为空');
  } else {
    const birthDate = new Date(member.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.push('出生日期不能是未来日期');
    }

    // 检查年龄是否合理（比如不超过150岁）
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (ageInYears > 150) {
      errors.push('出生日期不合法');
    }
  }

  return errors;
};

/**
 * 验证记录数据
 */
export const validateRecord = (record: CreateRecordRequest): string[] => {
  const errors: string[] = [];

  if (!record.date) {
    errors.push('记录日期不能为空');
  }

  if (record.height && (record.height < 30 || record.height > 250)) {
    errors.push('身高数值应在30-250cm之间');
  }

  if (record.weight && (record.weight < 1 || record.weight > 300)) {
    errors.push('体重数值应在1-300kg之间');
  }

  return errors;
};
```

## 📊 本地存储结构

### LocalStorage 数据结构

```typescript
// 存储键名常量
export const STORAGE_KEYS = {
  MEMBERS: 'baby_growth_members',
  RECORDS: 'baby_growth_records',
  SETTINGS: 'baby_growth_settings',
  CURRENT_MEMBER: 'baby_growth_current_member',
  LAST_SYNC: 'baby_growth_last_sync'
} as const;

// 存储的数据结构
interface LocalStorageData {
  [STORAGE_KEYS.MEMBERS]: Member[];
  [STORAGE_KEYS.RECORDS]: Record[];
  [STORAGE_KEYS.SETTINGS]: AppSettings;
  [STORAGE_KEYS.CURRENT_MEMBER]: string | null;
  [STORAGE_KEYS.LAST_SYNC]: string | null;
}
```

---

**重要提醒：** 所有数据结构都使用严格的TypeScript类型定义，确保类型安全和开发体验。在实际开发中，所有接口都应该有完整的JSDoc注释说明。