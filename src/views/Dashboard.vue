<template>
  <div class="dashboard">
    <div class="welcome-section">
      <div class="empty-state" v-if="babiesStore.babies.length === 0">
        <el-icon size="80" color="#dcdfe6"><Apple /></el-icon>
        <h2>欢迎使用宝宝成长记录</h2>
        <p>记录宝宝的每一个珍贵瞬间，见证成长的点点滴滴</p>
        <el-button type="primary" size="large" @click="$emit('addBaby')">
          <el-icon><Plus /></el-icon>
          开始记录
        </el-button>
      </div>

      <div class="babies-overview" v-else>
        <h2>我的宝宝们</h2>
        <div class="babies-grid">
          <el-card
            v-for="baby in babiesStore.babies"
            :key="baby.id"
            class="baby-card"
            @click="goToBabyDetail(baby.id)"
          >
            <div class="baby-avatar">
              <el-icon size="60" :color="baby.gender === 'boy' ? '#409eff' : '#f56565'">
                <User v-if="baby.gender === 'boy'" />
                <UserFilled v-else />
              </el-icon>
            </div>
            <h3>{{ baby.name }}</h3>
            <p class="baby-info">
              {{ baby.gender === 'boy' ? '男孩' : '女孩' }} ·
              {{ calculateAge(baby.birthDate) }}
            </p>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-number">{{ getGrowthCount(baby.id) }}</span>
                <span class="stat-label">成长记录</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getMilestoneCount(baby.id) }}</span>
                <span class="stat-label">里程碑</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getPhotoCount(baby.id) }}</span>
                <span class="stat-label">照片</span>
              </div>
            </div>
          </el-card>
        </div>

        <div class="add-baby-card">
          <el-button @click="$emit('addBaby')" class="add-baby-btn">
            <el-icon><Plus /></el-icon>
            添加宝宝
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { Apple, Plus, User, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const babiesStore = useBabiesStore()

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

const getGrowthCount = (babyId: string) => {
  return babiesStore.getGrowthRecordsByBabyId(babyId).length
}

const getMilestoneCount = (babyId: string) => {
  return babiesStore.getMilestonesByBabyId(babyId).length
}

const getPhotoCount = (babyId: string) => {
  return babiesStore.getPhotosByBabyId(babyId).length
}

const goToBabyDetail = (babyId: string) => {
  router.push(`/babies/${babyId}`)
}

// 组件挂载时触发添加宝宝事件
import { onMounted } from 'vue'
const emit = defineEmits(['addBaby'])

onMounted(() => {
  // 如果没有宝宝，触发添加宝宝事件
  if (babiesStore.babies.length === 0) {
    emit('addBaby')
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 40px 20px;
}

.empty-state {
  padding: 60px 20px;
}

.empty-state h2 {
  margin: 20px 0 10px;
  color: #303133;
}

.empty-state p {
  color: #909399;
  margin-bottom: 30px;
}

.babies-overview h2 {
  margin-bottom: 30px;
  color: #303133;
}

.babies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.baby-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
  padding: 20px;
}

.baby-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.baby-avatar {
  margin-bottom: 15px;
}

.baby-card h3 {
  margin: 10px 0;
  color: #303133;
  font-size: 20px;
}

.baby-info {
  color: #909399;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.add-baby-card {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background: #fafafa;
}

.add-baby-btn {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 40px;
}

.add-baby-btn:hover {
  color: #409eff;
  background: #f0f9ff;
}
</style>