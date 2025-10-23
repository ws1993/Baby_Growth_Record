<template>
  <div class="baby-detail">
    <el-page-header @back="goBack" :title="baby?.name || '宝宝详情'">
      <template #extra>
        <el-button type="primary" @click="editBaby">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
      </template>
    </el-page-header>

    <div v-if="baby" class="baby-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="baby-info-card">
            <div class="baby-avatar-section">
              <div class="avatar">
                <el-icon size="120" :color="baby.gender === 'boy' ? '#409eff' : '#f56565'">
                  <User v-if="baby.gender === 'boy'" />
                  <UserFilled v-else />
                </el-icon>
              </div>
              <h2>{{ baby.name }}</h2>
              <p class="gender-age">
                {{ baby.gender === 'boy' ? '男孩' : '女孩' }} ·
                {{ calculateAge(baby.birthDate) }}
              </p>
              <div class="birth-info">
                <p><strong>出生日期：</strong>{{ formatDate(baby.birthDate) }}</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">{{ baby.name }}</el-descriptions-item>
                <el-descriptions-item label="性别">
                  {{ baby.gender === 'boy' ? '男孩' : '女孩' }}
                </el-descriptions-item>
                <el-descriptions-item label="出生日期">{{ formatDate(baby.birthDate) }}</el-descriptions-item>
                <el-descriptions-item label="当前年龄">{{ calculateAge(baby.birthDate) }}</el-descriptions-item>
                <el-descriptions-item label="记录时间">{{ formatDate(baby.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="宝宝ID">{{ baby.id }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>

            <el-tab-pane label="成长统计" name="growth-stats">
              <div class="stats-overview">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-statistic title="成长记录" :value="growthRecords.length">
                      <template #prefix>
                        <el-icon><TrendCharts /></el-icon>
                      </template>
                    </el-statistic>
                  </el-col>
                  <el-col :span="8">
                    <el-statistic title="里程碑" :value="milestones.length">
                      <template #prefix>
                        <el-icon><Star /></el-icon>
                      </template>
                    </el-statistic>
                  </el-col>
                  <el-col :span="8">
                    <el-statistic title="照片" :value="photos.length">
                      <template #prefix>
                        <el-icon><Picture /></el-icon>
                      </template>
                    </el-statistic>
                  </el-col>
                </el-row>
              </div>

              <div class="recent-records" v-if="growthRecords.length > 0">
                <h3>最近的成长记录</h3>
                <el-timeline>
                  <el-timeline-item
                    v-for="record in growthRecords.slice(0, 5)"
                    :key="record.id"
                    :timestamp="formatDate(record.date)"
                    type="primary"
                  >
                    <div class="record-item">
                      <div class="record-data">
                        <span v-if="record.height">身高: {{ record.height }}cm</span>
                        <span v-if="record.weight">体重: {{ record.weight }}kg</span>
                        <span v-if="record.headCircumference">头围: {{ record.headCircumference }}cm</span>
                      </div>
                      <div class="record-notes" v-if="record.notes">
                        {{ record.notes }}
                      </div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <el-tab-pane label="里程碑时间线" name="milestone-timeline" v-if="milestones.length > 0">
              <el-timeline>
                <el-timeline-item
                  v-for="milestone in milestones"
                  :key="milestone.id"
                  :timestamp="formatDate(milestone.date)"
                  :type="getMilestoneType(milestone.category)"
                  size="large"
                >
                  <el-card>
                    <h4>{{ milestone.title }}</h4>
                    <p class="milestone-category">{{ milestone.category }}</p>
                    <p>{{ milestone.description }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div v-else class="loading">
      <el-loading-text>Loading...</el-loading-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { Edit, User, UserFilled, TrendCharts, Star, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const babiesStore = useBabiesStore()

const activeTab = ref('basic')

const babyId = computed(() => route.params.id as string)

const baby = computed(() => babiesStore.getBabyById(babyId.value))
const growthRecords = computed(() => babiesStore.getGrowthRecordsByBabyId(babyId.value))
const milestones = computed(() => babiesStore.getMilestonesByBabyId(babyId.value))
const photos = computed(() => babiesStore.getPhotosByBabyId(babyId.value))

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

const getMilestoneType = (category: string) => {
  const types: Record<string, string> = {
    '运动发展': 'success',
    '语言发展': 'warning',
    '认知发展': 'info',
    '社交发展': 'danger',
    '其他': 'primary'
  }
  return types[category] || 'primary'
}

const goBack = () => {
  router.push('/dashboard')
}

const editBaby = () => {
  if (baby.value) {
    // 跳转到宝宝管理页面，并通过query参数指定要编辑的宝宝
    router.push({
      path: '/babies',
      query: { edit: baby.value.id }
    })
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
.baby-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.baby-content {
  margin-top: 20px;
}

.baby-info-card {
  text-align: center;
}

.baby-avatar-section {
  padding: 20px;
}

.avatar {
  margin-bottom: 20px;
}

.baby-avatar-section h2 {
  margin: 15px 0;
  color: #303133;
}

.gender-age {
  color: #909399;
  margin-bottom: 20px;
}

.birth-info {
  text-align: left;
  color: #606266;
}

.detail-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.stats-overview {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.recent-records h3 {
  margin-bottom: 20px;
  color: #303133;
}

.record-item {
  margin-bottom: 10px;
}

.record-data {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  font-weight: 500;
}

.record-data span {
  padding: 4px 8px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
}

.record-notes {
  color: #606266;
  font-style: italic;
}

.milestone-category {
  color: #909399;
  font-size: 14px;
  margin: 8px 0;
}

.loading {
  text-align: center;
  padding: 100px 0;
}
</style>