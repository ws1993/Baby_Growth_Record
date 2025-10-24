# Stage1 - 技术配置调研报告

## 调研目标：Rsbuild+Vue3+Vant技术栈的最新配置最佳实践和兼容性要求

**调研人员**: Scout B - 技术配置调研员
**调研时间**: 2025-10-24
**调研内容**: 阶段一 - 项目基础搭建（依赖安装、配置、文件夹创建、UI库集成）

---

## 1. Rsbuild + Vant 4 配置方案

### 1.1 推荐版本信息

```json
{
  "vant": "^4.9.2",
  "@rsbuild/plugin-vue": "^1.1.2",
  "@rsbuild/plugin-style-import": "^1.1.2",
  "@vant/auto-import-resolver": "^1.2.0"
}
```

### 1.2 Rsbuild配置修改

```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginStyleImport } from '@rsbuild/plugin-style-import';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginVueJsx(),
    pluginStyleImport({
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: (name) => `vant/es/${name}/style`,
      // 按需导入配置
      include: [/vant\/es\/.*\/style/],
    })
  ],
});
```

### 1.2.1 替代方案：使用unplugin-vue-components

```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';

export default defineConfig({
  plugins: [
    pluginVue(),
    Components({
      resolvers: [
        VantResolver({
          importStyle: false, // CSS on-demand
        }),
      ],
    })
  ],
});
```

### 1.3 按需导入使用示例

```typescript
import { Button, Cell, Form } from 'vant';

// 按需导入会自动引入对应的CSS
```

---

## 2. Vue 3 + Vue Router 4 + Pinia 配置

### 2.1 推荐版本

```json
{
  "vue": "^3.4.21",
  "vue-router": "^4.3.2",
  "pinia": "^2.1.7"
}
```

### 2.2 安装命令

```bash
npm install vue-router@^4.3.2 pinia@^2.1.7
```

### 2.3 Router配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
});

export default router;
```

### 2.4 Pinia配置

```typescript
// src/stores/index.ts
import { createPinia } from 'pinia';

const pinia = createPinia();
export default pinia;

// store示例
import { defineStore } from 'pinia';

export const useBabyStore = defineStore('baby', {
  state: () => ({
    babies: []
  }),
  actions: {
    addBaby(baby) {
      this.babies.push(baby);
    }
  }
});
```

---

## 3. ECharts for Vue 配置

### 3.1 推荐版本

```json
{
  "echarts": "^5.5.0",
  "vue-echarts": "^6.7.3"
}
```

### 3.2 安装配置

```bash
npm install echarts@^5.5.0 vue-echarts@^6.7.3
npm install --save-dev @types/echarts@^5.5.0
```

### 3.3 Vue组件封装（推荐vue-echarts）

```vue
<!-- src/components/Chart.vue -->
<template>
  <v-chart :option="option" :autoresize="true" />
</template>

<script setup lang="ts">
import { VChart, THEME_KEY } from 'vue-echarts';
import { ref } from 'vue';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  option: EChartsOption;
}>();

defineOptions({
  name: 'Chart',
});
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
```

### 3.4 使用示例

```vue
<template>
  <Chart :option="chartOption" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Chart from '@/components/Chart.vue';

const chartOption = ref({
  title: {
    text: '宝宝成长数据'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [65, 59, 80],
    type: 'line'
  }]
});
</script>
```

### 3.5 TypeScript类型

```typescript
// 安装类型定义
npm install --save-dev @types/echarts@^5.5.0
```

---

## 4. WebDAV客户端配置

### 4.1 推荐版本

```json
{
  "webdav": "^4.11.2",
  "axios": "^1.6.8"
}
```

### 4.2 安装配置

```bash
npm install webdav@^4.11.2 axios@^1.6.8
```

### 4.3 WebDAV服务封装

```typescript
// src/utils/webdav.ts
import { Client } from 'webdav';

export interface WebDAVConfig {
  server: string;
  username: string;
  password: string;
}

export class WebDAVService {
  private client: Client;

