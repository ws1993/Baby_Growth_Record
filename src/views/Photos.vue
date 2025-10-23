<template>
  <div class="photos">
    <el-page-header @back="goBack" :title="baby?.name ? `${baby.name}的照片墙` : '照片墙'">
      <template #extra>
        <el-button type="primary" @click="showUploadDialog">
          <el-icon><Upload /></el-icon>
          上传照片
        </el-button>
      </template>
    </el-page-header>

    <div v-if="baby" class="content">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic title="总照片数" :value="photos.length">
              <template #prefix>
                <el-icon><Picture /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic title="本月新增" :value="monthlyCount">
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic title="最新照片" :value="latestPhotoDate">
              <template #prefix>
                <el-icon><Clock /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 筛选和排序 -->
      <el-card class="filter-card">
        <div class="filter-section">
          <div class="filter-left">
            <span class="filter-label">时间筛选：</span>
            <el-select v-model="timeFilter" placeholder="选择时间" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="最近一周" value="week" />
              <el-option label="最近一月" value="month" />
              <el-option label="最近三月" value="quarter" />
              <el-option label="今年" value="year" />
            </el-select>
          </div>
          <div class="filter-right">
            <el-input
              v-model="searchText"
              placeholder="搜索照片说明..."
              prefix-icon="Search"
              clearable
              style="width: 200px; margin-right: 10px"
            />
            <el-select v-model="sortBy" style="width: 120px">
              <el-option label="日期降序" value="dateDesc" />
              <el-option label="日期升序" value="dateAsc" />
              <el-option label="添加时间" value="createdAt" />
            </el-select>
          </div>
        </div>
      </el-card>

      <!-- 照片网格 -->
      <el-card class="photos-card">
        <template #header>
          <div class="photos-header">
            <h3>照片列表 ({{ filteredPhotos.length }})</h3>
            <div class="view-toggle">
              <el-button-group>
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : 'default'"
                  @click="viewMode = 'grid'"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : 'default'"
                  @click="viewMode = 'list'"
                >
                  <el-icon><List /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <div v-if="filteredPhotos.length === 0" class="empty-state">
          <el-empty description="暂无照片">
            <el-button type="primary" @click="showUploadDialog">上传第一张照片</el-button>
          </el-empty>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="photos-grid">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            class="photo-item"
            @click="previewPhoto(photo)"
          >
            <div class="photo-wrapper">
              <el-image
                :src="photo.url"
                fit="cover"
                :preview-src-list="[photo.url]"
                class="photo-image"
              />
              <div class="photo-overlay">
                <div class="photo-actions">
                  <el-button size="small" type="primary" circle @click.stop="editPhoto(photo)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" type="danger" circle @click.stop="deletePhoto(photo.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <div class="photo-info">
              <p class="photo-caption">{{ photo.caption || '无说明' }}</p>
              <p class="photo-date">{{ formatDate(photo.date) }}</p>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <el-table v-else :data="filteredPhotos" stripe>
          <el-table-column label="照片" width="100">
            <template #default="{ row }">
              <el-image
                :src="row.url"
                fit="cover"
                :preview-src-list="[row.url]"
                class="photo-thumbnail"
              />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="拍摄日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="caption" label="说明" min-width="200">
            <template #default="{ row }">
              <span v-if="row.caption">{{ row.caption }}</span>
              <span v-else class="no-data">无说明</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="添加时间" width="120">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="editPhoto(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" link @click="deletePhoto(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 上传照片对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传照片"
      width="600px"
    >
      <el-form
        :model="photoForm"
        :rules="formRules"
        ref="formRef"
        label-width="80px"
      >
        <el-form-item label="照片" prop="url">
          <el-upload
            v-model:file-list="uploadFiles"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            accept="image/*"
            list-type="picture"
          >
            <el-button type="primary">选择照片</el-button>
            <template #tip>
              <div class="upload-tip">
                支持 JPG、PNG 等格式，文件大小不超过 5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="拍摄日期" prop="date">
          <el-date-picker
            v-model="photoForm.date"
            type="date"
            placeholder="选择拍摄日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="照片说明">
          <el-input
            v-model="photoForm.caption"
            type="textarea"
            :rows="3"
            placeholder="请输入照片说明（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePhoto">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑照片对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑照片信息"
      width="500px"
    >
      <el-form
        :model="editingPhotoForm"
        :rules="formRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="照片">
          <el-image
            :src="editingPhotoForm.url"
            fit="cover"
            style="width: 200px; height: 200px; border-radius: 4px;"
          />
        </el-form-item>
        <el-form-item label="拍摄日期" prop="date">
          <el-date-picker
            v-model="editingPhotoForm.date"
            type="date"
            placeholder="选择拍摄日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="照片说明">
          <el-input
            v-model="editingPhotoForm.caption"
            type="textarea"
            :rows="3"
            placeholder="请输入照片说明（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePhoto">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload, Picture, Calendar, Clock, Search, Grid, List, Edit, Delete
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const babiesStore = useBabiesStore()

