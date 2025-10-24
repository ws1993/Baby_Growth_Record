import CryptoJS from 'crypto-js';

const SECRET_KEY = 'baby-growth-record-secret';

/**
 * AES加密
 */
export const encryptData = (data: string, password: string): string => {
  try {
    const key = CryptoJS.SHA256(password + SECRET_KEY).toString();
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('加密失败');
  }
};

/**
 * AES解密
 */
export const decryptData = (encryptedData: string, password: string): string => {
  try {
    const key = CryptoJS.SHA256(password + SECRET_KEY).toString();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('解密失败，密码可能错误');
    }

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('解密失败，密码可能错误');
  }
};

/**
 * 生成随机盐值
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};