<template>
  <div class="app-version-change-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.appVersionChange') }}</h2>
      <p class="page-description">{{ $t('appVersionChange.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('appVersionChange.searchPlaceholder')"
          style="width: 300px; margin-right: 10px;"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          {{ $t('common.search') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="appName" :label="$t('appVersionChange.appName')" :min-width="columnWidths.appName">
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
        <el-table-column prop="category" :label="$t('appVersionChange.category')" :min-width="columnWidths.category" />
        <el-table-column prop="description" :label="$t('appVersionChange.description')" :min-width="columnWidths.description" show-overflow-tooltip />
        <el-table-column prop="version" :label="$t('appVersionChange.version')" :min-width="columnWidths.version" />
        <el-table-column prop="updateTime" :label="$t('appVersionChange.updateTime')" :min-width="columnWidths.updateTime">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="changeRecord" :label="$t('appVersionChange.changeRecord')" :min-width="columnWidths.changeRecord" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-if="scope.row.changeRecord" type="info" size="small">
              {{ scope.row.changeRecord }}
            </el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operations')" :min-width="columnWidths.operations" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              {{ $t('common.view') }}
            </el-button>
            <el-button type="info" size="small" @click="handleViewChangeHistory(scope.row)">
              {{ $t('appVersionChange.changeHistory') }}
            </el-button>
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

export default {
  name: 'AppVersionChange',
  components: {
    Search,
    Refresh,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const searchKeyword = ref('')

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    // 根据比例计算列宽（基础单位：12px）
    // 应用名称15%, 类别10%, 简介25%, 版本15%, 时间10%, 变更记录20%, 操作列10%
    const baseUnit = 12
    const columnWidths = reactive({
      appName: 15 * baseUnit,      // 180px (15%)
      category: 10 * baseUnit,     // 120px (10%)
      description: 25 * baseUnit,  // 300px (25%)
      version: 15 * baseUnit,      // 180px (15%)
      updateTime: 10 * baseUnit,   // 120px (10%)
      changeRecord: 20 * baseUnit, // 240px (20%)
      operations: 10 * baseUnit,   // 120px (10%)
    })

    const getChangeTypeTag = (type) => {
      const tagMap = {
        major: 'danger',
        minor: 'warning',
        patch: 'info',
      }
      return tagMap[type] || 'info'
    }

    const getChangeTypeText = (type) => {
      const textMap = {
        major: t('appVersionChange.majorUpdate'),
        minor: t('appVersionChange.minorUpdate'),
        patch: t('appVersionChange.patchUpdate'),
      }
      return textMap[type] || type
    }

    // 将API返回的数据映射到表格数据
    const mapApiDataToTableData = (apiData) => {
      if (!apiData || !Array.isArray(apiData)) {
        return []
      }
      
      return apiData.map((item) => {
        return {
          appName: item.app_name || '-',
          icon: item.icon || null,
          category: item.app_category || '-',
          description: item.app_description || '-',
          version: item.app_version || '-',
          updateTime: item.version_update_date || '-',
          changeRecord: item.change_log || '-',
          dialVersion: item.dial_verion || '-',
        }
      })
    }

    const loadData = async () => {
      loading.value = true
      try {
        const response = await request.post('/external/apps/get_version_history', {
          is_ios: false,
        })
        
        if (response.code === 200 && response.message === 'success' && response.data) {
          // 映射API数据到表格数据
          const allData = mapApiDataToTableData(response.data)
          
          // 如果有搜索关键词，进行前端过滤
          let filteredData = allData
          if (searchKeyword.value && searchKeyword.value.trim()) {
            const keyword = searchKeyword.value.trim().toLowerCase()
            filteredData = allData.filter((item) => {
              return (
                (item.appName && item.appName.toLowerCase().includes(keyword)) ||
                (item.category && item.category.toLowerCase().includes(keyword)) ||
                (item.description && item.description.toLowerCase().includes(keyword)) ||
                (item.version && item.version.toLowerCase().includes(keyword))
              )
            })
          }
          
          // 前端分页处理
          const start = (pagination.current - 1) * pagination.size
          const end = start + pagination.size
          tableData.value = filteredData.slice(start, end)
          pagination.total = filteredData.length
        } else {
          tableData.value = []
          pagination.total = 0
        }
      } catch (error) {
        ElMessage.error(t('appVersionChange.loadDataFailed') || '加载数据失败')
        tableData.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
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

    const formatDateTime = (dateTime) => {
      if (!dateTime) {
        return '-'
      }
      // 如果已经是 YYYY-MM-DD 格式，直接返回
      if (typeof dateTime === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
        return dateTime
      }
      try {
        const date = new Date(dateTime)
        if (isNaN(date.getTime())) {
          return dateTime
        }
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (e) {
        return dateTime
      }
    }

    const handleViewDetail = (row) => {
      // TODO: 实现查看详情功能
      ElMessage.info(t('appVersionChange.viewDetailNotImplemented'))
    }

    const handleViewChangeHistory = (row) => {
      // TODO: 实现查看变更历史功能
      ElMessage.info(t('appVersionChange.viewChangeHistoryNotImplemented'))
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      searchKeyword,
      pagination,
      columnWidths,
      loadData,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
      handleViewChangeHistory,
      formatDateTime,
      getChangeTypeTag,
      getChangeTypeText,
    }
  },
}
</script>

<style scoped>
.app-version-change-page {
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

.table-operations {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>


