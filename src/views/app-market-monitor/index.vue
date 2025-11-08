<template>
  <div class="app-market-monitor-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.appMarketMonitor') }}</h2>
      <p class="page-description">{{ $t('appMarketMonitor.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('appMarketMonitor.searchPlaceholder')"
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
        <el-table-column prop="appName" :label="$t('appMarketMonitor.appName')" width="200" />
        <el-table-column prop="packageName" :label="$t('appMarketMonitor.packageName')" width="250" />
        <el-table-column prop="market" :label="$t('appMarketMonitor.market')" width="150" />
        <el-table-column prop="currentVersion" :label="$t('appMarketMonitor.currentVersion')" width="150" />
        <el-table-column prop="updateTime" :label="$t('appMarketMonitor.updateTime')" width="180" />
        <el-table-column prop="status" :label="$t('appMarketMonitor.status')" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'available' ? 'success' : 'danger'">
              {{ scope.row.status === 'available' ? $t('appMarketMonitor.available') : $t('appMarketMonitor.unavailable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operations')" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              {{ $t('common.view') }}
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
  name: 'AppMarketMonitor',
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

    const loadData = async () => {
      loading.value = true
      try {
        // TODO: 替换为实际的API接口
        // const response = await request.get('/app-market-monitor/page', {
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
        ElMessage.error(t('appMarketMonitor.loadDataFailed'))
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
      searchKeyword,
      pagination,
      loadData,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
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

