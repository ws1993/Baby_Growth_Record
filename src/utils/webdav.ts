import { createClient, WebDAVClient } from 'webdav';
import { Settings } from '@/types/settings';

/**
 * 创建WebDAV客户端
 */
export const createWebDAVClient = (webdavConfig: Settings['webdav']): WebDAVClient => {
  if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
    throw new Error('WebDAV配置不完整');
  }

  return createClient(webdavConfig.url, {
    username: webdavConfig.username,
    password: webdavConfig.password,
  });
};

/**
 * 测试WebDAV连接
 */
export const testWebDAVConnection = async (webdavConfig: Settings['webdav']): Promise<boolean> => {
  try {
    const client = createWebDAVClient(webdavConfig);
    await client.getDirectoryContents('/');
    return true;
  } catch (error) {
    console.error('WebDAV connection test failed:', error);
    return false;
  }
};

/**
 * 上传数据到WebDAV
 */
export const uploadToWebDAV = async (
  data: any,
  webdavConfig: Settings['webdav'],
  filename: string = 'growth-data.json'
): Promise<void> => {
  try {
    const client = createWebDAVClient(webdavConfig);
    const jsonData = JSON.stringify(data);

    await client.putFileContents(filename, jsonData);
  } catch (error) {
    console.error('WebDAV upload failed:', error);
    throw new Error('上传到WebDAV失败');
  }
};

/**
 * 从WebDAV下载数据
 */
export const downloadFromWebDAV = async (
  webdavConfig: Settings['webdav'],
  filename: string = 'growth-data.json'
): Promise<any> => {
  try {
    const client = createWebDAVClient(webdavConfig);

    try {
      const content = await client.getFileContents(filename);
      return JSON.parse(content as string);
    } catch (error) {
      // 如果文件不存在，返回null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  } catch (error) {
    console.error('WebDAV download failed:', error);
    throw new Error('从WebDAV下载失败');
  }
};

/**
 * 检查WebDAV文件是否存在
 */
export const checkWebDAVFileExists = async (
  webdavConfig: Settings['webdav'],
  filename: string = 'growth-data.json'
): Promise<boolean> => {
  try {
    const client = createWebDAVClient(webdavConfig);
    await client.stat(filename);
    return true;
  } catch (error) {
    return false;
  }
};