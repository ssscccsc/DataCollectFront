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
                  <div class="comparison-content" v-loading="speedComparisonLoading">
                    <div v-if="speedComparisonData">
                      <!-- 图表展示 -->
                      <div class="chart-container">
                        <div ref="speedChartRef" class="speed-chart"></div>
                      </div>
                      
                      <!-- 数据表格 -->
                      <div class="table-container">
                        <h3 class="table-title">{{ $t('experienceTest.dataComparison.clientSpeedData') }}</h3>
                        <el-table :data="speedComparisonData.clientSpeedList" border stripe style="width: 100%" max-height="300">
                          <el-table-column type="index" label="#" width="60" />
                          <el-table-column prop="sequenceNumber" :label="$t('experienceTest.clientData.sequenceNumber')" width="120" />
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.clientData.time')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.speedKbps')" width="150">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.speed) }}
                            </template>
                          </el-table-column>
                        </el-table>
                        
                        <h3 class="table-title" style="margin-top: 20px;">{{ $t('experienceTest.dataComparison.networkSpeedData') }}</h3>
                        <el-table :data="speedComparisonData.networkSpeedList" border stripe style="width: 100%" max-height="300">
                          <el-table-column type="index" label="#" width="60" />
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.clientData.time')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.uplinkBandwidthKbps')" width="200">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.uplinkBandwidth) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.downlinkBandwidthKbps')" width="200">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.downlinkBandwidth) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                    <el-empty v-else :description="$t('common.noData')" />
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
import { ref, reactive, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { DataAnalysis, Refresh } from '@element-plus/icons-vue'
import { getClientDataPage, getSpeedComparison } from '@/api/test-settings'
import * as echarts from 'echarts'

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
    const speedComparisonLoading = ref(false)
    const speedComparisonData = ref(null)
    const speedChartRef = ref(null)
    let speedChart = null
    const currentTaskId = ref(null)

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
        currentTaskId.value = row.taskId
        
        // 重置详情数据
        comparisonDetail.value = null
        speedComparisonData.value = null
        
        // 加载速率对比数据
        loadSpeedComparisonData(row.taskId)
        
        detailLoading.value = false
      } catch (error) {
        console.error('Get detail error:', error)
        ElMessage.error(error.message || t('common.error'))
        activeMainTab.value = 'list'
        detailLoading.value = false
      }
    }

    const loadSpeedComparisonData = async (taskId) => {
      if (!taskId) {
        return
      }
      
      speedComparisonLoading.value = true
      try {
        const response = await getSpeedComparison(taskId)
        if (response.code === 200 && response.data) {
          speedComparisonData.value = response.data
          // 等待DOM更新后渲染图表
          nextTick(() => {
            renderSpeedChart()
          })
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load speed comparison error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        speedComparisonLoading.value = false
      }
    }

    const formatSpeed = (speed) => {
      if (speed === null || speed === undefined) {
        return '-'
      }
      if (typeof speed === 'number') {
        return speed.toFixed(2) + ' Kbps'
      }
      if (typeof speed === 'string') {
        const num = parseFloat(speed)
        if (isNaN(num)) {
          return '-'
        }
        return num.toFixed(2) + ' Kbps'
      }
      return '-'
    }

    const renderSpeedChart = () => {
      if (!speedChartRef.value || !speedComparisonData.value) {
        return
      }
      
      // 销毁旧图表
      if (speedChart) {
        speedChart.dispose()
        speedChart = null
      }
      
      // 创建新图表
      speedChart = echarts.init(speedChartRef.value)
      
      // 准备数据
      const clientData = speedComparisonData.value.clientSpeedList || []
      const networkData = speedComparisonData.value.networkSpeedList || []
      
      // 端侧数据
      const clientTimeStamps = clientData.map(item => item.timeStamp || item.sequenceNumber)
      const clientSpeeds = clientData.map(item => {
        if (typeof item.speed === 'number') {
          return item.speed
        }
        if (typeof item.speed === 'string') {
          return parseFloat(item.speed) || 0
        }
        return 0
      })
      
      // 网络侧数据
      const networkTimeStamps = networkData.map(item => item.timeStamp || '')
      const networkUplinkSpeeds = networkData.map(item => {
        if (typeof item.uplinkBandwidth === 'number') {
          return item.uplinkBandwidth
        }
        if (typeof item.uplinkBandwidth === 'string') {
          return parseFloat(item.uplinkBandwidth) || 0
        }
        return 0
      })
      const networkDownlinkSpeeds = networkData.map(item => {
        if (typeof item.downlinkBandwidth === 'number') {
          return item.downlinkBandwidth
        }
        if (typeof item.downlinkBandwidth === 'string') {
          return parseFloat(item.downlinkBandwidth) || 0
        }
        return 0
      })
      
      // 配置图表选项
      const option = {
        title: {
          text: t('experienceTest.dataComparison.speedComparison'),
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: [
            t('experienceTest.dataComparison.clientSpeed'),
            t('experienceTest.dataComparison.networkUplinkSpeed'),
            t('experienceTest.dataComparison.networkDownlinkSpeed'),
          ],
          top: 30,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: clientTimeStamps.length > 0 ? clientTimeStamps : networkTimeStamps,
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Kbps',
          },
        ],
        series: [
          {
            name: t('experienceTest.dataComparison.clientSpeed'),
            type: 'line',
            data: clientSpeeds,
            smooth: true,
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkUplinkSpeed'),
            type: 'line',
            data: networkUplinkSpeeds,
            smooth: true,
            itemStyle: {
              color: '#67C23A',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkDownlinkSpeed'),
            type: 'line',
            data: networkDownlinkSpeeds,
            smooth: true,
            itemStyle: {
              color: '#E6A23C',
            },
          },
        ],
      }
      
      speedChart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        if (speedChart) {
          speedChart.resize()
        }
      })
    }

    // 监听tab切换，当切换到速率对比tab时加载数据
    watch(activeComparisonTab, (newTab) => {
      if (newTab === 'speed' && currentTaskId.value && !speedComparisonData.value) {
        loadSpeedComparisonData(currentTaskId.value)
      } else if (newTab === 'speed' && speedComparisonData.value) {
        nextTick(() => {
          renderSpeedChart()
        })
      }
    })


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

    onBeforeUnmount(() => {
      // 销毁图表
      if (speedChart) {
        speedChart.dispose()
        speedChart = null
      }
    })

    return {
      loading,
      tableData,
      pagination,
      activeMainTab,
      detailLoading,
      comparisonDetail,
      activeComparisonTab,
      speedComparisonLoading,
      speedComparisonData,
      speedChartRef,
      loadData,
      handleCompare,
      handleView,
      handleSizeChange,
      handleCurrentChange,
      formatSpeed,
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

.chart-container {
  margin-bottom: 30px;
}

.speed-chart {
  width: 100%;
  height: 400px;
}

.table-container {
  margin-top: 20px;
}

.table-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>




















