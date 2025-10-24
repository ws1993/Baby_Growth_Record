import { defineStore } from 'pinia';
import { computed, ref, readonly } from 'vue';
import type {
  CreateMemberRequest,
  Member,
  MemberStats,
  UpdateMemberRequest,
} from '@/types/member';

interface MembersState {
  members: Member[];
  currentMemberId: string | null;
  loading: boolean;
  error: string | null;
}

export const useMembersStore = defineStore('members', () => {
  // 状态
  const members = ref<Member[]>([]);
  const currentMemberId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const currentMember = computed(() =>
    members.value.find((member) => member.id === currentMemberId.value),
  );

  const membersCount = computed(() => members.value.length);

  const membersWithStats = computed(() => {
    // 这里会在后续实现中计算统计信息
    return members.value.map((member) => ({
      ...member,
      stats: {} as MemberStats,
    }));
  });

  // 方法
  const loadMembers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      // 从LocalStorage加载数据
      const storedMembers = localStorage.getItem('baby_growth_members');
      if (storedMembers) {
        members.value = JSON.parse(storedMembers);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载成员数据失败';
    } finally {
      loading.value = false;
    }
  };

  const saveMembers = async (): Promise<void> => {
    try {
      localStorage.setItem(
        'baby_growth_members',
        JSON.stringify(members.value),
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存成员数据失败';
      throw err;
    }
  };

  const createMember = async (data: CreateMemberRequest): Promise<Member> => {
    const newMember: Member = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    members.value.push(newMember);
    await saveMembers();

    return newMember;
  };

  const updateMember = async (data: UpdateMemberRequest): Promise<Member> => {
    const index = members.value.findIndex((member) => member.id === data.id);
    if (index === -1) {
      throw new Error('成员不存在');
    }

    members.value[index] = {
      ...members.value[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await saveMembers();
    return members.value[index];
  };

  const deleteMember = async (id: string): Promise<void> => {
    const index = members.value.findIndex((member) => member.id === id);
    if (index === -1) {
      throw new Error('成员不存在');
    }

    members.value.splice(index, 1);
    await saveMembers();

    // 如果删除的是当前成员，清空当前成员ID
    if (currentMemberId.value === id) {
      currentMemberId.value = null;
    }
  };

  const setCurrentMember = (id: string | null): void => {
    currentMemberId.value = id;
    if (id) {
      localStorage.setItem('baby_growth_current_member', id);
    } else {
      localStorage.removeItem('baby_growth_current_member');
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // 初始化
  const init = async (): Promise<void> => {
    await loadMembers();

    // 恢复当前成员
    const storedCurrentMemberId = localStorage.getItem(
      'baby_growth_current_member',
    );
    if (
      storedCurrentMemberId &&
      members.value.some((m) => m.id === storedCurrentMemberId)
    ) {
      currentMemberId.value = storedCurrentMemberId;
    }
  };

  return {
    // 状态
    members: readonly(members),
    currentMemberId: readonly(currentMemberId),
    loading: readonly(loading),
    error: readonly(error),

    // 计算属性
    currentMember,
    membersCount,
    membersWithStats,

    // 方法
    loadMembers,
    createMember,
    updateMember,
    deleteMember,
    setCurrentMember,
    init,
  };
});
