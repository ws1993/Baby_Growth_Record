<template>
  <div class="babies">
    <el-page-header @back="goBack" title="宝宝管理">
      <template #extra>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加宝宝
        </el-button>
      </template>
    </el-page-header>

    <div class="content">
      <!-- 统计概览 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="宝宝总数" :value="babiesStore.babies.length">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="男孩" :value="boyCount">
              <template #prefix>
                <el-icon color="#409eff"><User /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="女孩" :value="girlCount">
              <template #prefix>
                <el-icon color="#f56565"><UserFilled /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="总记录数" :value="totalRecords">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 宝宝列表 -->
      <el-card class="babies-card">
        <template #header>
          <div class="babies-header">
            <h3>宝宝列表</h3>
            <div class="header-actions">
              <el-input
                v-model="searchText"
                placeholder="搜索宝宝..."
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
              <el-select v-model="genderFilter" placeholder="性别筛选" style="width: 100px">
                <el-option label="全部" value="" />
                <el-option label="男孩" value="boy" />
                <el-option label="女孩" value="girl" />
              </el-select>
            </div>
          </div>
        </template>

        <div v-if="filteredBabies.length === 0" class="empty-state">
          <el-empty description="暂无宝宝信息">
            <el-button type="primary" @click="showAddDialog">添加第一个宝宝</el-button>
          </el-empty>
        </div>

        <el-row v-else :gutter="20" class="babies-grid">
          <el-col :span="8" v-for="baby in filteredBabies" :key="baby.id">
            <el-card class="baby-card" shadow="hover">
              <div class="baby-header">
                <div class="baby-avatar">
                  <el-icon size="50" :color="baby.gender === 'boy' ? '#409eff' : '#f56565'">
                    <User v-if="baby.gender === 'boy'" />
                    <UserFilled v-else />
                  </el-icon>
                </div>
                <div class="baby-info">
                  <h3>{{ baby.name }}</h3>
                  <p class="gender-age">
                    {{ baby.gender === 'boy' ? '男孩' : '女孩' }} ·
                    {{ calculateAge(baby.birthDate) }}
                  </p>
                </div>
              </div>

              <el-divider />

              <div class="baby-details">
                <p><strong>出生日期：</strong>{{ formatDate(baby.birthDate) }}</p>
                <p><strong>当前年龄：</strong>{{ calculateAge(baby.birthDate) }}</p>
              </div>

              <el-divider />

              <div class="baby-stats">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <div class="stat-item">
                      <span class="stat-number">{{ getGrowthCount(baby.id) }}</span>
                      <span class="stat-label">成长记录</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="stat-item">
                      <span class="stat-number">{{ getMilestoneCount(baby.id) }}</span>
                      <span class="stat-label">里程碑</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="stat-item">
                      <span class="stat-number">{{ getPhotoCount(baby.id) }}</span>
                      <span class="stat-label">照片</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="baby-actions">
                <el-button type="primary" size="small" @click="viewBaby(baby.id)">
                  查看详情
                </el-button>
                <el-button size="small" @click="editBaby(baby)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteBaby(baby.id)">
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 添加/编辑宝宝对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingBaby ? '编辑宝宝信息' : '添加宝宝'"
      width="500px"
    >
      <el-form
        :model="babyForm"
        :rules="formRules"
        ref="formRef"
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBaby">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, User, UserFilled, Document, Search
} from '@element-plus/icons-vue'
import type { Baby } from '../stores/babies'

const router = useRouter()
const route = useRoute()
const babiesStore = useBabiesStore()

const dialogVisible = ref(false)
const editingBaby = ref<Baby | null>(null)
const formRef = ref()
const searchText = ref('')
const genderFilter = ref('')

const babyForm = ref({
  name: '',
  gender: 'boy' as 'boy' | 'girl',
  birthDate: ''
})

const formRules = {
  name: [{ required: true, message: '请输入宝宝姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }]
}

const boyCount = computed(() => {
  return babiesStore.babies.filter(baby => baby.gender === 'boy').length
})

const girlCount = computed(() => {
  return babiesStore.babies.filter(baby => baby.gender === 'girl').length
})

const totalRecords = computed(() => {
  return babiesStore.babies.reduce((total, baby) => {
    return total + getGrowthCount(baby.id) + getMilestoneCount(baby.id) + getPhotoCount(baby.id)
  }, 0)
})

const filteredBabies = computed(() => {
  let filtered = [...babiesStore.babies]

  // 性别筛选
  if (genderFilter.value) {
    filtered = filtered.filter(baby => baby.gender === genderFilter.value)
  }

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    filtered = filtered.filter(baby =>
      baby.name.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - birth.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30

  if (years > 0) {
    return `${years}岁${months}个月`
  } else if (months > 0) {
    return `${months}个月${days}天`
  } else {
    return `${days}天`
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getGrowthCount = (babyId: string) => {
  return babiesStore.getGrowthRecordsByBabyId(babyId).length
}

const getMilestoneCount = (babyId: string) => {
  return babiesStore.getMilestonesByBabyId(babyId).length
}

const getPhotoCount = (babyId: string) => {
  return babiesStore.getPhotosByBabyId(babyId).length
}

const goBack = () => {
  router.push('/dashboard')
}

const showAddDialog = () => {
  editingBaby.value = null
  babyForm.value = {
    name: '',
    gender: 'boy',
    birthDate: ''
  }
  dialogVisible.value = true
}

const editBaby = (baby: Baby) => {
  editingBaby.value = baby
  babyForm.value = {
    name: baby.name,
    gender: baby.gender,
    birthDate: baby.birthDate
  }
  dialogVisible.value = true
}

const saveBaby = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (editingBaby.value) {
      babiesStore.updateBaby(editingBaby.value.id, babyForm.value)
      ElMessage.success('宝宝信息更新成功')
    } else {
      babiesStore.addBaby(babyForm.value)
      ElMessage.success('宝宝添加成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('保存宝宝信息失败:', error)
  }
}

const viewBaby = (babyId: string) => {
  router.push(`/babies/${babyId}`)
}

const deleteBaby = async (babyId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个宝宝吗？删除后将同时删除相关的所有成长记录、里程碑和照片。',
      '危险操作',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )

    babiesStore.deleteBaby(babyId)
    ElMessage.success('宝宝删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

onMounted(() => {
  babiesStore.loadFromLocalStorage()

  // 检查是否有编辑查询参数
  const editBabyId = route.query.edit as string
  if (editBabyId) {
    const babyToEdit = babiesStore.getBabyById(editBabyId)
    if (babyToEdit) {
      editBaby(babyToEdit)
    }
  }
})
</script>

<style scoped>
.babies {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  margin-top: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.babies-card .babies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.babies-grid {
  margin-top: 20px;
}

.baby-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.baby-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.baby-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
}

.gender-age {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.baby-details p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.baby-stats {
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.baby-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>