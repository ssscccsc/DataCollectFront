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
        <el-table-column prop="appName" :label="$t('appVersionChange.appName')" min-width="200">
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
        <el-table-column prop="category" :label="$t('appVersionChange.category')" width="120" />
        <el-table-column prop="description" :label="$t('appVersionChange.description')" width="200" show-overflow-tooltip />
        <el-table-column prop="version" :label="$t('appVersionChange.version')" width="120" />
        <el-table-column prop="updateTime" :label="$t('appVersionChange.updateTime')" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="changeRecord" :label="$t('appVersionChange.changeRecord')" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-if="scope.row.changeRecord" type="info" size="small">
              {{ scope.row.changeRecord }}
            </el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operations')" width="200" fixed="right">
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

    const loadData = async () => {
      loading.value = true
      try {
        // TODO: 替换为实际的API接口
        // const response = await request.get('/app-version-change/page', {
        //   params: {
        //     current: pagination.current,
        //     size: pagination.size,
        //     keyword: searchKeyword.value,
        //   },
        // })
        // tableData.value = response.data.records || []
        // pagination.total = response.data.total || 0
        
        // 模拟数据
        tableData.value = []
        pagination.total = 0
      } catch (error) {
        ElMessage.error(t('appVersionChange.loadDataFailed'))
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
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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


