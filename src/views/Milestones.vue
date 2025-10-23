<template>
  <div class="milestones">
    <el-page-header @back="goBack" :title="baby?.name ? `${baby.name}的里程碑` : '里程碑'">
      <template #extra>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加里程碑
        </el-button>
      </template>
    </el-page-header>

    <div v-if="baby" class="content">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="总里程碑" :value="milestones.length">
              <template #prefix>
                <el-icon><Star /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6" v-for="category in categoryStats" :key="category.name">
          <el-card class="stat-card">
            <el-statistic :title="category.name" :value="category.count">
              <template #prefix>
                <el-icon :style="{ color: category.color }">
                  <component :is="category.icon" />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分类筛选 -->
      <el-card class="filter-card">
        <div class="filter-section">
          <span class="filter-label">分类筛选：</span>
          <el-radio-group v-model="selectedCategory" size="small">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-card>

      <!-- 里程碑时间线 -->
      <el-card class="timeline-card">
        <template #header>
          <div class="timeline-header">
            <h3>里程碑时间线</h3>
            <div class="header-actions">
              <el-input
                v-model="searchText"
                placeholder="搜索里程碑..."
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
            </div>
          </div>
        </template>

        <div v-if="filteredMilestones.length === 0" class="empty-state">
          <el-empty description="暂无里程碑记录">
            <el-button type="primary" @click="showAddDialog">添加第一个里程碑</el-button>
          </el-empty>
        </div>

        <el-timeline v-else>
          <el-timeline-item
            v-for="milestone in filteredMilestones"
            :key="milestone.id"
            :timestamp="formatDate(milestone.date)"
            :type="getMilestoneType(milestone.category)"
            size="large"
            placement="top"
          >
            <el-card class="milestone-card">
              <div class="milestone-header">
                <h4>{{ milestone.title }}</h4>
                <div class="milestone-actions">
                  <el-tag :type="getCategoryTagType(milestone.category)" size="small">
                    {{ milestone.category }}
                  </el-tag>
                  <el-button size="small" type="primary" link @click="editMilestone(milestone)">
                    编辑
                  </el-button>
                  <el-button size="small" type="danger" link @click="deleteMilestone(milestone.id)">
                    删除
                  </el-button>
                </div>
              </div>
              <p class="milestone-description">{{ milestone.description }}</p>
              <div class="milestone-photos" v-if="milestone.photos && milestone.photos.length > 0">
                <el-image
                  v-for="(photo, index) in milestone.photos.slice(0, 3)"
                  :key="index"
                  :src="photo"
                  fit="cover"
                  class="milestone-photo"
                  :preview-src-list="milestone.photos"
                />
                <div v-if="milestone.photos.length > 3" class="more-photos">
                  +{{ milestone.photos.length - 3 }}
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 添加/编辑里程碑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingMilestone ? '编辑里程碑' : '添加里程碑'"
      width="600px"
    >
      <el-form
        :model="milestoneForm"
        :rules="formRules"
        ref="formRef"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="milestoneForm.title" placeholder="请输入里程碑标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="milestoneForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="milestoneForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="milestoneForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述这个重要的时刻..."
          />
        </el-form-item>
        <el-form-item label="照片">
          <div class="photo-upload">
            <el-upload
              v-model:file-list="photoFiles"
              :auto-upload="false"
              :on-change="handlePhotoChange"
              :on-remove="handlePhotoRemove"
              list-type="picture-card"
              :limit="9"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              支持上传图片，最多9张
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMilestone">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Star, Search, TrendCharts, ChatDotRound, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const babiesStore = useBabiesStore()

const babyId = computed(() => route.params.id as string)
const baby = computed(() => babiesStore.getBabyById(babyId.value))
const milestones = computed(() => babiesStore.getMilestonesByBabyId(babyId.value))

const dialogVisible = ref(false)
const editingMilestone = ref(false)
const formRef = ref()
const selectedCategory = ref('')
const searchText = ref('')
const photoFiles = ref([])

