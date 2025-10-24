import { Member } from '@/types/member';
import { Record } from '@/types/record';
import { Settings } from '@/types/settings';
import { encryptData } from './crypto';

/**
 * 数据导出接口
 */
interface ExportData {
  members: Member[];
  records: Record[];
  settings: Settings;
  exportTime: string;
  version: string;
}

/**
 * 导出数据为JSON文件
 */
export const exportData = async (
  members: Member[],
  records: Record[],
  settings: Settings,
  encryptionPassword?: string
): Promise<void> => {
  try {
    const exportData: ExportData = {
      members,
      records,
      settings: {
        ...settings,
        // 不导出敏感信息
        encryptionPassword: '',
        webdav: {
          ...settings.webdav,
          password: settings.webdav.password ? '***' : '',
        },
      },
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    };

    let dataStr = JSON.stringify(exportData, null, 2);

    // 如果提供了加密密码，则加密数据
    if (encryptionPassword) {
      dataStr = encryptData(dataStr, encryptionPassword);
    }

    // 创建并下载文件
    const blob = new Blob([dataStr], {
      type: encryptionPassword ? 'text/plain' : 'application/json'
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `growth-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('导出数据失败');
  }
};

/**
 * 导入数据从JSON文件
 */
export const importData = async (
  file: File,
  encryptionPassword?: string
): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let dataStr = e.target?.result as string;

        // 如果提供了加密密码，则解密数据
        if (encryptionPassword) {
          const { decryptData } = require('./crypto');
          dataStr = decryptData(dataStr, encryptionPassword);
        }

        const data: ExportData = JSON.parse(dataStr);

        // 验证数据格式
        if (!data.members || !data.records || !data.version) {
          throw new Error('数据格式不正确');
        }

        // 恢复设置中的敏感信息（保持原有设置）
        data.settings = {
          ...data.settings,
          encryptionPassword: '', // 不导入加密密码
        };

        resolve(data);
      } catch (error) {
        console.error('Import failed:', error);
        if (encryptionPassword) {
          reject(new Error('导入数据失败，可能是密码错误'));
        } else {
          reject(new Error('导入数据失败，文件格式不正确'));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsText(file);
  });
};

/**
 * 验证导入数据
 */
export const validateImportData = (data: ExportData): string[] => {
  const errors: string[] = [];

  // 验证版本兼容性
  if (!data.version) {
    errors.push('缺少版本信息');
  }

  // 验证成员数据
  if (!Array.isArray(data.members)) {
    errors.push('成员数据格式错误');
  } else {
    data.members.forEach((member, index) => {
      if (!member.id || !member.name || !member.birthDate) {
        errors.push(`成员数据不完整 (索引: ${index})`);
      }
    });
  }

  // 验证记录数据
  if (!Array.isArray(data.records)) {
    errors.push('记录数据格式错误');
  } else {
    data.records.forEach((record, index) => {
      if (!record.id || !record.memberId || !record.date) {
        errors.push(`记录数据不完整 (索引: ${index})`);
      }
    });
  }

  return errors;
};