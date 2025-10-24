# 开发规范与最佳实践

## 🎯 代码风格规范

### 1. Vue 3 Composition API 规范

#### ✅ 推荐写法
```vue
<template>
  <div class="member-card">
    <h3>{{ member.name }}</h3>
    <p>年龄：{{ formattedAge }}</p>
    <van-button @click="handleEdit">编辑</van-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Member } from '@/types/member';

// Props 定义
interface Props {
  member: Member;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Emits 定义
interface Emits {
  edit: [id: string];
  delete: [id: string];
}

const emit = defineEmits<Emits>();

// 响应式数据
const isEditing = ref(false);

// 计算属性
const formattedAge = computed(() => {
  return formatAge(calculateAgeInMonths(props.member.birthDate));
});

// 方法
const handleEdit = () => {
  emit('edit', props.member.id);
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
.member-card {
  /* 使用 scoped CSS */
}
</style>
```

#### ❌ 避免的写法
```vue
<!-- 避免使用 Options API -->
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

### 2. TypeScript 规范

#### 类型定义规范
```typescript
// ✅ 使用 interface 定义对象类型
interface Member {
  id: string;
  name: string;
  createdAt: string;
}

// ✅ 使用 type 定义联合类型、交叉类型
type Status = 'loading' | 'success' | 'error';
type UserWithRole = User & { role: string };

// ✅ 使用泛型提高复用性
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// ❌ 避免使用 any
const getData: any = await fetchData(); // 错误

// ✅ 明确指定类型
const getData: Member[] = await fetchData(); // 正确
```

#### 函数定义规范
```typescript
// ✅ 明确的返回类型和参数类型
const calculateBMI = (weight: number, height: number): number => {
  return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
};

// ✅ 异步函数返回 Promise 类型
const loadMembers = async (): Promise<Member[]> => {
  const response = await api.getMembers();
  return response.data;
};

// ✅ 使用可选参数
const formatDate = (date: string, format?: string): string => {
  // 实现逻辑
};
```

### 3. 组件设计规范

#### 组件命名规范
```typescript
// ✅ 使用 PascalCase
export default defineComponent({
  name: 'MemberCard' // 组件名
});

// ✅ 文件名与组件名保持一致
// components/MemberCard.vue
```

#### Props 定义规范
```typescript
// ✅ 明确的 Props 类型定义
interface Props {
  member: Member;
  readonly?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  loading: false
});
```

#### Emits 定义规范
```typescript
// ✅ 明确的 Emits 类型定义
interface Emits {
  update: [value: string];
  delete: [id: string];
  'custom-event': [payload: { id: string; data: any }];
}