const categories = ['运动发展', '语言发展', '认知发展', '社交发展', '其他']

const milestoneForm = ref({
  title: '',
  category: '',
  date: '',
  description: '',
  photos: [] as string[]
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

const categoryStats = computed(() => {
  const stats = categories.map(category => {
    const count = milestones.value.filter(m => m.category === category).length
    const icons = {
      '运动发展': TrendCharts,
      '语言发展': ChatDotRound,
      '认知发展': Star,
      '社交发展': UserFilled,
      '其他': Star
    }
    const colors = {
      '运动发展': '#67c23a',
      '语言发展': '#e6a23c',
      '认知发展': '#f56c6c',
      '社交发展': '#409eff',
      '其他': '#909399'
    }
    return {
      name: category,
      count,
      icon: icons[category as keyof typeof icons] || Star,
      color: colors[category as keyof typeof colors] || '#909399'
    }
  })
  return stats.filter(stat => stat.count > 0)
})

const filteredMilestones = computed(() => {
  let filtered = [...milestones.value]

  // 分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(milestone => milestone.category === selectedCategory.value)
  }

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    filtered = filtered.filter(milestone =>
      milestone.title.toLowerCase().includes(searchLower) ||
      milestone.description.toLowerCase().includes(searchLower) ||
      milestone.category.toLowerCase().includes(searchLower)
    )
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getMilestoneType = (category: string) => {
  const types: Record<string, string> = {
    '运动发展': 'success',
    '语言发展': 'warning',
    '认知发展': 'danger',
    '社交发展': 'primary',
    '其他': 'info'
  }
  return types[category] || 'primary'
}

const getCategoryTagType = (category: string) => {
  const types: Record<string, string> = {
    '运动发展': 'success',
    '语言发展': 'warning',
    '认知发展': 'danger',
    '社交发展': 'primary',
    '其他': 'info'
  }
  return types[category] || 'info'
}

const goBack = () => {
  router.push(`/babies/${babyId.value}`)
}

const showAddDialog = () => {
  editingMilestone.value = false
  milestoneForm.value = {
    title: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    photos: []
  }
  photoFiles.value = []
  dialogVisible.value = true
}

const editMilestone = (milestone: any) => {
  editingMilestone.value = true
  milestoneForm.value = { ...milestone }
  photoFiles.value = milestone.photos.map((url: string, index: number) => ({
    uid: index,
    name: `photo-${index}`,
    url
  }))
  dialogVisible.value = true
}

const handlePhotoChange = (file: any) => {
  // 这里可以实现图片上传逻辑
  // 目前使用模拟数据
  const reader = new FileReader()
  reader.onload = (e) => {
    milestoneForm.value.photos.push(e.target?.result as string)
  }
  reader.readAsDataURL(file.raw)
}

const handlePhotoRemove = (file: any) => {
  const index = milestoneForm.value.photos.findIndex(photo => photo === file.url)
  if (index > -1) {
    milestoneForm.value.photos.splice(index, 1)
  }
}

const saveMilestone = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (editingMilestone.value) {
      babiesStore.updateMilestone(milestoneForm.value.id, milestoneForm.value)
      ElMessage.success('里程碑更新成功')
    } else {
      babiesStore.addMilestone({
        babyId: babyId.value,
        ...milestoneForm.value
      })
      ElMessage.success('里程碑添加成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('保存里程碑失败:', error)
  }
}

const deleteMilestone = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个里程碑吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    babiesStore.deleteMilestone(id)
    ElMessage.success('里程碑删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

onMounted(() => {
  babiesStore.loadFromLocalStorage()
  if (!baby.value) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.milestones {
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

.filter-card {
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-label {
  font-weight: 500;
  color: #606266;
}

.timeline-card .timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.milestone-card {
  margin-bottom: 10px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.milestone-header h4 {
  margin: 0;
  color: #303133;
}

.milestone-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.milestone-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.milestone-photos {
  display: flex;
  gap: 10px;
  align-items: center;
}

.milestone-photo {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.more-photos {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
}

.photo-upload {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>