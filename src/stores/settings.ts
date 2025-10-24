import { defineStore } from 'pinia';
import { computed, ref, readonly } from 'vue';
import type { AppSettings, SyncStatus } from '@/types/settings';

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
}

const defaultSettings: AppSettings = {
  webdav: {
    url: '',
    username: '',
    password: '',
  },
  encryptionPassword: '',
  theme: 'auto',
  language: 'zh-CN',
  autoSync: false,
};

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const settings = ref<AppSettings>({ ...defaultSettings });
  const loading = ref(false);
  const syncStatus = ref<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    pendingChanges: 0,
  });
  const error = ref<string | null>(null);

  // 计算属性
  const isWebDAVConfigured = computed(
    () =>
      settings.value.webdav.url &&
      settings.value.webdav.username &&
      settings.value.webdav.password,
  );

  const canSync = computed(
    () =>
      isWebDAVConfigured.value &&
      settings.value.encryptionPassword &&
      syncStatus.value.isOnline,
  );

  // 方法
  const loadSettings = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const storedSettings = localStorage.getItem('baby_growth_settings');
      if (storedSettings) {
        settings.value = { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载设置失败';
    } finally {
      loading.value = false;
    }
  };

  const saveSettings = async (): Promise<void> => {
    try {
      localStorage.setItem(
        'baby_growth_settings',
        JSON.stringify(settings.value),
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存设置失败';
      throw err;
    }
  };

  const updateSettings = async (
    newSettings: Partial<AppSettings>,
  ): Promise<void> => {
    settings.value = { ...settings.value, ...newSettings };
    await saveSettings();
  };

  const updateWebDAVConfig = async (
    config: Partial<AppSettings['webdav']>,
  ): Promise<void> => {
    settings.value.webdav = { ...settings.value.webdav, ...config };
    await saveSettings();
  };

  const setEncryptionPassword = async (password: string): Promise<void> => {
    settings.value.encryptionPassword = password;
    await saveSettings();
  };

  const testWebDAVConnection = async (): Promise<boolean> => {
    if (!isWebDAVConfigured.value) {
      return false;
    }

    try {
      // 这里会在后续实现WebDAV功能时添加具体的测试逻辑
      // 目前返回true作为占位符
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'WebDAV连接测试失败';
      return false;
    }
  };

  const syncToWebDAV = async (): Promise<void> => {
    if (!canSync.value) {
      throw new Error('无法同步：WebDAV未配置或网络不可用');
    }

    syncStatus.value.isSyncing = true;
    error.value = null;

    try {
      // 这里会在后续实现WebDAV功能时添加具体的同步逻辑
      await new Promise((resolve) => setTimeout(resolve, 2000));

      syncStatus.value.lastSyncTime = new Date().toISOString();
      syncStatus.value.pendingChanges = 0;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '同步失败';
      throw err;
    } finally {
      syncStatus.value.isSyncing = false;
    }
  };

  const syncFromWebDAV = async (): Promise<void> => {
    if (!canSync.value) {
      throw new Error('无法同步：WebDAV未配置或网络不可用');
    }

    syncStatus.value.isSyncing = true;
    error.value = null;

    try {
      // 这里会在后续实现WebDAV功能时添加具体的同步逻辑
      await new Promise((resolve) => setTimeout(resolve, 2000));

      syncStatus.value.lastSyncTime = new Date().toISOString();
    } catch (err) {
      error.value = err instanceof Error ? err.message : '同步失败';
      throw err;
    } finally {
      syncStatus.value.isSyncing = false;
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      // 这里会在后续实现数据导出功能
      const data = {
        version: '1.0.0',
        exportTime: new Date().toISOString(),
        members: [],
        records: [],
        settings: settings.value,
      };

      return JSON.stringify(data, null, 2);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导出数据失败';
      throw err;
    }
  };

  const importData = async (jsonData: string): Promise<void> => {
    try {
      const data = JSON.parse(jsonData);

      // 这里会在后续实现数据导入功能时添加具体的验证和导入逻辑

      // 更新设置
      if (data.settings) {
        await updateSettings(data.settings);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导入数据失败';
      throw err;
    }
  };

  // 初始化
  const init = async (): Promise<void> => {
    await loadSettings();
  };

  return {
    // 状态
    settings: readonly(settings),
    loading: readonly(loading),
    syncStatus: readonly(syncStatus),
    error: readonly(error),

    // 计算属性
    isWebDAVConfigured,
    canSync,

    // 方法
    loadSettings,
    saveSettings,
    updateSettings,
    updateWebDAVConfig,
    setEncryptionPassword,
    testWebDAVConnection,
    syncToWebDAV,
    syncFromWebDAV,
    exportData,
    importData,
    init,
  };
});
