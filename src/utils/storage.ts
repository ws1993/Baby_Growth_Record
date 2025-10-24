/**
 * 本地存储工具函数
 */

// 存储键名常量
export const STORAGE_KEYS = {
  MEMBERS: 'baby_growth_members',
  RECORDS: 'baby_growth_records',
  SETTINGS: 'baby_growth_settings',
  CURRENT_MEMBER: 'baby_growth_current_member',
  LAST_SYNC: 'baby_growth_last_sync',
} as const;

/**
 * 获取存储的数据
 * @param key 存储键
 * @returns 解析后的数据，如果不存在或解析失败返回null
 */
export const getStorageData = <T = any>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`获取存储数据失败 [${key}]:`, error);
    return null;
  }
};

/**
 * 设置存储数据
 * @param key 存储键
 * @param value 要存储的数据
 */
export const setStorageData = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`设置存储数据失败 [${key}]:`, error);
    throw error;
  }
};

/**
 * 删除存储数据
 * @param key 存储键
 */
export const removeStorageData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`删除存储数据失败 [${key}]:`, error);
  }
};

/**
 * 清空所有应用相关的存储数据
 */
export const clearAllStorageData = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorageData(key);
  });
};

/**
 * 获取存储大小（KB）
 * @returns 存储大小
 */
export const getStorageSize = (): number => {
  let totalSize = 0;

  for (const key in localStorage) {
    if (Object.hasOwn(localStorage, key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }

  return Math.round(totalSize / 1024); // 转换为KB
};

/**
 * 检查本地存储是否可用
 * @returns 是否可用
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};
