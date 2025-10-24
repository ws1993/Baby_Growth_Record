/**
 * 记录相关类型定义
 */

// 成长记录接口
export interface Record {
  id: string; // 唯一标识符 (UUID)
  memberId: string; // 关联的成员ID
  date: string; // 记录日期 (YYYY-MM-DD)
  height: number; // 身高 (cm)
  weight: number; // 体重 (kg)
  bmi?: number; // 自动计算的BMI值
  heightChange?: number; // 与上次记录的身高变化 (cm)
  weightChange?: number; // 与上次记录的体重变化 (kg)
  bmiChange?: number; // 与上次记录的BMI变化
  ageMonths?: number; // 记录时的年龄（月）
  createdAt: string; // 创建时间 (ISO string)
  updatedAt: string; // 最后更新时间 (ISO string)
}

// 记录创建接口
export interface CreateRecordRequest {
  memberId: string;
  date: string;
  height: number;
  weight: number;
}

// 记录更新接口
export interface UpdateRecordRequest extends Partial<CreateRecordRequest> {
  id: string;
}

// 记录统计信息
export interface RecordStats {
  totalRecords: number;
  heightTrend: 'increasing' | 'decreasing' | 'stable';
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  averageHeightGain: number; // 平均月身高增长 (cm/month)
  averageWeightGain: number; // 平均月体重增长 (kg/month)
}
