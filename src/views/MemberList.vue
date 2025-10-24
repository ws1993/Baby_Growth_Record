<template>
  <div class="member-list">
    <van-nav-bar title="成员管理" left-arrow @click-left="$router.go(-1)">
      <template #right>
        <van-icon name="plus" size="18" @click="showAddDialog" />
      </template>
    </van-nav-bar>

    <div class="content">
      <!-- 成员列表 -->
      <div v-if="membersStore.members.length > 0" class="member-cards">
        <MemberCard
          v-for="member in membersStore.members"
          :key="member.id"
          :member="member"
          @select="selectMember"
          @edit="editMember"
          @delete="deleteMember"
        />
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="暂无成员">
        <van-button type="primary" @click="showAddDialog">添加第一个成员</van-button>
      </van-empty>
    </div>

    <!-- 添加/编辑成员对话框 -->
    <van-dialog
      v-model:show="dialogVisible"
      :title="isEdit ? '编辑成员' : '添加成员'"
      show-cancel-button
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <van-form @submit="onConfirm" class="member-form">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field name="gender" label="性别">
            <template #input>
              <van-radio-group v-model="form.gender" direction="horizontal">
                <van-radio name="male">男</van-radio>
                <van-radio name="female">女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="form.birthDate"
            name="birthDate"
            label="出生日期"
            placeholder="请选择出生日期"
            :rules="[{ required: true, message: '请选择出生日期' }]"
            @click="showDatePicker = true"
            readonly
          />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :max-date="new Date()"
      />
    </van-popup>

    <!-- 删除确认对话框 -->
    <van-dialog
      v-model:show="deleteDialogVisible"
      title="确认删除"
      message="确定要删除该成员吗？删除后将无法恢复。"
      show-cancel-button
      @confirm="confirmDelete"
    />

    <!-- 操作按钮 -->
    <van-floating-bubble
      v-if="membersStore.members.length > 0"
      axis="xy"
      icon="plus"
      @click="showAddDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMembersStore } from '@/stores';
import { Member } from '@/types/member';
import MemberCard from '@/components/MemberCard.vue';

const router = useRouter();
const membersStore = useMembersStore();

// 对话框状态
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const showDatePicker = ref(false);
const isEdit = ref(false);
const currentMemberId = ref<string | null>(null);

// 表单数据
const form = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
});

const selectedDate = ref(new Date());

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
  selectedDate.value = new Date(member.birthDate);
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
      // 显示成功提示
      // 这里可以集成toast提示
    } catch (error) {
      console.error('删除成员失败:', error);
      // 显示错误提示
    }
  }
  deleteDialogVisible.value = false;
  currentMemberId.value = null;
};

// 选择成员
const selectMember = (member: Member) => {
  membersStore.setCurrentMember(member.id);
  router.push(`/member/${member.id}`);
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
    } else {
      // 添加成员
      await membersStore.createMember({
        name: form.name,
        gender: form.gender,
        birthDate: form.birthDate,
      });
    }

    dialogVisible.value = false;
    resetForm();
  } catch (error) {
    console.error('保存成员失败:', error);
    // 显示错误提示
  }
};

// 取消操作
const onCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

// 确认日期选择
const onDateConfirm = () => {
  form.birthDate = selectedDate.value.toISOString().split('T')[0];
  showDatePicker.value = false;
};

// 重置表单
const resetForm = () => {
  form.name = '';
  form.gender = 'male';
  form.birthDate = '';
  selectedDate.value = new Date();
  currentMemberId.value = null;
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

.content {
  padding: 16px;
  min-height: calc(100vh - 46px);
}

.member-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-form {
  padding: 16px 0;
}
</style>