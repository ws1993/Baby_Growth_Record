/**
 * 设置相关类型定义
 */

// WebDAV配置接口
export interface WebDAVConfig {
  url: string; // WebDAV服务器地址
  username: string; // 用户名
  password: string; // 密码
}

// 应用设置接口
export interface AppSettings {
  webdav: WebDAVConfig;
  encryptionPassword: string; // 加密密码（仅本地存储）
  theme: 'light' | 'dark' | 'auto'; // 主题设置
  language: 'zh-CN' | 'en-US'; // 语言设置
  autoSync: boolean; // 是否自动同步
  lastSyncTime?: string; // 最后同步时间
}

// 导出数据接口
export interface ExportData {
  version: string; // 数据版本号
  exportTime: string; // 导出时间
  members: import('./member').Member[]; // 成员数据
  records: import('./record').Record[]; // 记录数据
  settings?: AppSettings; // 设置数据（可选）
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

// 同步状态
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: string;
  syncError?: string;
  pendingChanges: number;
}
