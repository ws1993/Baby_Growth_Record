<template>
  <div class="member-card">
    <van-card :title="member.name" :thumb="member.avatar || defaultAvatar">
      <template #desc>
        <div class="member-info">
          <span class="gender">{{ member.gender === 'male' ? '男' : '女' }}</span>
          <span class="age">{{ calculateAge(member.birthDate) }}</span>
        </div>
      </template>
      <template #footer>
        <van-button size="small" @click="$emit('select', member)">查看详情</van-button>
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
}

.gender {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.age {
  color: #999;
}
</style>