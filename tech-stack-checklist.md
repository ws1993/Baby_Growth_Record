# 技术栈配置清单

## 📦 需要安装的依赖包

### 核心依赖
```bash
# 路由和状态管理
npm install vue-router@4
npm install pinia

# UI组件库
npm install vant@4

# 图表库
npm install echarts
npm install vue-echarts

# WebDAV和加密
npm install webdav
npm install crypto-js

# 日期处理
npm install dayjs
```

### 开发依赖
```bash
# 类型定义
npm install -D @types/crypto-js

# 测试框架
npm install -D vitest
npm install -D @vue/test-utils
npm install -D jsdom
```

## ⚙️ Rsbuild 配置要点

### 1. Vant UI 按需导入配置
```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginSass()
  ],
  source: {
    alias: {
      '@': './src'
    }
  },
  performance: {
    transformRemoveConsole: false // 开发环境保留console
  }
});
```

### 2. Vite 风格的插件配置（如果需要）
```typescript
// 可能需要额外的Vite插件配置来支持Vant UI按需导入
```

## 🔧 关键配置文件模板

### 1. 路由配置 (src/router/index.ts)
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/members',
    name: 'MemberList',
    component: () => import('@/views/MemberList.vue')
  },
  {
    path: '/member/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue')
  },
  {
    path: '/add-record/:memberId',
    name: 'AddRecord',
    component: () => import('@/views/AddRecord.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 2. Pinia 配置 (src/stores/index.ts)
```typescript
import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出所有store
export { useMembersStore } from './members';
export { useRecordsStore } from './records';
export { useSettingsStore } from './settings';
```

### 3. 主应用入口 (src/main.ts)
```typescript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';

// Vant UI 样式
import 'vant/lib/index.css';

// 全局样式
import '@/assets/styles/main.css';

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
```

## 📱 Vant UI 组件使用规范

### 常用组件映射
- 页面布局：`van-nav-bar`, `van-tabbar`
- 表单输入：`van-form`, `van-field`, `van-cell-group`
- 数据展示：`van-list`, `van-card`, `van-cell`
- 交互反馈：`van-button`, `van-dialog`, `van-toast`, `van-loading`
- 数据选择：`van-datetime-picker`, `van-popup`

### 组件使用示例
```vue
<template>
  <van-nav-bar
    title="成员列表"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
  />

  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-field
        v-model="form.name"
        name="name"
        label="姓名"
        placeholder="请输入姓名"
        :rules="[{ required: true, message: '请输入姓名' }]"
      />
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="form.gender" direction="horizontal">
            <van-radio name="male">男</van-radio>
            <van-radio name="female">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>
    </van-cell-group>
  </van-form>
</template>
```

## 📊 ECharts 图表配置要点

### 基础配置 (src/components/GrowthChart.vue)
```typescript
import type { EChartsOption } from 'echarts';

const chartOption = ref<EChartsOption>({
  title: {
    text: '成长趋势',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['身高', '体重', 'BMI'],
    bottom: 0
  },
  xAxis: {
    type: 'category',
    data: [] // 日期数组
  },
  yAxis: [
    {
      type: 'value',
      name: '身高(cm)',
      position: 'left'
    },
    {
      type: 'value',
      name: '体重(kg)',
      position: 'right'
    }
  ],
  series: [
    {
      name: '身高',
      type: 'line',
      data: [] // 身高数据
    },
    {
      name: '体重',
      type: 'line',
      yAxisIndex: 1,
      data: [] // 体重数据
    },
    {
      name: 'BMI',
      type: 'line',
      data: [] // BMI数据
    }
  ]
});
```

## 🔐 安全实现要点

### 1. 加密配置
```typescript
// src/utils/crypto.ts
import CryptoJS from 'crypto-js';

export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptData = (encryptedData: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error('解密失败：密码错误或数据损坏');
  }

  return decrypted;
};
```

### 2. WebDAV 配置
```typescript
// src/utils/webdav.ts
import { createClient } from 'webdav';

export const createWebDAVClient = (config: {
  url: string;
  username: string;
  password: string;
}) => {
  return createClient(config.url, {
    username: config.username,
    password: config.password
  });
};
```

## 🧪 测试配置要点

### 1. Vitest 配置 (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
```

### 2. 测试工具函数示例
```typescript
// tests/utils/bmi.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBMI } from '@/utils/bmi';

describe('BMI计算', () => {
  it('应该正确计算BMI值', () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
    expect(calculateBMI(50, 160)).toBe(19.5);
  });

  it('应该处理边界值', () => {
    expect(() => calculateBMI(0, 175)).toThrow();
    expect(() => calculateBMI(70, 0)).toThrow();
  });
});
```

## 📁 文件创建顺序建议

### 第一批：基础配置文件
1. `src/types/` - 类型定义文件
2. `src/router/` - 路由配置
3. `src/stores/` - 状态管理配置
4. `src/utils/` - 工具函数

### 第二批：核心组件
1. `src/views/` - 页面组件
2. `src/components/` - 可复用组件
3. `src/assets/styles/` - 样式文件

### 第三批：测试文件
1. `tests/` - 测试配置和用例
2. 组件测试文件
3. 工具函数测试文件

---

**注意：** 在安装依赖时，如果遇到版本兼容性问题，请查看各个包的官方文档获取最新的兼容版本信息。