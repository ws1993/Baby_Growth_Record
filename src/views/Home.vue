<template>
  <div class="home">
    <div class="header">
      <h1>儿童成长记录</h1>
    </div>

    <div class="content">
      <div v-if="!membersStore.membersCount" class="empty-state">
        <p>还没有添加成员</p>
        <button @click="$router.push('/members')" class="btn-primary">
          添加第一个成员
        </button>
      </div>

      <div v-else class="member-cards">
        <div
          v-for="member in membersStore.members"
          :key="member.id"
          class="member-card"
          @click="goToMemberDetail(member.id)"
        >
          <div class="member-info">
            <h3>{{ member.name }}</h3>
            <p class="member-meta">
              {{ formatAge(calculateAgeInMonths(member.birthDate)) }}
            </p>
          </div>
          <span class="arrow">→</span>
        </div>

        <button
          class="add-member-btn"
          @click="$router.push('/members')"
        >
          + 添加成员
        </button>
      </div>

      <div class="quick-actions">
        <div class="action-grid">
          <div class="action-item" @click="showComingSoon">
            <span class="icon">📊</span>
            <span>成长统计</span>
          </div>
          <div class="action-item" @click="$router.push('/settings')">
            <span class="icon">⚙️</span>
            <span>设置</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMembersStore } from '@/stores';
import { calculateAgeInMonths, formatAge } from '@/utils/date';

const router = useRouter();
const membersStore = useMembersStore();

const goToMemberDetail = (memberId: string) => {
  membersStore.setCurrentMember(memberId);
  // 这里先跳转到成员列表，等后续实现成员详情页面
  router.push(`/members`);
};

const showComingSoon = () => {
  alert('统计功能即将上线');
};

onMounted(async () => {
  await membersStore.init();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f8fa;
}

.header {
  background: #fff;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  color: #323233;
}

.content {
  padding: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: #969799;
  margin-bottom: 20px;
}

.btn-primary {
  background: #1989fa;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1677ff;
}

.member-cards {
  margin-bottom: 24px;
}

.member-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-card:active {
  transform: scale(0.98);
}

.member-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.member-meta {
  margin: 0;
  font-size: 14px;
  color: #969799;
}

.arrow {
  color: #c8c9cc;
  font-size: 16px;
}

.add-member-btn {
  width: 100%;
  background: #fff;
  border: 1px solid #ebedf0;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #646566;
  cursor: pointer;
  margin-top: 8px;
}

.add-member-btn:hover {
  background: #f7f8fa;
}

.quick-actions {
  margin-top: 32px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-item:hover {
  background: #f7f8fa;
}

.action-item:not(:last-child) {
  border-right: 1px solid #ebedf0;
}

.icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-item span:last-child {
  font-size: 14px;
  color: #646566;
}
</style>