/**
 * 成员相关类型定义
 */

// 性别枚举
export type Gender = 'male' | 'female';

// 成员接口
export interface Member {
  id: string; // 唯一标识符 (UUID)
  name: string; // 姓名
  gender: Gender; // 性别
  birthDate: string; // 出生日期 (YYYY-MM-DD)
  avatar?: string; // 头像URL（可选）
  createdAt: string; // 创建时间 (ISO string)
  updatedAt: string; // 最后更新时间 (ISO string)
}

// 成员创建接口
export interface CreateMemberRequest {
  name: string;
  gender: Gender;
  birthDate: string;
  avatar?: string;
}

// 成员更新接口
export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  id: string;
}

// 成员统计信息
export interface MemberStats {
  id: string;
  name: string;
  recordCount: number; // 记录总数
  firstRecordDate?: string; // 首次记录日期
  lastRecordDate?: string; // 最近记录日期
  heightRange?: {
    // 身高范围
    min: number;
    max: number;
  };
  weightRange?: {
    // 体重范围
    min: number;
    max: number;
  };
}
