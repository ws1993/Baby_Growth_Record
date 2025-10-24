/**
 * BMI计算工具函数
 */

/**
 * 计算BMI值
 * @param weight 体重，单位千克
 * @param height 身高，单位厘米
 * @returns BMI值，保留1位小数
 * @throws {Error} 当体重或身高小于等于0时抛出错误
 *
 * @example
 * ```typescript
 * const bmi = calculateBMI(70, 175); // 返回 22.9
 * ```
 */
export const calculateBMI = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) {
    throw new Error('体重和身高必须大于0');
  }

  const heightInMeters = height / 100;
  const bmi = weight / heightInMeters ** 2;
  return Number(bmi.toFixed(1));
};

/**
 * 获取BMI状态分类
 * @param bmi BMI值
 * @param age 年龄（月）
 * @param gender 性别
 * @returns BMI分类和健康建议
 */
export const getBMIStatus = (
  bmi: number,
  age: number,
  gender: 'male' | 'female',
): {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
  suggestion: string;
} => {
  // 这里使用成人的BMI标准，儿童的标准会更复杂，需要根据年龄和性别使用不同的百分位标准
  // 在实际项目中，应该使用儿童BMI百分位图表

  if (bmi < 18.5) {
    return {
      category: 'underweight',
      description: '体重偏轻',
      suggestion: '建议增加营养摄入，保持均衡饮食',
    };
  } else if (bmi >= 18.5 && bmi < 24) {
    return {
      category: 'normal',
      description: '体重正常',
      suggestion: '继续保持健康的饮食和运动习惯',
    };
  } else if (bmi >= 24 && bmi < 28) {
    return {
      category: 'overweight',
      description: '体重偏重',
      suggestion: '建议控制饮食，增加运动量',
    };
  } else {
    return {
      category: 'obese',
      description: '肥胖',
      suggestion: '建议咨询医生，制定专业的减重计划',
    };
  }
};

/**
 * 获取BMI分类的显示文本
 * @param category BMI分类
 * @returns 中文显示文本
 */
export const getBMICategoryText = (category: string): string => {
  const textMap: Record<string, string> = {
    underweight: '体重偏轻',
    normal: '体重正常',
    overweight: '体重偏重',
    obese: '肥胖',
  };

  return textMap[category] || '未知';
};

/**
 * 获取BMI分类对应的颜色
 * @param category BMI分类
 * @returns 颜色值
 */
export const getBMICategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    underweight: '#ff6034', // 橙色
    normal: '#07c160', // 绿色
    overweight: '#ff976a', // 浅橙色
    obese: '#ee0a24', // 红色
  };

  return colorMap[category] || '#969799'; // 默认灰色
};
