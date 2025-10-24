<template>
  <div class="member-card">
    <van-card :title="member.name" :thumb="member.avatar || defaultAvatar">
      <template #desc>
        <div class="member-info">
          <span class="gender" :class="member.gender">
            {{ member.gender === 'male' ? '男' : '女' }}
          </span>
          <span class="age">{{ calculateAge(member.birthDate) }}</span>
          <span class="birth-date">{{ formatDate(member.birthDate) }}</span>
        </div>
      </template>
      <template #footer>
        <div class="action-buttons">
          <van-button size="small" type="primary" @click="$emit('select', member)">
            查看详情
          </van-button>
          <van-button size="small" @click="$emit('edit', member)">
            编辑
          </van-button>
          <van-button size="small" type="danger" @click="$emit('delete', member)">
            删除
          </van-button>
        </div>
      </template>
    </van-card>
  </div>
</template>

<script setup lang="ts">
import { Member } from '@/types/member';

interface Props {
  member: Member;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [member: Member];
  edit: [member: Member];
  delete: [member: Member];
}>();

const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg';

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${age}岁`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.member-card {
  margin-bottom: 12px;
}

.member-info {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
  align-items: center;
}

.gender {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.gender.male {
  background: #e6f7ff;
  color: #1890ff;
}

.gender.female {
  background: #fff0f6;
  color: #eb2f96;
}

.age {
  color: #666;
  font-weight: 500;
}

.birth-date {
  color: #999;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>