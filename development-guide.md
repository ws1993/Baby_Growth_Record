# 儿童成长记录应用 - 开发指导文档

> **项目目标：** 从零开始创建一个功能完整的"儿童成长记录"小工具，支持多成员管理、身高体重记录、数据可视化分析，并具备强大的数据安全功能。

## 🎯 核心需求概览

### 必须实现的功能清单
- [ ] **多成员管理**：添加/编辑/删除成员信息（姓名、性别、出生日期）
- [ ] **成长记录**：身高体重数据录入、编辑、删除、查看
- [ ] **数据可视化**：身高/体重/BMI趋势图表、变化量计算
- [ ] **数据安全**：本地存储、导入导出、WebDAV加密同步
- [ ] **测试覆盖**：单元测试、组件测试、边界条件测试

## 🏗️ 项目架构设计

### 技术栈配置
```json
{
  "构建工具": "Rsbuild",
  "框架": "Vue 3 (Composition API)",
  "UI库": "Vant 4",
  "路由": "Vue Router 4",
  "状态管理": "Pinia",
  "图表库": "ECharts for Vue",
  "WebDAV客户端": "webdav",
  "加密库": "crypto-js",
  "测试框架": "Vitest + Vue Testing Library"
}
```

### 文件结构规划
```
src/
├── main.ts                    # 应用入口
├── App.vue                    # 根组件
├── router/                    # 路由配置
│   ├── index.ts
│   └── routes.ts
├── stores/                    # Pinia状态管理
│   ├── members.ts            # 成员管理状态
│   ├── records.ts            # 记录管理状态
│   ├── settings.ts           # 设置状态
│   └── index.ts
├── views/                     # 页面组件
│   ├── Home.vue              # 首页
│   ├── MemberList.vue        # 成员列表页
│   ├── MemberDetail.vue      # 成员详情页（含图表）
│   ├── AddRecord.vue         # 添加记录页
│   └── Settings.vue          # 设置页
├── components/                # 可复用组件
│   ├── MemberCard.vue        # 成员卡片
│   ├── RecordList.vue        # 记录列表
│   ├── RecordForm.vue        # 记录表单
│   ├── GrowthChart.vue       # 成长图表
│   ├── StatCard.vue          # 统计卡片
│   └── ConfirmDialog.vue     # 确认对话框
├── utils/                     # 工具函数
│   ├── bmi.ts               # BMI计算
│   ├── storage.ts           # 本地存储
│   ├── crypto.ts            # 加密解密
│   ├── webdav.ts            # WebDAV同步
│   ├── export.ts            # 数据导入导出
│   └── date.ts              # 日期处理
├── types/                     # TypeScript类型定义
│   ├── member.ts
│   ├── record.ts
│   └── settings.ts
└── assets/                    # 静态资源
    └── styles/              # 样式文件
        ├── main.css
        └── variables.css
```

## 📊 核心数据结构

### Member（成员）接口
```typescript
interface Member {
  id: string;          // 唯一标识
  name: string;        // 姓名
  gender: 'male' | 'female';  // 性别
  birthDate: string;   // 出生日期 (YYYY-MM-DD)
  avatar?: string;     // 头像（可选）
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}
```

### Record（记录）接口
```typescript
interface Record {
  id: string;          // 唯一标识
  memberId: string;    // 关联的成员ID
  date: string;        // 记录日期 (YYYY-MM-DD)
  height: number;      // 身高 (cm)
  weight: number;      // 体重 (kg)
  bmi?: number;        // 自动计算的BMI值
  heightChange?: number;  // 与上次记录的身高变化
  weightChange?: number;  // 与上次记录的体重变化
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}
```

### Settings（设置）接口
```typescript
interface Settings {
  webdav: {
    url: string;       // WebDAV服务器地址
    username: string;  // 用户名
    password: string;  // 密码
  };
  encryptionPassword: string;  // 加密密码（仅本地存储）
}
```

## 🚀 分阶段实施计划

### 阶段一：项目基础搭建 (1-2天)
**目标：** 建立完整的开发环境和基础架构

**任务清单：**
- [ ] 安装所有必需依赖包
- [ ] 配置Rsbuild支持Vant UI
- [ ] 创建完整文件夹结构
- [ ] 配置Vue Router
- [ ] 配置Pinia状态管理
- [ ] 定义TypeScript接口
- [ ] 集成Vant UI组件库

**验收标准：**
- 项目能够正常启动和运行
- 路由系统工作正常
- 状态管理配置完成
- 所有依赖正确安装和配置

### 阶段二：核心功能开发 (3-4天)
**目标：** 实现成员管理和数据记录功能

**任务清单：**
- [ ] 实现成员列表页面（增删改查）
- [ ] 实现成员切换功能
- [ ] 实现成长记录录入表单
- [ ] 实现记录列表展示（按时间倒序）
- [ ] 实现记录编辑和删除功能
- [ ] 实现BMI自动计算
- [ ] 实现数据持久化（LocalStorage）
- [ ] 实现数据响应式更新