const emit = defineEmits<Emits>();
```

## 🏪 Pinia Store 规范

### Store 结构规范
```typescript
// ✅ 推荐的 Store 结构
export const useMembersStore = defineStore('members', {
  state: (): MembersState => ({
    members: [],
    currentMemberId: null,
    loading: false,
    error: null
  }),

  getters: {
    // ✅ 使用箭头函数，自动推断返回类型
    currentMember: (state) =>
      state.members.find(member => member.id === state.currentMemberId),

    // ✅ 带参数的 getter
    memberById: (state) => (id: string) =>
      state.members.find(member => member.id === id)
  },

  actions: {
    // ✅ 明确的异步函数返回类型
    async loadMembers(): Promise<void> {
      this.loading = true;
      try {
        const members = await api.getMembers();
        this.members = members;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // ✅ 同步 action
    setCurrentMember(id: string | null): void {
      this.currentMemberId = id;
    }
  }
});
```

### 状态管理最佳实践
```typescript
// ✅ 使用常量定义 mutation 类型
const MUTATION_TYPES = {
  SET_MEMBERS: 'SET_MEMBERS',
  ADD_MEMBER: 'ADD_MEMBER',
  UPDATE_MEMBER: 'UPDATE_MEMBER',
  DELETE_MEMBER: 'DELETE_MEMBER'
} as const;

// ✅ 批量更新操作
const batchUpdateMembers = async (updates: UpdateMemberRequest[]): Promise<void> => {
  const originalMembers = [...members.value];

  try {
    // 乐观更新
    updates.forEach(update => {
      const index = members.value.findIndex(m => m.id === update.id);
      if (index !== -1) {
        members.value[index] = { ...members.value[index], ...update };
      }
    });

    // 发送到服务器
    await api.batchUpdateMembers(updates);
  } catch (error) {
    // 回滚操作
    members.value = originalMembers;
    throw error;
  }
};
```

## 🎨 CSS 样式规范

### 1. 命名规范
```css
/* ✅ BEM 命名规范 */
.member-card { /* Block */ }
.member-card__header { /* Element */ }
.member-card__title { /* Element */ }
.member-card--highlighted { /* Modifier */ }

/* ✅ 语义化命名 */
.navigation-primary {}
.content-main {}
.sidebar-secondary {}
```

### 2. 样式组织
```vue
<style scoped>
/* ✅ 按逻辑组织样式 */
.member-card {
  /* 布局相关 */
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;

  /* 视觉相关 */
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 定位相关 */
  position: relative;
}

.member-card__header {
  /* 布局 */
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* 字体 */
  font-size: 18px;
  font-weight: 600;
}

/* ✅ 响应式设计 */
@media (max-width: 768px) {
  .member-card {
    padding: 12px;
    gap: 12px;
  }
}
</style>
```

### 3. CSS 变量使用
```css
/* ✅ 定义全局变量 */
:root {
  --color-primary: #1989fa;
  --color-success: #07c160;
  --color-warning: #ff976a;
  --color-danger: #ee0a24;

  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

/* ✅ 在组件中使用 */
.member-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: var(--color-white);
}
```

## 🧪 测试规范

### 1. 单元测试规范
```typescript
// tests/utils/bmi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBMI, getBMIStatus } from '@/utils/bmi';

describe('BMI 计算工具', () => {
  describe('calculateBMI', () => {
    it('应该正确计算正常范围内的BMI', () => {
      expect(calculateBMI(70, 175)).toBe(22.9);
      expect(calculateBMI(60, 165)).toBe(22.0);
      expect(calculateBMI(50, 160)).toBe(19.5);
    });

    it('应该处理边界值', () => {
      expect(() => calculateBMI(0, 175)).toThrow('体重和身高必须大于0');
      expect(() => calculateBMI(70, 0)).toThrow('体重和身高必须大于0');
      expect(() => calculateBMI(-5, 175)).toThrow();
    });

    it('应该返回保留1位小数的结果', () => {
      const bmi = calculateBMI(68.7, 174.2);
      expect(bmi.toString()).toMatch(/^\d+\.\d$/);
    });
  });

  describe('getBMIStatus', () => {
    beforeEach(() => {
      // 测试前准备
    });

    it('应该正确分类BMI状态', () => {
      const result = getBMIStatus(18.5, 24, 'female');
      expect(result.category).toBe('normal');
      expect(result.description).toBeDefined();
      expect(result.suggestion).toBeDefined();
    });
  });
});
```

### 2. 组件测试规范
```typescript
// tests/components/MemberCard.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import MemberCard from '@/components/MemberCard.vue';
import type { Member } from '@/types/member';

describe('MemberCard 组件', () => {
  const mockMember: Member = {
    id: '1',
    name: '小明',
    gender: 'male',
    birthDate: '2020-01-01',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  it('应该正确渲染成员信息', () => {
    const wrapper = mount(MemberCard, {
      props: { member: mockMember }
    });

    expect(wrapper.find('h3').text()).toBe('小明');
    expect(wrapper.text()).toContain('年龄：');
  });

  it('应该在点击编辑按钮时触发 edit 事件', async () => {
    const wrapper = mount(MemberCard, {
      props: { member: mockMember }
    });

    await wrapper.find('[data-testid="edit-button"]').trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')?.[0]).toEqual(['1']);
  });

  it('应该在 loading 状态下显示加载指示器', () => {
    const wrapper = mount(MemberCard, {
      props: {
        member: mockMember,
        loading: true
      }
    });

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });
});
```

### 3. 集成测试规范
```typescript
// tests/integration/member-management.test.ts
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MemberList from '@/views/MemberList.vue';

describe('成员管理集成测试', () => {
  let wrapper: any;

  beforeEach(() => {
    const pinia = createPinia();
    wrapper = mount(MemberList, {
      global: {
        plugins: [pinia]
      }
    });
  });

  it('应该能够完整地创建新成员', async () => {
    // 1. 点击添加按钮
    await wrapper.find('[data-testid="add-member-btn"]').trigger('click');

    // 2. 填写表单
    await wrapper.find('[data-testid="member-name"]').setValue('测试成员');
    await wrapper.find('[data-testid="member-gender"]').setValue('male');
    await wrapper.find('[data-testid="member-birthdate"]').setValue('2020-01-01');

    // 3. 提交表单
    await wrapper.find('[data-testid="submit-form"]').trigger('click');

    // 4. 验证结果
    expect(wrapper.find('[data-testid="member-list"]').text()).toContain('测试成员');
  });
});
```

## 🔧 错误处理规范

### 1. 全局错误处理
```typescript
// src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}
```

### 2. 组件内错误处理
```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);

// 捕获子组件错误
onErrorCaptured((err) => {
  error.value = err;
  // 记录错误日志
  console.error('Component error:', err);

  // 返回 false 阻止错误继续传播
  return false;
});

const handleError = (err: Error) => {
  error.value = err;
  // 显示用户友好的错误信息
  showToast(err.message || '操作失败');
};

const loadMembers = async () => {
  try {
    const members = await api.getMembers();
    // 处理成功逻辑
  } catch (err) {
    handleError(err as Error);
  }
};
</script>

<template>
  <div>
    <van-loading v-if="loading" />

    <van-notice-bar
      v-if="error"
      type="danger"
      :text="error.message"
      @close="error = null"
    />

    <!-- 正常内容 -->
  </div>
</template>
```

### 3. API 错误处理
```typescript
// src/utils/api.ts
export const apiRequest = async <T>(
  request: () => Promise<T>,
  options: {
    retries?: number;
    retryDelay?: number;
    showError?: boolean;
  } = {}
): Promise<T> => {
  const { retries = 0, retryDelay = 1000, showError = true } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  if (showError) {
    showToast(lastError.message || '请求失败');
  }

  throw lastError;
};
```

## 📝 注释规范

### 1. JSDoc 注释
```typescript
/**
 * 计算身体质量指数 (BMI)
 * @param weight 体重，单位千克
 * @param height 身高，单位厘米
 * @returns BMI值，保留一位小数
 * @throws {Error} 当体重或身高小于等于0时抛出错误
 *
 * @example
 * ```typescript
 * const bmi = calculateBMI(70, 175); // 返回 22.9
 * ```
 */
export const calculateBMI = (weight: number, height: number): number => {
  // 实现逻辑
};
```

### 2. 组件注释
```vue
<template>
  <!-- 成员卡片组件：显示成员基本信息和操作按钮 -->
  <div class="member-card">
    <!-- 成员基本信息区域 -->
    <div class="member-info">
      <h3>{{ member.name }}</h3>
      <p>{{ formattedAge }}</p>
    </div>

    <!-- 操作按钮区域 -->
    <div class="member-actions">
      <van-button @click="handleEdit">编辑</van-button>
      <van-button @click="handleDelete" type="danger">删除</van-button>
    </div>
  </div>
</template>
```

### 3. 复杂逻辑注释
```typescript
// 批量更新成员信息
// 1. 创建乐观更新副本，用于错误回滚
const originalMembers = [...members.value];

try {
  // 2. 立即更新本地状态，提供即时反馈
  updates.forEach(update => {
    const index = members.value.findIndex(m => m.id === update.id);
    if (index !== -1) {
      members.value[index] = { ...members.value[index], ...update };
    }
  });

  // 3. 发送到服务器进行持久化
  await api.batchUpdateMembers(updates);

  // 4. 更新成功，清理临时状态
  showSuccessToast('更新成功');
} catch (error) {
  // 5. 发生错误，回滚到原始状态
  members.value = originalMembers;
  showErrorToast('更新失败，请重试');
  throw error; // 向上传递错误
}
```

## 🚀 性能优化规范

### 1. 组件懒加载
```typescript
// src/router/index.ts
const routes = [
  {
    path: '/member/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue') // 懒加载
  }
];
```

### 2. 计算属性优化
```typescript
// ✅ 使用计算属性缓存昂贵计算
const chartData = computed(() => {
  return records.value
    .filter(record => record.memberId === currentMemberId.value)
    .map(record => ({
      date: record.date,
      height: record.height,
      weight: record.weight
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// ✅ 避免在模板中进行复杂计算
<template>
  <!-- ❌ 避免这样写 -->
  <div>{{ calculateBMI(record.weight, record.height) }}</div>

  <!-- ✅ 推荐这样写 -->
  <div>{{ record.bmi }}</div>
</template>
```

### 3. 列表渲染优化
```vue
<template>
  <!-- ✅ 使用 key 进行高效 diff -->
  <van-list>
    <van-cell
      v-for="member in members"
      :key="member.id"
      :title="member.name"
    />
  </van-list>

  <!-- ✅ 大数据量时使用虚拟滚动 -->
  <van-virtual-list
    :data="members"
    :item-size="60"
    key-field="id"
  >
    <template #default="{ item }">
      <MemberCard :member="item" />
    </template>
  </van-virtual-list>
</template>
```

---

**重要提醒：** 代码质量是项目成功的关键。请严格遵循这些规范，确保代码的可维护性、可读性和性能。在开发过程中，定期进行代码审查和重构。