const babyId = computed(() => route.params.id as string)
const baby = computed(() => babiesStore.getBabyById(babyId.value))
const photos = computed(() => babiesStore.getPhotosByBabyId(babyId.value))

const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const formRef = ref()
const editFormRef = ref()
const viewMode = ref<'grid' | 'list'>('grid')
const timeFilter = ref('')
const searchText = ref('')
const sortBy = ref('dateDesc')
const uploadFiles = ref([])

const photoForm = ref({
  url: '',
  date: new Date().toISOString().split('T')[0],
  caption: ''
})

const editingPhotoForm = ref({
  id: '',
  url: '',
  date: '',
  caption: ''
})

const formRules = {
  date: [{ required: true, message: '请选择拍摄日期', trigger: 'change' }]
}

const monthlyCount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return photos.value.filter(photo => {
    const photoDate = new Date(photo.date)
    return photoDate.getMonth() === currentMonth && photoDate.getFullYear() === currentYear
  }).length
})

const latestPhotoDate = computed(() => {
  if (photos.value.length === 0) return '无'
  const latestPhoto = photos.value.reduce((latest, photo) => {
    return new Date(photo.date) > new Date(latest.date) ? photo : latest
  })
  return formatDate(latestPhoto.date)
})

const filteredPhotos = computed(() => {
  let filtered = [...photos.value]

  // 时间筛选
  if (timeFilter.value) {
    const now = new Date()
    let cutoffDate: Date

    switch (timeFilter.value) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoffDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        cutoffDate = new Date(0)
    }

    filtered = filtered.filter(photo => new Date(photo.date) >= cutoffDate)
  }

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    filtered = filtered.filter(photo =>
      (photo.caption && photo.caption.toLowerCase().includes(searchLower))
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'dateAsc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'dateDesc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return filtered
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const goBack = () => {
  router.push(`/babies/${babyId.value}`)
}

const showUploadDialog = () => {
  photoForm.value = {
    url: '',
    date: new Date().toISOString().split('T')[0],
    caption: ''
  }
  uploadFiles.value = []
  uploadDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    photoForm.value.url = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const handleFileRemove = () => {
  photoForm.value.url = ''
}

const savePhoto = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!photoForm.value.url) {
      ElMessage.warning('请选择要上传的照片')
      return
    }

    babiesStore.addPhoto({
      babyId: babyId.value,
      ...photoForm.value
    })

    ElMessage.success('照片上传成功')
    uploadDialogVisible.value = false
  } catch (error) {
    console.error('保存照片失败:', error)
  }
}

const previewPhoto = (photo: any) => {
  // 图片预览功能由 el-image 的 preview-src-list 处理
}

const editPhoto = (photo: any) => {
  editingPhotoForm.value = { ...photo }
  editDialogVisible.value = true
}

const updatePhoto = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    babiesStore.updatePhoto(editingPhotoForm.value.id, editingPhotoForm.value)
    ElMessage.success('照片信息更新成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error('更新照片失败:', error)
  }
}

const deletePhoto = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这张照片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    babiesStore.deletePhoto(id)
    ElMessage.success('照片删除成功')
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
.photos {
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
  justify-content: space-between;
  align-items: center;
}

.filter-label {
  font-weight: 500;
  color: #606266;
}

.photos-card .photos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.photo-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.photo-item:hover {
  transform: translateY(-2px);
}

.photo-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  display: flex;
  gap: 10px;
}

.photo-info {
  text-align: center;
}

.photo-caption {
  margin: 5px 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-date {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.photo-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.no-data {
  color: #909399;
  font-style: italic;
}
</style>