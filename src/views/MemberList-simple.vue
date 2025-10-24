<template>
  <div class="member-list">
    <header class="page-header">
      <button class="back-btn" @click="$router.go(-1)">← 返回</button>
      <h1>成员管理</h1>
      <button class="add-btn" @click="showAddDialog">+ 添加</button>
    </header>

    <main class="content">
      <!-- 成员列表 -->
      <div v-if="membersStore.members.length > 0" class="member-cards">
        <div
          v-for="member in membersStore.members"
          :key="member.id"
          class="member-card"
        >
          <div class="member-info">
            <div class="member-avatar">
              {{ member.name.charAt(0) }}
            </div>
            <div class="member-details">
              <h3>{{ member.name }}</h3>
              <div class="member-meta">
                <span class="gender" :class="member.gender">
                  {{ member.gender === 'male' ? '男' : '女' }}
                </span>
                <span class="age">{{ calculateAge(member.birthDate) }}</span>
                <span class="birth-date">{{ formatDate(member.birthDate) }}</span>
              </div>
            </div>
          </div>
          <div class="member-actions">
            <button class="btn btn-primary" @click="selectMember(member)">
              查看详情
            </button>
            <button class="btn btn-success" @click="addRecord(member)">
              添加记录
            </button>
            <button class="btn btn-secondary" @click="editMember(member)">
              编辑
            </button>
            <button class="btn btn-danger" @click="deleteMember(member)">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">👶</div>
        <h2>暂无成员</h2>
        <p>点击下方按钮添加您的第一个家庭成员</p>
        <button class="btn btn-primary" @click="showAddDialog">
          添加第一个成员
        </button>
      </div>
    </main>

    <!-- 添加/编辑成员对话框 -->
    <div v-if="dialogVisible" class="dialog-overlay" @click="onCancel">
      <div class="dialog" @click.stop>
        <h2>{{ isEdit ? '编辑成员' : '添加成员' }}</h2>
        <form @submit.prevent="onConfirm" class="member-form">
          <div class="form-group">
            <label>姓名 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入姓名"
              required
            />
          </div>
          <div class="form-group">
            <label>性别 *</label>
            <div class="radio-group">
              <label class="radio">
                <input
                  v-model="form.gender"
                  type="radio"
                  value="male"
                  required
                />
                <span>男</span>
              </label>
              <label class="radio">
                <input
                  v-model="form.gender"
                  type="radio"
                  value="female"
                  required
                />
                <span>女</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>出生日期 *</label>
            <input
              v-model="form.birthDate"
              type="date"
              :max="today"
              required
            />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="onCancel">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="deleteDialogVisible" class="dialog-overlay" @click="cancelDelete">
      <div class="dialog" @click.stop>
        <h2>确认删除</h2>
        <p>确定要删除该成员吗？删除后将无法恢复。</p>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelDelete">
            取消
          </button>
          <button class="btn btn-danger" @click="confirmDelete">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 浮动添加按钮 -->
    <button
      v-if="membersStore.members.length > 0"
      class="floating-btn"
      @click="showAddDialog"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMembersStore } from '@/stores';
import { Member } from '@/types/member';

const router = useRouter();
const membersStore = useMembersStore();

// 对话框状态
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const isEdit = ref(false);
const currentMemberId = ref<string | null>(null);

// 表单数据
const form = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
});

const today = computed(() => new Date().toISOString().split('T')[0]);

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑成员
const editMember = (member: Member) => {
  isEdit.value = true;
  currentMemberId.value = member.id;
  form.name = member.name;
  form.gender = member.gender;
  form.birthDate = member.birthDate;
  dialogVisible.value = true;
};

// 删除成员
const deleteMember = (member: Member) => {
  currentMemberId.value = member.id;
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (currentMemberId.value) {
    try {
      await membersStore.deleteMember(currentMemberId.value);
      alert('成员删除成功！');
    } catch (error) {
      console.error('删除成员失败:', error);
      alert('删除成员失败，请重试。');
    }
  }
  deleteDialogVisible.value = false;
  currentMemberId.value = null;
};

// 取消删除
const cancelDelete = () => {
  deleteDialogVisible.value = false;
  currentMemberId.value = null;
};

// 选择成员
const selectMember = (member: Member) => {
  membersStore.setCurrentMember(member.id);
  router.push(`/member/${member.id}`);
};

// 添加记录
const addRecord = (member: Member) => {
  membersStore.setCurrentMember(member.id);
  router.push(`/add-record/${member.id}`);
};

// 确认表单提交
const onConfirm = async () => {
  try {
    if (isEdit.value && currentMemberId.value) {
      // 更新成员
      await membersStore.updateMember({
        id: currentMemberId.value,
        name: form.name,
        gender: form.gender,
        birthDate: form.birthDate,
      });
      alert('成员信息更新成功！');
    } else {
      // 添加成员
      await membersStore.createMember({
        name: form.name,
        gender: form.gender,
        birthDate: form.birthDate,
      });
      alert('成员添加成功！');
    }

    dialogVisible.value = false;
    resetForm();
  } catch (error) {
    console.error('保存成员失败:', error);
    alert('保存失败，请重试。');
  }
};

// 取消操作
const onCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  form.name = '';
  form.gender = 'male';
  form.birthDate = '';
  currentMemberId.value = null;
};

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

// 初始化
onMounted(async () => {
  await membersStore.loadMembers();
});
</script>

<style scoped>
.member-list {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn,
.add-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
}

.back-btn {
  color: #666;
}

.add-btn {
  color: #1989fa;
  font-weight: 600;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.content {
  padding: 16px;
}

.member-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-info {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.member-details h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.member-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
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

.member-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #1989fa;
  color: white;
}

.btn-primary:hover {
  background: #1677ff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #ff7875;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.btn-success:hover {
  background: #73d13d;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #666;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.member-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="date"] {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #1989fa;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.floating-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s;
}

.floating-btn:hover {
  background: #1677ff;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }

  .content {
    padding: 12px;
  }

  .member-actions {
    gap: 6px;
  }

  .btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>