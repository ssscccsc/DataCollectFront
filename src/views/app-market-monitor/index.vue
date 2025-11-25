<template>
  <div class="app-market-monitor-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.appMarketMonitor') }}</h2>
      <p class="page-description">{{ $t('appMarketMonitor.description') }}</p>
    </div>

    <el-card>
      <!-- Tab页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('appMarketMonitor.appStore')" name="appstore">
          <template #label>
            <span>{{ $t('appMarketMonitor.appStore') }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane :label="$t('appMarketMonitor.googlePlay')" name="googleplay" disabled>
          <template #label>
            <span class="disabled-tab">{{ $t('appMarketMonitor.googlePlay') }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane :label="$t('appMarketMonitor.huaweiMarket')" name="huawei">
          <template #label>
            <span>{{ $t('appMarketMonitor.huaweiMarket') }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane :label="$t('appMarketMonitor.xiaomiMarket')" name="xiaomi">
          <template #label>
            <span>{{ $t('appMarketMonitor.xiaomiMarket') }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 数据筛选 -->
      <div class="filter-section">
        <div class="filter-item">
          <span class="filter-label">{{ $t('appMarketMonitor.selectDate') }}：</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            :placeholder="$t('appMarketMonitor.datePlaceholder')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px; margin-right: 10px;"
            @change="handleDateChange"
          />
          <el-button @click="handleThisWeekClick" :type="isThisWeek ? 'primary' : ''">
            {{ $t('appMarketMonitor.thisWeek') }}
          </el-button>
          <el-button @click="handleThisMonthClick" :type="isThisMonth ? 'primary' : ''" style="margin-left: 10px;">
            {{ $t('appMarketMonitor.thisMonth') }}
          </el-button>
          <el-button @click="handleThisQuarterClick" :type="isThisQuarter ? 'primary' : ''" style="margin-left: 10px;">
            {{ $t('appMarketMonitor.thisQuarter') }}
          </el-button>
        </div>
        <div class="filter-item" style="margin-left: 30px;">
          <span class="filter-label">{{ $t('appMarketMonitor.appCategory') }}：</span>
          <el-button @click="handleCategoryChange('app')" :type="selectedCategory === 'app' ? 'primary' : ''">
            {{ $t('appMarketMonitor.app') }}
          </el-button>
          <el-button @click="handleCategoryChange('game')" :type="selectedCategory === 'game' ? 'primary' : ''" style="margin-left: 10px;">
            {{ $t('appMarketMonitor.game') }}
          </el-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="table-operations">
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" class="full-width-table">
        <el-table-column prop="rank" :label="$t('appMarketMonitor.rank')" min-width="80" width="80" align="center" />
        <el-table-column prop="appName" :label="$t('appMarketMonitor.appName')" min-width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img 
                v-if="scope.row.icon" 
                :src="`data:image/png;base64,${scope.row.icon}`" 
                alt="App Icon" 
                style="width: 40px; height: 40px; object-fit: contain; border-radius: 6px; flex-shrink: 0;"
              />
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ scope.row.appName || '-' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" :label="$t('appMarketMonitor.category')" min-width="100" width="100" />
        <el-table-column prop="description" :label="$t('appMarketMonitor.description')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="currentVersion" :label="$t('appMarketMonitor.currentVersion')" min-width="120" />
        <el-table-column prop="updateDate" :label="$t('appMarketMonitor.updateDate')" min-width="120" width="120" />
        <el-table-column prop="rating" :label="$t('appMarketMonitor.rating')" min-width="100" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.rating">{{ scope.row.rating }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="collectionStatus" :label="$t('appMarketMonitor.collectionStatus')" min-width="120" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getCollectionStatusType(scope.row.collectionStatus)">
              {{ getCollectionStatusText(scope.row.collectionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="testVersion" :label="$t('appMarketMonitor.testVersion')" min-width="120" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :hide-on-single-page="false"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

export default {
  name: 'AppMarketMonitor',
  components: {
    Refresh,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const activeTab = ref('appstore')
    const selectedDate = ref('')
    const selectedCategory = ref('app')
    const periodType = ref('daily') // 周期类型：daily, weekly, monthly, quarterly

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    // 格式化日期为 YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 获取今天的日期
    const getToday = () => {
      return formatDate(new Date())
    }

    // 获取本周最后一天（今天）
    const getThisWeek = () => {
      return formatDate(new Date())
    }

    // 获取本月最后一天
    const getThisMonth = () => {
      const today = new Date()
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return formatDate(lastDay)
    }

    // 获取本季度最后一天
    const getThisQuarter = () => {
      const today = new Date()
      const quarter = Math.floor(today.getMonth() / 3)
      const quarterEndMonth = (quarter + 1) * 3 - 1
      const lastDay = new Date(today.getFullYear(), quarterEndMonth + 1, 0)
      return formatDate(lastDay)
    }

    // 获取当前周数（ISO周数）
    const getWeekNumber = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    }

    // 获取当前周的年和周数（格式：YYYY-WW）
    const getThisWeekValue = () => {
      const today = new Date()
      const year = today.getFullYear()
      const week = getWeekNumber(today)
      return `${year}-${String(week).padStart(2, '0')}`
    }

    // 获取当前月份（格式：YYYY-MM）
    const getThisMonthValue = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    }

    // 获取当前季度（格式：YYYY-Q）
    const getThisQuarterValue = () => {
      const today = new Date()
      const year = today.getFullYear()
      const quarter = Math.floor(today.getMonth() / 3) + 1
      return `${year}-${quarter}`
    }

    // 根据periodType计算periodValue（统一使用当前勾选的时间yyyy-MM-dd）
    const getPeriodValue = () => {
      return selectedDate.value
    }

    // 初始化日期为本周（默认传本周数据）
    selectedDate.value = getThisWeek()
    periodType.value = 'weekly'

    // 判断是否选择了本周
    const isThisWeek = computed(() => {
      return selectedDate.value === getThisWeek()
    })

    // 判断是否选择了本月
    const isThisMonth = computed(() => {
      return selectedDate.value === getThisMonth()
    })

    // 判断是否选择了本季度
    const isThisQuarter = computed(() => {
      return selectedDate.value === getThisQuarter()
    })

    const getCollectionStatusType = (status) => {
      const typeMap = {
        collected: 'success',
        notCollected: 'info',
        collecting: 'warning',
      }
      return typeMap[status] || 'info'
    }

    const getCollectionStatusText = (status) => {
      const textMap = {
        collected: t('appMarketMonitor.collected'),
        notCollected: t('appMarketMonitor.notCollected'),
        collecting: t('appMarketMonitor.collecting'),
      }
      return textMap[status] || status
    }

    // 将Tab名称映射到market_brand
    const getMarketBrand = (tabName) => {
      const marketMap = {
        appstore: 'apple',
        googleplay: 'googleplay',
        huawei: 'huawei',
        xiaomi: 'xiaomi',
      }
      return marketMap[tabName] || tabName
    }

    // 将API返回的数据映射到表格数据
    const mapApiDataToTableData = (apiData) => {
      if (!apiData || !Array.isArray(apiData)) {
        return []
      }
      
      return apiData.map((item) => {
        return {
          rank: item.rank || '-',
          appName: item.app_name || '-',
          category: item.app_category || item.app_type || '-',
          description: item.app_description || '-',
          currentVersion: item.app_version || '-',
          updateDate: item.version_update_date || item.date || '-',
          rating: item.score || null,
          collectionStatus: 'notCollected', // 默认未采集
          testVersion: item.dial_version || '-',
          icon: item.icon || null, // base64编码的图标
        }
      })
    }

    // 将类别选择转换为API参数
    const getCategoryParam = (category) => {
      const categoryMap = {
        app: 'application',
        game: 'game',
      }
      return categoryMap[category] || category
    }

    const loadData = async () => {
      // 如果选中的是禁用的Tab，不加载数据
      if (activeTab.value === 'googleplay') {
        return
      }
      
      loading.value = true
      try {
        const marketBrand = getMarketBrand(activeTab.value)
        const categoryParam = getCategoryParam(selectedCategory.value)
        const periodValue = getPeriodValue()
        const response = await request.post('/external/apps/get-daily-rank', {
          period_type: periodType.value,
          period_value: periodValue,
          market_brand: marketBrand,
          category: categoryParam,
        })
        
        if (response.code === 200 && response.data && response.data.data) {
          // 映射API数据到表格数据
          const allData = mapApiDataToTableData(response.data.data)
          
          // 前端分页处理
          const start = (pagination.current - 1) * pagination.size
          const end = start + pagination.size
          tableData.value = allData.slice(start, end)
          pagination.total = allData.length
        } else {
          tableData.value = []
          pagination.total = 0
        }
      } catch (error) {
        ElMessage.error(t('appMarketMonitor.loadDataFailed'))
        tableData.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    const handleTabChange = (tabName) => {
      pagination.current = 1
      loadData()
    }

    const handleDateChange = (date) => {
      periodType.value = 'daily'
      pagination.current = 1
      loadData()
    }

    const handleThisWeekClick = () => {
      periodType.value = 'weekly'
      selectedDate.value = getThisWeek()
      pagination.current = 1
      loadData()
    }

    const handleThisMonthClick = () => {
      periodType.value = 'monthly'
      selectedDate.value = getThisMonth()
      pagination.current = 1
      loadData()
    }

    const handleThisQuarterClick = () => {
      periodType.value = 'quarterly'
      selectedDate.value = getThisQuarter()
      pagination.current = 1
      loadData()
    }

    const handleCategoryChange = (category) => {
      selectedCategory.value = category
      pagination.current = 1
      loadData()
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadData()
    }

    const handleViewDetail = (row) => {
      // TODO: 实现查看详情功能
      ElMessage.info(t('appMarketMonitor.viewDetailNotImplemented'))
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      pagination,
      activeTab,
      selectedDate,
      selectedCategory,
      isThisWeek,
      isThisMonth,
      isThisQuarter,
      loadData,
      handleTabChange,
      handleDateChange,
      handleThisWeekClick,
      handleThisMonthClick,
      handleThisQuarterClick,
      handleCategoryChange,
      handleSizeChange,
      handleCurrentChange,
      getCollectionStatusType,
      getCollectionStatusText,
    }
  },
}
</script>

<style scoped>
.app-market-monitor-page {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.filter-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
  white-space: nowrap;
}

.table-operations {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.full-width-table {
  width: 100%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.disabled-tab {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>