  constructor(config: WebDAVConfig) {
    this.client = new Client(config.server, {
      username: config.username,
      password: config.password,
    });
  }

  // 检查目录是否存在
  async isDirectoryExist(path: string): Promise<boolean> {
    try {
      await this.client.getDirectoryContents(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 创建目录
  async createDirectory(path: string): Promise<void> {
    await this.client.createDirectory(path);
  }

  // 上传文件
  async uploadFile(filePath: string, fileData: Blob): Promise<void> {
    await this.client.putFileContents(filePath, fileData);
  }

  // 下载文件
  async downloadFile(filePath: string): Promise<Blob> {
    return await this.client.getFileContents(filePath);
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<void> {
    await this.client.deleteFile(filePath);
  }

  // 列出文件
  async listFiles(path: string = '/'): Promise<any[]> {
    return await this.client.getDirectoryContents(path);
  }

  // 获取文件信息
  async getFileStats(filePath: string): Promise<any> {
    return await this.client.getFileInfo(filePath);
  }
}
```

### 4.4 使用示例

```typescript
// src/services/webdav.ts
import { WebDAVService } from '@/utils/webdav';

const webdavConfig = {
  server: 'https://your-webdav-server.com',
  username: process.env.VITE_WEBDAV_USERNAME!,
  password: process.env.VITE_WEBDAV_PASSWORD!,
};

const webdavService = new WebDAVService(webdavConfig);

// 上传宝宝照片
async function uploadBabyPhoto(file: File, babyId: string, filename: string) {
  const filePath = `/babies/${babyId}/photos/${filename}`;
  await webdavService.uploadFile(filePath, file);
  return filePath;
}

// 下载宝宝照片
async function downloadBabyPhoto(filePath: string) {
  return await webdavService.downloadFile(filePath);
}

// 列出宝宝照片
async function listBabyPhotos(babyId: string) {
  const photosPath = `/babies/${babyId}/photos/`;
  const files = await webdavService.listFiles(photosPath);
  return files.filter(file => file.type === 'file');
}
```

---

## 5. crypto-js 配置

### 5.1 推荐版本

```json
{
  "crypto-js": "^4.2.0",
  "@types/crypto-js": "^4.2.1"
}
```

### 5.2 安装配置

```bash
npm install crypto-js@^4.2.0
npm install --save-dev @types/crypto-js@^4.2.1
```

### 5.3 数据加密工具封装

```typescript
// src/utils/encryption.ts
import CryptoJS from 'crypto-js';

export interface EncryptionConfig {
  key: string;
  iv?: string;
}

export class EncryptionService {
  private key: string;
  private iv: string;

  constructor(config: EncryptionConfig) {
    this.key = CryptoJS.enc.Utf8.parse(config.key);
    this.iv = CryptoJS.enc.Utf8.parse(config.iv || config.key.substring(0, 16));
  }

  // AES加密
  encrypt(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(text, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  // AES解密
  decrypt(encryptedText: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // MD5哈希
  md5(text: string): string {
    return CryptoJS.MD5(text).toString();
  }

  // SHA256哈希
  sha256(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  // 生成随机密钥
  static generateKey(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
```

### 5.4 使用示例

```typescript
// src/utils/encryption.ts
import { EncryptionService } from '@/utils/encryption';

// 初始化加密服务
const encryptionService = new EncryptionService({
  key: 'your-secret-key-32-characters-long',
});

// 敏感数据加密
function encryptSensitiveData(data: any): string {
  const jsonData = JSON.stringify(data);
  return encryptionService.encrypt(jsonData);
}

// 敏感数据解密
function decryptSensitiveData(encryptedData: string): any {
  const decryptedData = encryptionService.decrypt(encryptedData);
  return JSON.parse(decryptedData);
}

// 用户密码处理
async function hashPassword(password: string): Promise<string> {
  // 使用盐值进行哈希
  const salt = EncryptionService.generateKey(16);
  const hashedPassword = encryptionService.sha256(password + salt);
  return `${salt}:${hashedPassword}`;
}

// 验证密码
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const expectedHash = encryptionService.sha256(password + salt);
  return hash === expectedHash;
}

// API数据签名
function generateApiSignature(data: any, secret: string): string {
  const timestamp = Date.now().toString();
  const stringToSign = JSON.stringify(data) + timestamp;
  return encryptionService.md5(stringToSign + secret);
}
```

---

## 6. Vitest + Vue Testing Library 配置

### 6.1 推荐版本

```json
{
  "vitest": "^1.6.0",
  "@testing-library/vue": "^8.0.0",
  "@testing-library/user-event": "^14.5.0",
  "@vue/test-utils": "^2.4.0",
  "jsdom": "^23.0.1"
}
```

### 6.2 安装配置

```bash
npm install --save-dev vitest@^1.6.0 @testing-library/vue@^8.0.0 @testing-library/user-event@^14.5.0 @vue/test-utils@^2.4.0 jsdom@^23.0.1
```

### 6.3 Vitest配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
      ],
    },
  },
});
```

### 6.4 测试设置

```typescript
// src/test/setup.ts
import { vi } from 'vitest';
import '@testing-library/vue';

// 全局测试配置
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 6.5 组件测试示例

```typescript
// src/components/Button.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button.vue';

describe('Button Component', () => {
  it('renders button with correct text', () => {
    const wrapper = mount(Button, {
      props: {
        label: 'Click me',
      },
    });

    expect(wrapper.text()).toBe('Click me');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      props: {
        label: 'Click me',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('applies disabled state correctly', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.find('button').attributes('disabled')).toBe('');
  });
});
```

### 6.6 页面测试示例

```typescript
// src/views/Home.spec.ts
import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/views/Home.vue';

describe('Home View', () => {
  it('displays welcome message', () => {
    render(Home);

    expect(screen.getByText('欢迎使用宝宝成长记录')).toBeInTheDocument();
  });

  it('navigates to babies page on button click', async () => {
    render(Home);

    const button = screen.getByText('查看宝宝列表');
    await fireEvent.click(button);

    // 检查路由跳转
    expect(window.location.pathname).toBe('/babies');
  });
});
```

### 6.7 Pinia Store测试示例

```typescript
// src/stores/baby.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useBabyStore } from '@/stores/baby';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Baby Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds baby to store', () => {
    const babyStore = useBabyStore();
    const baby = { name: '小明', birthDate: '2023-01-01' };

    babyStore.addBaby(baby);

    expect(babyStore.babies).toHaveLength(1);
    expect(babyStore.babies[0]).toEqual(baby);
  });

  it('removes baby from store', () => {
    const babyStore = useBabyStore();
    const baby = { name: '小明', birthDate: '2023-01-01' };

    babyStore.addBaby(baby);
    babyStore.removeBaby(baby.id);

    expect(babyStore.babies).toHaveLength(0);
  });
});
```

---

## 7. 完整依赖版本和兼容性分析

### 7.1 完整package.json依赖

```json
{
  "name": "baby-growth-record",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "rsbuild dev --open",
    "build": "rsbuild build",
    "preview": "rsbuild preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "format": "biome format --write",
    "lint": "biome check --write"
  },
  "dependencies": {
    "vue": "^3.4.21",
    "vue-router": "^4.3.2",
    "pinia": "^2.1.7",
    "vant": "^4.9.2",
    "echarts": "^5.5.0",
    "vue-echarts": "^6.7.3",
    "webdav": "^4.11.2",
    "crypto-js": "^4.2.0",
    "axios": "^1.6.8"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@rsbuild/core": "^1.5.14",
    "@rsbuild/plugin-vue": "^1.1.2",
    "@rsbuild/plugin-style-import": "^1.1.2",
    "@rsbuild/plugin-vue-jsx": "^1.1.2",
    "@biomejs/biome": "2.2.3",
    "vitest": "^1.6.0",
    "@testing-library/vue": "^8.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^23.0.1",
    "@types/crypto-js": "^4.2.1",
    "@types/echarts": "^5.5.0",
    "@types/node": "^20.10.4"
  }
}
```

### 7.2 版本兼容性分析

✅ **兼容性良好**：
- Vue 3.4.21 与 Vue Router 4.3.2、Pinia 2.1.7 完全兼容
- Vant 4.9.2 与 Vue 3.4.21 兼容
- ECharts 5.5.0 + Vue-ECharts 6.7.3 完美配合
- WebDAV 4.11.2 与Node.js 20+环境兼容
- crypto-js 4.2.0 提供完整TypeScript支持
- Vitest 1.6.0 + jsdom 23.0.1 提供优秀测试体验

⚠️ **注意事项**：
- Rsbuild 1.x 系列稳定，配置需要style-import插件
- crypto-js 4.2.0 的TypeScript类型需要单独安装
- Vue-ECharts 6.x 版本更新了API，需要检查迁移指南

### 7.3 潜在冲突警告

1. **Rsbuild与Vite插件不兼容**：确保只使用Rsbuild官方插件
2. **Vue版本约束**：Vue 3.x需要Vue Router 4.x和Pinia 2.x
3. **TypeScript版本**：推荐使用5.x版本以获得完整类型支持
4. **测试环境依赖**：jsdom 23.0.1 与 Vitest 1.6.0 需要配合使用
5. **浏览器兼容性**：确保项目目标浏览器支持Vue 3和现代JavaScript特性

---

## 8. 最佳实践建议

### 8.1 项目结构组织

```
src/
├── components/     # Vue组件
├── views/         # 页面组件
├── router/        # 路由配置
├── stores/        # Pinia状态管理
├── api/           # API接口封装
├── utils/         # 工具函数
├── types/         # TypeScript类型定义
└── test/          # 测试文件
```

### 8.2 配置文件最佳实践

1. **Rsbuild配置**：使用plugins数组，分离不同功能插件
2. **TypeScript配置**：启用严格模式，配置路径别名
3. **Vant配置**：启用按需导入减少包体积
4. **测试配置**：使用jsdom环境，支持Vue 3特性
5. **环境变量管理**：使用.env文件管理不同环境配置

### 8.3 性能优化建议

1. **代码分割**：利用Rsbuild自动代码分割
2. **懒加载**：路由组件懒加载
3. **按需导入**：Vant组件按需导入
4. **缓存策略**：配置合理的缓存策略
5. **图片优化**：使用WebP格式，压缩图片

### 8.4 开发规范建议

1. **代码规范**：使用Biome进行格式化和检查
2. **提交规范**：使用commitlint规范提交信息
3. **分支管理**：采用GitFlow分支管理策略
4. **代码审查**：建立PR审查流程

### 8.5 安全性建议

1. **数据加密**：敏感数据使用crypto-js加密存储
2. **API安全**：使用WebDAV的HTTPS协议，配置认证
3. **输入验证**：对所有用户输入进行验证和消毒
4. **权限控制**：实现基于角色的访问控制

---

## 9. 部署注意事项

1. **构建优化**：使用Rsbuild的构建优化功能
2. **环境配置**：区分开发、测试、生产环境
3. **错误处理**：配置sentry等错误监控
4. **性能监控**：集成性能分析工具
5. **CDN配置**：静态资源使用CDN加速
6. **服务端渲染**：考虑使用SSR提升首屏性能

---

## 10. 升级路径规划

### 10.1 短期目标（1-2周）
- 完成基础依赖安装
- 配置开发环境
- 建立项目结构

### 10.2 中期目标（1个月）
- 完成核心功能开发
- 集成测试框架
- 性能优化

### 10.3 长期目标（3个月）
- 移动端适配
- PWA支持
- 微信小程序适配

---

**调研完成时间**: 2025-10-24
**技术栈版本**: 基于2024-2025年最新稳定版本
**兼容性状态**: 良好，可用于生产环境
**推荐度**: ⭐⭐⭐⭐⭐ (强烈推荐此技术栈)