<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <router-link to="/dashboard" class="logo">
          <el-icon size="28"><Apple /></el-icon>
          <span>宝宝成长记录</span>
        </router-link>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="addBaby" v-if="babiesStore.babies.length === 0">
          <el-icon><Plus /></el-icon>
          添加宝宝
        </el-button>
        <el-dropdown v-else>
          <el-button type="primary">
            {{ currentBaby?.name || '选择宝宝' }}
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="baby in babiesStore.babies"
                :key="baby.id"
                @click="selectBaby(baby.id)"
              >
                {{ baby.name }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="addBaby">
                <el-icon><Plus /></el-icon>
                添加宝宝
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="sidebar" v-if="currentBaby">
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
        >
          <el-menu-item :index="`/babies/${currentBaby.id}`">
            <el-icon><User /></el-icon>
            <span>宝宝信息</span>
          </el-menu-item>
          <el-menu-item :index="`/growth/${currentBaby.id}`">
            <el-icon><TrendCharts /></el-icon>
            <span>成长记录</span>
          </el-menu-item>
          <el-menu-item :index="`/milestones/${currentBaby.id}`">
            <el-icon><Star /></el-icon>
            <span>里程碑</span>
          </el-menu-item>
          <el-menu-item :index="`/photos/${currentBaby.id}`">
            <el-icon><Picture /></el-icon>
            <span>照片墙</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view @add-baby="addBaby" />
      </el-main>
    </el-container>

    <!-- 添加/编辑宝宝对话框 -->
    <el-dialog
      v-model="babyDialogVisible"
      :title="editingBaby ? '编辑宝宝信息' : '添加宝宝'"
      width="400px"
    >
      <el-form
        :model="babyForm"
        :rules="babyFormRules"
        ref="babyFormRef"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="babyForm.name" placeholder="请输入宝宝姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="babyForm.gender">
            <el-radio value="boy">男孩</el-radio>
            <el-radio value="girl">女孩</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="babyForm.birthDate"
            type="date"
            placeholder="选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="babyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBaby">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBabiesStore } from './stores/babies'
import type { Baby } from './stores/babies'
import {
  Apple, Plus, ArrowDown, User, TrendCharts, Star, Picture
} from '@element-plus/icons-vue'

const router = useRouter()
const babiesStore = useBabiesStore()

const currentBabyId = ref<string>('')
const babyDialogVisible = ref(false)
const editingBaby = ref<Baby | null>(null)
const babyFormRef = ref()

const babyForm = ref({
  name: '',
  gender: 'boy' as 'boy' | 'girl',
  birthDate: ''
})

const babyFormRules = {
  name: [{ required: true, message: '请输入宝宝姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }]
}

const currentBaby = computed(() => {
  if (!currentBabyId.value && babiesStore.babies.length > 0) {
    return babiesStore.babies[0]
  }
  return babiesStore.getBabyById(currentBabyId.value)
})

const selectBaby = (babyId: string) => {
  currentBabyId.value = babyId
  router.push(`/babies/${babyId}`)
}

const addBaby = () => {
  editingBaby.value = null
  babyForm.value = {
    name: '',
    gender: 'boy',
    birthDate: ''
  }
  babyDialogVisible.value = true
}

const saveBaby = async () => {
  if (!babyFormRef.value) return

  try {
    await babyFormRef.value.validate()

    if (editingBaby.value) {
      babiesStore.updateBaby(editingBaby.value.id, babyForm.value)
      ElMessage.success('宝宝信息更新成功')
    } else {
      babiesStore.addBaby(babyForm.value)
      ElMessage.success('宝宝添加成功')
      const newBaby = babiesStore.babies[babiesStore.babies.length - 1]
      selectBaby(newBaby.id)
    }

    babyDialogVisible.value = false
  } catch (error) {
    console.error('保存宝宝信息失败:', error)
  }
}

onMounted(() => {
  babiesStore.loadFromLocalStorage()
  if (babiesStore.babies.length > 0) {
    selectBaby(babiesStore.babies[0].id)
  }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.sidebar {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.main-content {
  background: #f8f9fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
