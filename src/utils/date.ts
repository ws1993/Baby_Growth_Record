/**
 * 日期处理工具函数
 */

/**
 * 计算年龄（月）
 * @param birthDate 出生日期
 * @param targetDate 目标日期（默认为今天）
 * @returns 年龄（月）
 */
export const calculateAgeInMonths = (
  birthDate: string,
  targetDate: string = new Date().toISOString().split('T')[0],
): number => {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);

  let months = (target.getFullYear() - birth.getFullYear()) * 12;
  months += target.getMonth() - birth.getMonth();

  if (target.getDate() < birth.getDate()) {
    months--;
  }

  return Math.max(0, months);
};

/**
 * 格式化年龄显示
 * @param months 年龄（月）
 * @returns 格式化的年龄字符串
 */
export const formatAge = (months: number): string => {
  if (months < 12) {
    return `${months}个月`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years}岁`;
  }

  return `${years}岁${remainingMonths}个月`;
};

/**
 * 格式化日期显示
 * @param date 日期字符串
 * @param format 格式类型
 * @returns 格式化的日期字符串
 */
export const formatDate = (
  date: string,
  format: 'short' | 'long' | 'cn' = 'short',
): string => {
  const d = new Date(date);

  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'cn':
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    default:
      return d.toLocaleDateString();
  }
};

/**
 * 获取今天的日期字符串
 * @returns YYYY-MM-DD格式的日期字符串
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 验证日期格式
 * @param date 日期字符串
 * @returns 是否为有效的YYYY-MM-DD格式
 */
export const isValidDate = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};
