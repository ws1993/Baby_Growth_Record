<template>
  <div class="growth-records">
    <el-page-header @back="goBack" :title="baby?.name ? `${baby.name}的成长记录` : '成长记录'">
      <template #extra>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加记录
        </el-button>
      </template>
    </el-page-header>

    <div v-if="baby" class="content">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic title="总记录数" :value="records.length">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic
              title="最新身高"
              :value="latestHeight"
              suffix="cm"
              v-if="latestHeight"
            >
              <template #prefix>
                <el-icon><TrendCharts /></el-icon>
              </template>
            </el-statistic>
            <div v-else class="no-data">暂无身高数据</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <el-statistic
              title="最新体重"
              :value="latestWeight"
              suffix="kg"
              v-if="latestWeight"
            >
              <template #prefix>
                <el-icon><TrendCharts /></el-icon>
              </template>
            </el-statistic>
            <div v-else class="no-data">暂无体重数据</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 成长曲线图表 -->
      <el-card class="chart-card" v-if="records.length > 0">
        <template #header>
          <div class="chart-header">
            <h3>成长曲线</h3>
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button value="height">身高</el-radio-button>
              <el-radio-button value="weight">体重</el-radio-button>
              <el-radio-button value="headCircumference">头围</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>

      <!-- 记录列表 -->
      <el-card class="records-card">
        <template #header>
          <div class="records-header">
            <h3>记录列表</h3>
            <div class="header-actions">
              <el-input
                v-model="searchText"
                placeholder="搜索记录..."
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
              <el-select v-model="sortBy" style="width: 120px">
                <el-option label="日期降序" value="dateDesc" />
                <el-option label="日期升序" value="dateAsc" />
              </el-select>
            </div>
          </div>
        </template>

        <div v-if="filteredRecords.length === 0" class="empty-state">
          <el-empty description="暂无成长记录">
            <el-button type="primary" @click="showAddDialog">添加第一条记录</el-button>
          </el-empty>
        </div>

        <el-table v-else :data="filteredRecords" stripe>
          <el-table-column prop="date" label="日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="height" label="身高" width="100">
            <template #default="{ row }">
              <span v-if="row.height">{{ row.height }} cm</span>
              <span v-else class="no-data">--</span>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="体重" width="100">
            <template #default="{ row }">
              <span v-if="row.weight">{{ row.weight }} kg</span>
              <span v-else class="no-data">--</span>
            </template>
          </el-table-column>
          <el-table-column prop="headCircumference" label="头围" width="100">
            <template #default="{ row }">
              <span v-if="row.headCircumference">{{ row.headCircumference }} cm</span>
              <span v-else class="no-data">--</span>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" min-width="200">
            <template #default="{ row }">
              <span v-if="row.notes">{{ row.notes }}</span>
              <span v-else class="no-data">--</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="editRecord(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" link @click="deleteRecord(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingRecord ? '编辑成长记录' : '添加成长记录'"
      width="500px"
    >
      <el-form
        :model="recordForm"
        :rules="formRules"
        ref="formRef"
        label-width="80px"
      >
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="身高(cm)" prop="height">
          <el-input-number
            v-model="recordForm.height"
            :precision="1"
            :min="0"
            :max="200"
            controls-position="right"
            placeholder="请输入身高"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="体重(kg)" prop="weight">
          <el-input-number
            v-model="recordForm.weight"
            :precision="2"
            :min="0"
            :max="50"
            controls-position="right"
            placeholder="请输入体重"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="头围(cm)" prop="headCircumference">
          <el-input-number
            v-model="recordForm.headCircumference"
            :precision="1"
            :min="0"
            :max="60"
            controls-position="right"
            placeholder="请输入头围"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="recordForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBabiesStore } from '../stores/babies'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, TrendCharts, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const babiesStore = useBabiesStore()

const babyId = computed(() => route.params.id as string)
const baby = computed(() => babiesStore.getBabyById(babyId.value))
const records = computed(() => babiesStore.getGrowthRecordsByBabyId(babyId.value))

const dialogVisible = ref(false)
const editingRecord = ref(false)
const formRef = ref()
const chartRef = ref()
const chartType = ref('height')
const searchText = ref('')
const sortBy = ref('dateDesc')

const recordForm = ref({
  id: '',
  date: '',
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  headCircumference: undefined as number | undefined,
  notes: ''
})

const formRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const latestHeight = computed(() => {
  const heightRecords = records.value.filter(r => r.height)
  if (heightRecords.length === 0) return null
  return Math.max(...heightRecords.map(r => r.height!))
})

const latestWeight = computed(() => {
  const weightRecords = records.value.filter(r => r.weight)
  if (weightRecords.length === 0) return null
  return Math.max(...weightRecords.map(r => r.weight!))
})

const filteredRecords = computed(() => {
  let filtered = [...records.value]

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    filtered = filtered.filter(record =>
      record.date.includes(searchLower) ||
      (record.notes && record.notes.toLowerCase().includes(searchLower))
    )
  }

  // 排序
  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortBy.value === 'dateDesc' ? dateB - dateA : dateA - dateB
  })

  return filtered
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push(`/babies/${babyId.value}`)
}

const showAddDialog = () => {
  editingRecord.value = false
  recordForm.value = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    height: undefined,
    weight: undefined,
    headCircumference: undefined,
    notes: ''
  }
  dialogVisible.value = true
}

const editRecord = (record: any) => {
  editingRecord.value = true
  recordForm.value = { ...record }
  dialogVisible.value = true
}

const saveRecord = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (editingRecord.value) {
      babiesStore.updateGrowthRecord(recordForm.value.id, recordForm.value)
      ElMessage.success('记录更新成功')
    } else {
      babiesStore.addGrowthRecord({
        babyId: babyId.value,
        ...recordForm.value
      })
      ElMessage.success('记录添加成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('保存记录失败:', error)
  }
}

const deleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    babiesStore.deleteGrowthRecord(id)
    ElMessage.success('记录删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 图表相关
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value as HTMLElement)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return

  const chartData = records.value
    .filter(record => record[chartType.value as keyof typeof record])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (chartData.length === 0) {
    chartInstance.clear()
    chartInstance.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      }
    })
    return
  }

  const xAxisData = chartData.map(record => formatDate(record.date))
  const seriesData = chartData.map(record => record[chartType.value as keyof typeof record] as number)

  const titles = {
    height: '身高成长曲线',
    weight: '体重成长曲线',
    headCircumference: '头围成长曲线'
  }

  const units = {
    height: 'cm',
    weight: 'kg',
    headCircumference: 'cm'
  }

  const option = {
    title: {
      text: titles[chartType.value as keyof typeof titles],
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>${titles[chartType.value as keyof typeof titles]}: ${data.value}${units[chartType.value as keyof typeof units]}`
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: units[chartType.value as keyof typeof units]
    },
    series: [{
      data: seriesData,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#409eff'
      },
      itemStyle: {
        color: '#409eff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(64, 158, 255, 0.3)'
          },
          {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.1)'
          }
        ])
      }
    }]
  }

  chartInstance.setOption(option)
}

watch([chartType, records], () => {
  nextTick(() => {
    updateChart()
  })
})

onMounted(() => {
  babiesStore.loadFromLocalStorage()
  if (!baby.value) {
    router.push('/dashboard')
    return
  }

  nextTick(() => {
    initChart()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
.growth-records {
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

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.records-card .records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.no-data {
  color: #909399;
  font-style: italic;
}
</style>