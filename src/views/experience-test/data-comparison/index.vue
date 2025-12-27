<template>
  <div class="data-comparison-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.dataComparison') }}</h2>
      <p class="page-description">{{ $t('experienceTest.dataComparison.description') }}</p>
    </div>

    <el-card>
      <el-tabs v-model="activeMainTab" type="border-card">
        <!-- 第一个tab：数据列表页 -->
        <el-tab-pane :label="$t('experienceTest.dataComparison.comparisonList')" name="list">
          <div class="table-operations">
            <el-button type="primary" @click="handleCompare">
              <el-icon><DataAnalysis /></el-icon>
              {{ $t('experienceTest.dataComparison.compare') }}
            </el-button>
            <el-button @click="loadData">
              <el-icon><Refresh /></el-icon>
              {{ $t('common.refresh') }}
            </el-button>
          </div>

          <el-table :data="tableData" v-loading="loading" style="width: 100%" stripe border>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="taskId" :label="$t('experienceTest.clientData.taskId')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="service" :label="$t('experienceTest.clientData.service')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="app" :label="$t('experienceTest.clientData.app')" min-width="150" show-overflow-tooltip />
            <el-table-column :label="$t('common.operations')" width="120" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleView(scope.row)">
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
            />
          </div>
        </el-tab-pane>

        <!-- 第二个tab：详情页 -->
        <el-tab-pane :label="$t('experienceTest.dataComparison.detailTitle')" name="detail">
          <div class="detail-container" v-loading="detailLoading">
            <!-- 对比详情子tab -->
            <div class="comparison-tabs-wrapper">
              <el-tabs v-model="activeComparisonTab" type="border-card" class="comparison-tabs">
                <!-- 速率对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.speedComparison')" name="speed">
                  <div class="comparison-content">
                    <el-empty :description="$t('experienceTest.dataComparison.detailNotImplemented')" />
                  </div>
                </el-tab-pane>

                <!-- RTT对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.rttComparison')" name="rtt">
                  <div class="comparison-content">
                    <el-empty :description="$t('experienceTest.dataComparison.detailNotImplemented')" />
                  </div>
                </el-tab-pane>

                <!-- 卡顿对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.stutterComparison')" name="stutter">
                  <div class="comparison-content">
                    <el-empty :description="$t('experienceTest.dataComparison.detailNotImplemented')" />
                  </div>
                </el-tab-pane>

                <!-- 平均QOE对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.avgQoeComparison')" name="avgQoe">
                  <div class="comparison-content">
                    <el-empty :description="$t('experienceTest.dataComparison.detailNotImplemented')" />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { DataAnalysis, Refresh } from '@element-plus/icons-vue'
import { getClientDataPage } from '@/api/test-settings'

export default {
  name: 'DataComparison',
  components: {
    DataAnalysis,
    Refresh,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    // 初始化主tab，默认显示数据列表
    const activeMainTab = ref('list')
    const detailLoading = ref(false)
    const comparisonDetail = ref(null)
    const activeComparisonTab = ref('speed')

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }

        const response = await getClientDataPage(params)
        if (response.code === 200) {
          tableData.value = response.data.records || []
          pagination.total = response.data.total || 0
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load data error:', error)
        ElMessage.error(t('common.error'))
      } finally {
        loading.value = false
      }
    }

    const handleCompare = () => {
      ElMessage.info(t('experienceTest.dataComparison.compareNotImplemented'))
    }

    const handleView = (row) => {
      if (!row || !row.taskId) {
        ElMessage.warning('无效的数据')
        return
      }
      
      try {
        // 切换到详情tab
        activeMainTab.value = 'detail'
        activeComparisonTab.value = 'speed'
        detailLoading.value = true
        
        // 重置详情数据
        comparisonDetail.value = null
        
        // TODO: 实现详情数据加载逻辑
        // const response = await getComparisonDetail(row.taskId)
        // if (response.code === 200 && response.data) {
        //   comparisonDetail.value = response.data
        // } else {
        //   ElMessage.error(response.message || t('common.error'))
        //   activeMainTab.value = 'list'
        // }
        
        // 临时显示提示
        setTimeout(() => {
          ElMessage.info(t('experienceTest.dataComparison.viewNotImplemented'))
          detailLoading.value = false
        }, 500)
      } catch (error) {
        console.error('Get detail error:', error)
        ElMessage.error(error.message || t('common.error'))
        activeMainTab.value = 'list'
        detailLoading.value = false
      }
    }


    const handleSizeChange = (val) => {
      pagination.size = val
      loadData()
    }

    const handleCurrentChange = (val) => {
      pagination.current = val
      loadData()
    }

    onMounted(() => {
      // 确保默认显示数据列表tab
      activeMainTab.value = 'list'
      // 使用 nextTick 确保 DOM 更新后再加载数据
      nextTick(() => {
        loadData()
      })
    })

    return {
      loading,
      tableData,
      pagination,
      activeMainTab,
      detailLoading,
      comparisonDetail,
      activeComparisonTab,
      loadData,
      handleCompare,
      handleView,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.data-comparison-page {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.data-comparison-page :deep(.el-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.data-comparison-page :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.table-operations {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.table-operations .el-button {
  margin-right: 8px;
}

.data-comparison-page :deep(.el-table) {
  flex: 1;
  width: 100% !important;
}

.data-comparison-page :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.pagination {
  margin-top: 20px;
  text-align: right;
  flex-shrink: 0;
}

.detail-container {
  min-height: 400px;
  padding: 20px;
}

.comparison-detail {
  width: 100%;
}

.comparison-tabs-wrapper {
  margin-top: 20px;
  height: calc(100vh - 300px);
  overflow-y: auto;
}

.comparison-tabs {
  height: 100%;
}

.comparison-content {
  min-height: 400px;
  padding: 20px;
}
</style>




