**验收标准：**
- 可以添加、编辑、删除成员
- 可以添加、编辑、删除成长记录
- 数据变更能够实时反映在UI上
- 刷新页面后数据不丢失

### 阶段三：数据可视化 (2-3天)
**目标：** 实现数据分析和图表展示

**任务清单：**
- [ ] 集成ECharts图表库
- [ ] 实现身高趋势折线图
- [ ] 实现体重趋势折线图
- [ ] 实现BMI趋势展示
- [ ] 实现变化量计算功能
- [ ] 实现统计卡片组件
- [ ] 实现响应式图表适配

**验收标准：**
- 图表能够正确展示数据趋势
- 变化量计算准确
- 移动端显示效果良好
- 数据更新时图表自动刷新

### 阶段四：数据安全功能 (3-4天)
**目标：** 实现数据导入导出和WebDAV同步

**任务清单：**
- [ ] 实现数据导出为JSON文件
- [ ] 实现JSON文件导入和验证
- [ ] 实现AES加密解密功能
- [ ] 实现WebDAV客户端配置
- [ ] 实现云端数据上传
- [ ] 实现云端数据下载和恢复
- [ ] 实现同步状态管理
- [ ] 实现设置页面

**验收标准：**
- 可以成功导出和导入数据
- 加密解密功能正常工作
- WebDAV同步功能稳定可靠
- 设置页面配置正确保存

### 阶段五：测试与优化 (2-3天)
**目标：** 完善测试覆盖和用户体验优化

**任务清单：**
- [ ] 编写BMI计算单元测试
- [ ] 编写加密解密单元测试
- [ ] 编写关键组件测试
- [ ] 实现表单验证和错误处理
- [ ] 实现加载状态和反馈提示
- [ ] 实现操作确认对话框
- [ ] 配置Vercel部署
- [ ] 性能优化和代码审查

**验收标准：**
- 测试覆盖率达到80%以上
- 用户体验流畅，错误处理完善
- 应用可以成功部署到Vercel

## 🔧 关键技术实现要点

### 1. BMI计算公式
```typescript
// BMI = 体重(kg) / 身高(m)^2
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / Math.pow(heightInMeters, 2)).toFixed(1));
};
```

### 2. 变化量计算逻辑
```typescript
// 计算与上次记录的变化量
const calculateChanges = (currentRecord: Record, previousRecord?: Record) => {
  if (!previousRecord) return { heightChange: null, weightChange: null };

  return {
    heightChange: Number((currentRecord.height - previousRecord.height).toFixed(1)),
    weightChange: Number((currentRecord.weight - previousRecord.weight).toFixed(1))
  };
};
```

### 3. AES加密实现
```typescript
import CryptoJS from 'crypto-js';

const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

const decryptData = (encryptedData: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 4. WebDAV同步流程
```typescript
const syncToWebDAV = async (data: any, settings: Settings) => {
  // 1. 将数据序列化为JSON字符串
  const jsonData = JSON.stringify(data);

  // 2. 使用AES加密
  const encryptedData = encryptData(jsonData, settings.encryptionPassword);

  // 3. 上传到WebDAV服务器
  const client = createWebDAVClient(settings.webdav);
  await client.putFileContents('/growth-data.json', encryptedData);
};
```

## 📋 开发规范

### 1. 代码风格
- 使用Vue 3 Composition API
- 使用TypeScript严格模式
- 遵循Vue官方风格指南
- 使用Biome进行代码格式化

### 2. 组件设计原则
- 单一职责原则
- 高内聚、低耦合
- 可复用性优先
- Props和Emits明确定义

### 3. 状态管理规范
- 使用Pinia进行状态管理
- 按功能模块拆分Store
- 异步操作使用Actions
- 状态变更使用Getters

### 4. 错误处理策略
- 用户友好的错误提示
- 详细的错误日志记录
- 优雅的降级处理
- 数据验证和边界检查

## ⚠️ 风险控制要点

### 1. 数据安全
- 加密密码绝不上传到服务器
- WebDAV凭据安全存储
- 敏感数据传输加密
- 本地数据验证机制

### 2. 兼容性保障
- 移动端优先设计
- 不同屏幕尺寸适配
- 浏览器兼容性测试
- 优雅的错误处理

### 3. 性能优化
- 图表渲染性能优化
- 大数据量处理优化
- 内存泄漏预防
- 加载状态管理

## 🎯 质量保证清单

### 功能测试
- [ ] 所有增删改查功能正常
- [ ] 数据计算准确无误
- [ ] 图表显示正确
- [ ] 同步功能稳定

### 用户体验
- [ ] 操作流程顺畅
- [ ] 错误提示友好
- [ ] 加载状态明确
- [ ] 响应式设计完善

### 代码质量
- [ ] TypeScript类型覆盖完整
- [ ] 组件复用性良好
- [ ] 代码注释充分
- [ ] 测试覆盖率达标

---

**重要提醒：** 本文档严格按照需求文档制定，所有功能都必须完整实现，不可简化或阉割。如有技术难点，及时调整实施方案但保证功能完整性。