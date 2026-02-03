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

          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchForm.taskId"
              :placeholder="$t('experienceTest.clientData.searchTaskId')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.nation"
              :placeholder="$t('experienceTest.clientData.searchNation')"
              style="width: 150px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.operator"
              :placeholder="$t('experienceTest.clientData.searchOperator')"
              style="width: 150px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.prb"
              :placeholder="$t('experienceTest.clientData.searchPrb')"
              style="width: 120px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.rsrp"
              :placeholder="$t('experienceTest.clientData.searchRsrp')"
              style="width: 120px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.service"
              :placeholder="$t('experienceTest.clientData.searchService')"
              style="width: 150px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.app"
              :placeholder="$t('experienceTest.clientData.searchApp')"
              style="width: 150px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.userCategory"
              :placeholder="$t('experienceTest.clientData.searchUserCategory')"
              style="width: 150px; margin-right: 10px;"
              clearable
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('common.reset') }}
            </el-button>
          </div>

          <el-table :data="tableData" v-loading="loading" style="width: 100%" stripe border>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="taskId" :label="$t('experienceTest.clientData.taskId')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="nation" :label="$t('experienceTest.clientData.nation')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="operator" :label="$t('experienceTest.clientData.operator')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="prb" :label="$t('experienceTest.clientData.prb')" min-width="100" show-overflow-tooltip />
            <el-table-column prop="rsrp" :label="$t('experienceTest.clientData.rsrp')" min-width="100" show-overflow-tooltip />
            <el-table-column prop="service" :label="$t('experienceTest.clientData.service')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="app" :label="$t('experienceTest.clientData.app')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="userCategory" :label="$t('experienceTest.clientData.userCategory')" min-width="120" show-overflow-tooltip />
            <el-table-column :label="$t('common.operations')" width="200" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleView(scope.row)">
                  {{ $t('common.view') }}
                </el-button>
                <el-button type="success" size="small" @click="handleExportFromList(scope.row)" :loading="exporting">
                  {{ $t('experienceTest.dataComparison.exportCharts') }}
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
            <!-- 导出按钮 -->
            <div class="export-operations">
              <el-button type="success" @click="handleExportCharts" :loading="exporting">
                <el-icon><Download /></el-icon>
                {{ $t('experienceTest.dataComparison.exportCharts') }}
              </el-button>
            </div>
            <!-- 对比详情子tab -->
            <div class="comparison-tabs-wrapper">
              <el-tabs v-model="activeComparisonTab" type="border-card" class="comparison-tabs">
                <!-- 速率对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.speedComparison')" name="speed">
                  <div class="comparison-content" v-loading="speedComparisonLoading">
                    <div v-if="speedComparisonData">
                      <!-- 选择网络侧开始时间和端侧开始序号 -->
                      <div class="selection-container">
                        <el-form :inline="true" class="selection-form">
                          <el-form-item :label="$t('experienceTest.dataComparison.selectNetworkStartTime')">
                            <el-select
                              v-model="selectedNetworkStartTime"
                              :placeholder="$t('experienceTest.dataComparison.selectNetworkStartTimePlaceholder')"
                              style="width: 250px;"
                              filterable
                            >
                              <el-option
                                v-for="item in networkStartTimeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item :label="$t('experienceTest.dataComparison.selectClientStartSequence')">
                            <el-select
                              v-model="selectedClientStartSequence"
                              :placeholder="$t('experienceTest.dataComparison.selectClientStartSequencePlaceholder')"
                              style="width: 200px;"
                              filterable
                              clearable
                            >
                              <el-option
                                v-for="item in clientStartSequenceOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item>
                            <el-button type="primary" @click="handleSaveNetworkStartTime" :loading="savingNetworkStartTime">
                              {{ $t('common.save') }}
                            </el-button>
                            <el-button @click="handleResetNetworkStartTime">
                              {{ $t('common.reset') }}
                            </el-button>
                            <el-button @click="handleRefreshSpeedComparison">
                              <el-icon><Refresh /></el-icon>
                              {{ $t('common.refresh') }}
                            </el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <!-- 图表展示 -->
                      <div class="chart-container">
                        <div ref="speedChartRef" class="speed-chart"></div>
                      </div>
                      
                      <!-- 数据表格 -->
                      <div class="table-container">
                        <h3 class="table-title">{{ $t('experienceTest.dataComparison.speedComparisonData') }}</h3>
                        <el-table :data="mergedSpeedData" border stripe style="width: 100%" max-height="500">
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.dataComparison.sequenceNumber')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.clientSpeedKbps')" width="180">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.clientSpeed) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.networkUplinkBandwidthKbps')" width="220">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.networkUplinkSpeed) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.networkDownlinkBandwidthKbps')" width="220">
                            <template #default="scope">
                              {{ formatSpeed(scope.row.networkDownlinkSpeed) }}
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
                  <div class="comparison-content" v-loading="rttComparisonLoading">
                    <div v-if="rttComparisonData">
                      <!-- 选择网络侧开始时间和端侧开始序号 -->
                      <div class="selection-container">
                        <el-form :inline="true" class="selection-form">
                          <el-form-item :label="$t('experienceTest.dataComparison.selectNetworkStartTime')">
                            <el-select
                              v-model="selectedNetworkStartTimeRtt"
                              :placeholder="$t('experienceTest.dataComparison.selectNetworkStartTimePlaceholder')"
                              style="width: 250px;"
                              filterable
                            >
                              <el-option
                                v-for="item in networkStartTimeOptionsRtt"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item :label="$t('experienceTest.dataComparison.selectClientStartSequence')">
                            <el-select
                              v-model="selectedClientStartSequenceRtt"
                              :placeholder="$t('experienceTest.dataComparison.selectClientStartSequencePlaceholder')"
                              style="width: 200px;"
                              filterable
                              clearable
                            >
                              <el-option
                                v-for="item in clientStartSequenceOptionsRtt"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item>
                            <el-button type="primary" @click="handleSaveNetworkStartTimeRtt" :loading="savingNetworkStartTime">
                              {{ $t('common.save') }}
                            </el-button>
                            <el-button @click="handleResetNetworkStartTimeRtt">
                              {{ $t('common.reset') }}
                            </el-button>
                            <el-button @click="handleRefreshRttComparison">
                              <el-icon><Refresh /></el-icon>
                              {{ $t('common.refresh') }}
                            </el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <!-- 图表展示 -->
                      <div class="chart-container">
                        <div ref="rttChartRef" class="rtt-chart"></div>
                      </div>
                      
                      <!-- 数据表格 -->
                      <div class="table-container">
                        <h3 class="table-title">{{ $t('experienceTest.dataComparison.rttComparisonData') }}</h3>
                        <el-table :data="mergedRttData" border stripe style="width: 100%" max-height="500">
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.dataComparison.sequenceNumber')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.clientRtt')" width="180">
                            <template #default="scope">
                              {{ formatValue(scope.row.clientRtt) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.networkServiceDelay')" width="220">
                            <template #default="scope">
                              {{ formatValue(scope.row.networkServiceDelay) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                    <el-empty v-else :description="$t('common.noData')" />
                  </div>
                </el-tab-pane>

                <!-- 卡顿对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.stutterComparison')" name="stutter">
                  <div class="comparison-content" v-loading="stutterComparisonLoading">
                    <div v-if="stutterComparisonData">
                      <!-- 选择网络侧开始时间和端侧开始序号 -->
                      <div class="selection-container">
                        <el-form :inline="true" class="selection-form">
                          <el-form-item :label="$t('experienceTest.dataComparison.selectNetworkStartTime')">
                            <el-select
                              v-model="selectedNetworkStartTimeStutter"
                              :placeholder="$t('experienceTest.dataComparison.selectNetworkStartTimePlaceholder')"
                              style="width: 250px;"
                              filterable
                            >
                              <el-option
                                v-for="item in networkStartTimeOptionsStutter"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item :label="$t('experienceTest.dataComparison.selectClientStartSequence')">
                            <el-select
                              v-model="selectedClientStartSequenceStutter"
                              :placeholder="$t('experienceTest.dataComparison.selectClientStartSequencePlaceholder')"
                              style="width: 200px;"
                              filterable
                              clearable
                            >
                              <el-option
                                v-for="item in clientStartSequenceOptionsStutter"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item>
                            <el-button type="primary" @click="handleSaveNetworkStartTimeStutter" :loading="savingNetworkStartTime">
                              {{ $t('common.save') }}
                            </el-button>
                            <el-button @click="handleResetNetworkStartTimeStutter">
                              {{ $t('common.reset') }}
                            </el-button>
                            <el-button @click="handleRefreshStutterComparison">
                              <el-icon><Refresh /></el-icon>
                              {{ $t('common.refresh') }}
                            </el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <!-- 图表展示 -->
                      <div class="chart-container">
                        <div ref="stutterChartRef" class="stutter-chart"></div>
                      </div>
                      
                      <!-- 数据表格 -->
                      <div class="table-container">
                        <h3 class="table-title">{{ $t('experienceTest.dataComparison.stutterComparisonData') }}</h3>
                        <el-table :data="mergedStutterData" border stripe style="width: 100%" max-height="500">
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.dataComparison.sequenceNumber')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.clientStutterRatio')" width="180">
                            <template #default="scope">
                              {{ formatValue(scope.row.clientStutterRatio) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.networkStallingNumberDiv10')" width="220">
                            <template #default="scope">
                              {{ formatValue(scope.row.networkStallingNumberDiv10) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                    <el-empty v-else :description="$t('common.noData')" />
                  </div>
                </el-tab-pane>

                <!-- 平均QOE对比 -->
                <el-tab-pane :label="$t('experienceTest.dataComparison.avgQoeComparison')" name="avgQoe">
                  <div class="comparison-content" v-loading="avgQoeComparisonLoading">
                    <div v-if="avgQoeComparisonData">
                      <!-- 选择网络侧开始时间和端侧开始序号 -->
                      <div class="selection-container">
                        <el-form :inline="true" class="selection-form">
                          <el-form-item :label="$t('experienceTest.dataComparison.selectNetworkStartTime')">
                            <el-select
                              v-model="selectedNetworkStartTimeAvgQoe"
                              :placeholder="$t('experienceTest.dataComparison.selectNetworkStartTimePlaceholder')"
                              style="width: 250px;"
                              filterable
                            >
                              <el-option
                                v-for="item in networkStartTimeOptionsAvgQoe"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item :label="$t('experienceTest.dataComparison.selectClientStartSequence')">
                            <el-select
                              v-model="selectedClientStartSequenceAvgQoe"
                              :placeholder="$t('experienceTest.dataComparison.selectClientStartSequencePlaceholder')"
                              style="width: 200px;"
                              filterable
                              clearable
                            >
                              <el-option
                                v-for="item in clientStartSequenceOptionsAvgQoe"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item>
                            <el-button type="primary" @click="handleSaveNetworkStartTimeAvgQoe" :loading="savingNetworkStartTime">
                              {{ $t('common.save') }}
                            </el-button>
                            <el-button @click="handleResetNetworkStartTimeAvgQoe">
                              {{ $t('common.reset') }}
                            </el-button>
                            <el-button @click="handleRefreshAvgQoeComparison">
                              <el-icon><Refresh /></el-icon>
                              {{ $t('common.refresh') }}
                            </el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <!-- 图表展示 -->
                      <div class="chart-container">
                        <div ref="avgQoeChartRef" class="avg-qoe-chart"></div>
                      </div>
                      
                      <!-- 数据表格 -->
                      <div class="table-container">
                        <h3 class="table-title">{{ $t('experienceTest.dataComparison.avgQoeComparisonData') }}</h3>
                        <el-table :data="mergedAvgQoeData" border stripe style="width: 100%" max-height="500">
                          <el-table-column prop="timeStamp" :label="$t('experienceTest.dataComparison.sequenceNumber')" width="180" />
                          <el-table-column :label="$t('experienceTest.dataComparison.clientAvgQoe')" width="180">
                            <template #default="scope">
                              {{ formatValue(scope.row.clientAvgQoe) }}
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('experienceTest.dataComparison.networkAvgQoe')" width="220">
                            <template #default="scope">
                              {{ formatValue(scope.row.networkAvgQoe) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                    <el-empty v-else :description="$t('common.noData')" />
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
import { ref, reactive, onMounted, nextTick, watch, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { DataAnalysis, Refresh, Search, RefreshLeft, Download } from '@element-plus/icons-vue'
import { getClientDataPage, getSpeedComparison, updateNetworkStartTime, getRttComparison, getStutterComparison, getAvgQoeComparison } from '@/api/test-settings'
import * as echarts from 'echarts'

export default {
  name: 'DataComparison',
  components: {
    DataAnalysis,
    Refresh,
    Search,
    RefreshLeft,
    Download,
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
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
    const selectedNetworkStartTime = ref('')
    const selectedClientStartSequence = ref(null)
    const savingNetworkStartTime = ref(false)
    const networkStartTimeOptions = ref([])
    const clientStartSequenceOptions = ref([])
    
    // RTT对比相关
    const rttComparisonLoading = ref(false)
    const rttComparisonData = ref(null)
    const rttChartRef = ref(null)
    let rttChart = null
    const selectedNetworkStartTimeRtt = ref('')
    const selectedClientStartSequenceRtt = ref(null)
    const networkStartTimeOptionsRtt = ref([])
    const clientStartSequenceOptionsRtt = ref([])
    
    // 卡顿对比相关
    const stutterComparisonLoading = ref(false)
    const stutterComparisonData = ref(null)
    const stutterChartRef = ref(null)
    let stutterChart = null
    const selectedNetworkStartTimeStutter = ref('')
    const selectedClientStartSequenceStutter = ref(null)
    const networkStartTimeOptionsStutter = ref([])
    const clientStartSequenceOptionsStutter = ref([])
    
    // 平均QOE对比相关
    const avgQoeComparisonLoading = ref(false)
    const avgQoeComparisonData = ref(null)
    const avgQoeChartRef = ref(null)
    let avgQoeChart = null
    const selectedNetworkStartTimeAvgQoe = ref('')
    const selectedClientStartSequenceAvgQoe = ref(null)
    const networkStartTimeOptionsAvgQoe = ref([])
    const clientStartSequenceOptionsAvgQoe = ref([])

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const searchForm = reactive({
      taskId: '',
      nation: '',
      operator: '',
      prb: '',
      rsrp: '',
      userCategory: '',
      service: '',
      app: '',
    })

    const exporting = ref(false)

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }

        // 添加搜索条件
        if (searchForm.taskId) {
          params.taskId = searchForm.taskId
        }
        if (searchForm.nation) {
          params.nation = searchForm.nation
        }
        if (searchForm.operator) {
          params.operator = searchForm.operator
        }
        if (searchForm.prb) {
          params.prb = searchForm.prb
        }
        if (searchForm.rsrp) {
          params.rsrp = searchForm.rsrp
        }
        if (searchForm.userCategory) {
          params.userCategory = searchForm.userCategory
        }
        if (searchForm.service) {
          params.service = searchForm.service
        }
        if (searchForm.app) {
          params.app = searchForm.app
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

    const handleSearch = () => {
      pagination.current = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.taskId = ''
      searchForm.nation = ''
      searchForm.operator = ''
      searchForm.prb = ''
      searchForm.rsrp = ''
      searchForm.userCategory = ''
      searchForm.service = ''
      searchForm.app = ''
      pagination.current = 1
      loadData()
    }

    // 导出所有图表为zip文件（从详情页面）
    const handleExportCharts = async () => {
      if (!currentTaskId.value) {
        ElMessage.warning('请先选择要导出的任务')
        return
      }

      exporting.value = true
      try {
        await exportChartsForTask(currentTaskId.value)
      } finally {
        exporting.value = false
      }
    }

    // 从列表直接导出图表
    const handleExportFromList = async (row) => {
      if (!row || !row.taskId) {
        ElMessage.warning('无效的数据')
        return
      }

      exporting.value = true
      try {
        await exportChartsForTask(row.taskId)
      } finally {
        exporting.value = false
      }
    }

    // 导出指定任务的对比图表
    const exportChartsForTask = async (taskId) => {
      try {
        // 动态导入jszip库
        let JSZip
        try {
          JSZip = (await import('jszip')).default
        } catch (importError) {
          ElMessage.error('请先安装jszip库: npm install jszip')
          return
        }

        ElMessage.info('正在加载对比数据...')

        // 并行加载所有对比数据
        const [speedRes, rttRes, stutterRes, avgQoeRes] = await Promise.all([
          getSpeedComparison(taskId).catch(e => ({ code: 500, message: e.message })),
          getRttComparison(taskId).catch(e => ({ code: 500, message: e.message })),
          getStutterComparison(taskId).catch(e => ({ code: 500, message: e.message })),
          getAvgQoeComparison(taskId).catch(e => ({ code: 500, message: e.message })),
        ])

        // 创建临时隐藏容器
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        tempContainer.style.width = '800px'
        tempContainer.style.height = '600px'
        document.body.appendChild(tempContainer)

        const zip = new JSZip()
        let hasAnyChart = false
        let speedTableAoa = null
        let rttTableAoa = null
        let stutterTableAoa = null
        let avgQoeTableAoa = null

        try {
          // 导出速率对比图表
          if (speedRes.code === 200 && speedRes.data) {
            const tempDiv = document.createElement('div')
            tempDiv.style.width = '800px'
            tempDiv.style.height = '600px'
            tempContainer.appendChild(tempDiv)
            
            const tempChart = echarts.init(tempDiv)
            const speedData = speedRes.data
            
            // 准备数据
            const clientData = speedData.clientSpeedList || []
            const networkData = speedData.networkSpeedList || []
            const allTimeStamps = new Set()
            
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            
            const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
              return compareTimeStamps(a, b)
            })
            
            const clientMap = new Map()
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                let speed = 0
                if (typeof item.speed === 'number') {
                  speed = item.speed
                } else if (typeof item.speed === 'string') {
                  speed = parseFloat(item.speed) || 0
                }
                clientMap.set(timeStamp, speed)
              }
            })
            
            const networkUplinkMap = new Map()
            const networkDownlinkMap = new Map()
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                let uplinkSpeed = 0
                if (typeof item.uplinkBandwidth === 'number') {
                  uplinkSpeed = item.uplinkBandwidth
                } else if (typeof item.uplinkBandwidth === 'string') {
                  uplinkSpeed = parseFloat(item.uplinkBandwidth) || 0
                }
                networkUplinkMap.set(timeStamp, uplinkSpeed)
                
                let downlinkSpeed = 0
                if (typeof item.downlinkBandwidth === 'number') {
                  downlinkSpeed = item.downlinkBandwidth
                } else if (typeof item.downlinkBandwidth === 'string') {
                  downlinkSpeed = parseFloat(item.downlinkBandwidth) || 0
                }
                networkDownlinkMap.set(timeStamp, downlinkSpeed)
              }
            })
            
            const clientSpeeds = sortedTimeStamps.map((timeStamp) => {
              return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
            })
            const networkUplinkSpeeds = sortedTimeStamps.map((timeStamp) => {
              return networkUplinkMap.has(timeStamp) ? networkUplinkMap.get(timeStamp) : null
            })
            const networkDownlinkSpeeds = sortedTimeStamps.map((timeStamp) => {
              return networkDownlinkMap.has(timeStamp) ? networkDownlinkMap.get(timeStamp) : null
            })
            
            const speedOption = {
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
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sortedTimeStamps,
              },
              yAxis: {
                type: 'value',
                name: 'Kbps',
              },
              series: [
                {
                  name: t('experienceTest.dataComparison.clientSpeed'),
                  type: 'line',
                  data: clientSpeeds,
                  smooth: true,
                },
                {
                  name: t('experienceTest.dataComparison.networkUplinkSpeed'),
                  type: 'line',
                  data: networkUplinkSpeeds,
                  smooth: true,
                },
                {
                  name: t('experienceTest.dataComparison.networkDownlinkSpeed'),
                  type: 'line',
                  data: networkDownlinkSpeeds,
                  smooth: true,
                },
              ],
            }
            
            tempChart.setOption(speedOption)
            await new Promise(resolve => setTimeout(resolve, 500)) // 等待图表渲染
            
            const speedImage = tempChart.getDataURL({
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#fff',
            })
            if (speedImage) {
              zip.file(`speed-comparison-${taskId}.png`, speedImage.split(',')[1], { base64: true })
              hasAnyChart = true
            }
            // 表格导出按索引对齐端侧与网络侧，确保网络侧数据能导出（端侧用序号、网络侧用时间戳时 timeStamp 无法匹配）
            const maxLen = Math.max(clientData.length, networkData.length)
            const speedRows = []
            for (let i = 0; i < maxLen; i++) {
              const clientItem = clientData[i]
              const networkItem = networkData[i]
              const ts = (clientItem && (clientItem.timeStamp || clientItem.sequenceNumber)) || (networkItem && networkItem.timeStamp) || String(i + 1)
              const cs = clientItem != null ? (typeof clientItem.speed === 'number' ? clientItem.speed : parseFloat(clientItem.speed) || '') : ''
              const nu = networkItem != null ? (typeof networkItem.uplinkBandwidth === 'number' ? networkItem.uplinkBandwidth : parseFloat(networkItem.uplinkBandwidth) || '') : ''
              const nd = networkItem != null ? (typeof networkItem.downlinkBandwidth === 'number' ? networkItem.downlinkBandwidth : parseFloat(networkItem.downlinkBandwidth) || '') : ''
              speedRows.push([ts, cs, nu, nd])
            }
            speedTableAoa = [
              [t('experienceTest.dataComparison.sequenceNumber'), t('experienceTest.dataComparison.clientSpeedKbps'), t('experienceTest.dataComparison.networkUplinkBandwidthKbps'), t('experienceTest.dataComparison.networkDownlinkBandwidthKbps')],
              ...speedRows,
            ]
            console.log('[导出表格] 速率对比-网络侧数据', networkData)
            tempChart.dispose()
            tempContainer.removeChild(tempDiv)
          }

          // 导出RTT对比图表
          if (rttRes.code === 200 && rttRes.data) {
            const tempDiv = document.createElement('div')
            tempDiv.style.width = '800px'
            tempDiv.style.height = '600px'
            tempContainer.appendChild(tempDiv)
            
            const tempChart = echarts.init(tempDiv)
            const rttData = rttRes.data
            
            const clientData = rttData.clientRttList || []
            const networkData = rttData.networkRttList || []
            const allTimeStamps = new Set()
            
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            
            const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
              return compareTimeStamps(a, b)
            })
            
            const clientMap = new Map()
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                let rtt = 0
                if (typeof item.rtt === 'number') {
                  rtt = item.rtt
                } else if (typeof item.rtt === 'string') {
                  rtt = parseFloat(item.rtt) || 0
                }
                clientMap.set(timeStamp, rtt)
              }
            })
            
            const networkMap = new Map()
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                let delay = 0
                if (typeof item.serviceDelay === 'number') {
                  delay = item.serviceDelay
                } else if (typeof item.serviceDelay === 'string') {
                  delay = parseFloat(item.serviceDelay) || 0
                }
                networkMap.set(timeStamp, delay)
              }
            })
            
            const clientRtts = sortedTimeStamps.map((timeStamp) => {
              return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
            })
            const networkDelays = sortedTimeStamps.map((timeStamp) => {
              return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
            })
            
            const rttOption = {
              title: {
                text: t('experienceTest.dataComparison.rttComparison'),
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
                  t('experienceTest.dataComparison.clientRtt'),
                  t('experienceTest.dataComparison.networkServiceDelay'),
                ],
                top: 30,
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sortedTimeStamps,
              },
              yAxis: {
                type: 'value',
                name: 'ms',
              },
              series: [
                {
                  name: t('experienceTest.dataComparison.clientRtt'),
                  type: 'line',
                  data: clientRtts,
                  smooth: true,
                },
                {
                  name: t('experienceTest.dataComparison.networkServiceDelay'),
                  type: 'line',
                  data: networkDelays,
                  smooth: true,
                },
              ],
            }
            
            tempChart.setOption(rttOption)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const rttImage = tempChart.getDataURL({
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#fff',
            })
            if (rttImage) {
              zip.file(`rtt-comparison-${taskId}.png`, rttImage.split(',')[1], { base64: true })
              hasAnyChart = true
            }
            const rttClientData = rttData.clientRttList || []
            const rttNetworkData = rttData.networkRttList || []
            const rttMaxLen = Math.max(rttClientData.length, rttNetworkData.length)
            const rttRows = []
            for (let i = 0; i < rttMaxLen; i++) {
              const c = rttClientData[i]
              const n = rttNetworkData[i]
              const ts = (c && (c.timeStamp || c.sequenceNumber)) || (n && n.timeStamp) || String(i + 1)
              const cr = c != null ? (typeof c.rtt === 'number' ? c.rtt : parseFloat(c.rtt) || '') : ''
              const nd = n != null ? (typeof n.serviceDelay === 'number' ? n.serviceDelay : parseFloat(n.serviceDelay) || '') : ''
              rttRows.push([ts, cr, nd])
            }
            rttTableAoa = [
              [t('experienceTest.dataComparison.sequenceNumber'), t('experienceTest.dataComparison.clientRtt'), t('experienceTest.dataComparison.networkServiceDelay')],
              ...rttRows,
            ]
            console.log('[导出表格] RTT对比-网络侧数据', rttNetworkData)
            tempChart.dispose()
            tempContainer.removeChild(tempDiv)
          }

          // 导出卡顿对比图表
          if (stutterRes.code === 200 && stutterRes.data) {
            const tempDiv = document.createElement('div')
            tempDiv.style.width = '800px'
            tempDiv.style.height = '600px'
            tempContainer.appendChild(tempDiv)
            
            const tempChart = echarts.init(tempDiv)
            const stutterData = stutterRes.data
            
            const clientData = stutterData.clientStutterList || []
            const networkData = stutterData.networkStutterList || []
            const allTimeStamps = new Set()
            
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            
            const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
              return compareTimeStamps(a, b)
            })
            
            const clientMap = new Map()
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                let ratio = 0
                if (typeof item.stutterRatio === 'number') {
                  ratio = item.stutterRatio
                } else if (typeof item.stutterRatio === 'string') {
                  ratio = parseFloat(item.stutterRatio) || 0
                }
                clientMap.set(timeStamp, ratio)
              }
            })
            
            const networkMap = new Map()
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                let number = 0
                if (typeof item.stallingNumber === 'number') {
                  number = item.stallingNumber / 10
                } else if (typeof item.stallingNumber === 'string') {
                  number = (parseFloat(item.stallingNumber) || 0) / 10
                }
                networkMap.set(timeStamp, number)
              }
            })
            
            const clientRatios = sortedTimeStamps.map((timeStamp) => {
              return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
            })
            const networkNumbers = sortedTimeStamps.map((timeStamp) => {
              return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
            })
            
            const stutterOption = {
              title: {
                text: t('experienceTest.dataComparison.stutterComparison'),
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
                  t('experienceTest.dataComparison.clientStutterRatio'),
                  t('experienceTest.dataComparison.networkStallingNumberDiv10'),
                ],
                top: 30,
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sortedTimeStamps,
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  name: t('experienceTest.dataComparison.clientStutterRatio'),
                  type: 'line',
                  data: clientRatios,
                  smooth: true,
                },
                {
                  name: t('experienceTest.dataComparison.networkStallingNumberDiv10'),
                  type: 'line',
                  data: networkNumbers,
                  smooth: true,
                },
              ],
            }
            
            tempChart.setOption(stutterOption)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const stutterImage = tempChart.getDataURL({
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#fff',
            })
            if (stutterImage) {
              zip.file(`stutter-comparison-${taskId}.png`, stutterImage.split(',')[1], { base64: true })
              hasAnyChart = true
            }
            const stutterClientData = stutterData.clientStutterList || []
            const stutterNetworkData = stutterData.networkStutterList || []
            const stutterMaxLen = Math.max(stutterClientData.length, stutterNetworkData.length)
            const stutterRows = []
            for (let i = 0; i < stutterMaxLen; i++) {
              const c = stutterClientData[i]
              const n = stutterNetworkData[i]
              const ts = (c && (c.timeStamp || c.sequenceNumber)) || (n && n.timeStamp) || String(i + 1)
              const cr = c != null ? (typeof c.stutterRatio === 'number' ? c.stutterRatio : parseFloat(c.stutterRatio) || '') : ''
              const nn = n != null ? (typeof n.stallingNumberDiv10 === 'number' ? n.stallingNumberDiv10 : (parseFloat(n.stallingNumberDiv10) || (typeof n.stallingNumber === 'number' ? n.stallingNumber / 10 : (parseFloat(n.stallingNumber) || 0) / 10) || '')) : ''
              stutterRows.push([ts, cr, nn])
            }
            stutterTableAoa = [
              [t('experienceTest.dataComparison.sequenceNumber'), t('experienceTest.dataComparison.clientStutterRatio'), t('experienceTest.dataComparison.networkStallingNumberDiv10')],
              ...stutterRows,
            ]
            console.log('[导出表格] 卡顿对比-网络侧数据', stutterNetworkData)
            tempChart.dispose()
            tempContainer.removeChild(tempDiv)
          }

          // 导出平均QOE对比图表
          if (avgQoeRes.code === 200 && avgQoeRes.data) {
            const tempDiv = document.createElement('div')
            tempDiv.style.width = '800px'
            tempDiv.style.height = '600px'
            tempContainer.appendChild(tempDiv)
            
            const tempChart = echarts.init(tempDiv)
            const avgQoeData = avgQoeRes.data
            
            const clientData = avgQoeData.clientAvgQoeList || []
            const networkData = avgQoeData.networkAvgQoeList || []
            const allTimeStamps = new Set()
            
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                allTimeStamps.add(timeStamp)
              }
            })
            
            const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
              return compareTimeStamps(a, b)
            })
            
            const clientMap = new Map()
            clientData.forEach((item) => {
              const timeStamp = item.timeStamp || item.sequenceNumber
              if (timeStamp) {
                let avgQoe = 0
                if (typeof item.avgQoe === 'number') {
                  avgQoe = item.avgQoe
                } else if (typeof item.avgQoe === 'string') {
                  avgQoe = parseFloat(item.avgQoe) || 0
                }
                clientMap.set(timeStamp, avgQoe)
              }
            })
            
            const networkMap = new Map()
            networkData.forEach((item) => {
              const timeStamp = item.timeStamp || ''
              if (timeStamp) {
                let avgQoe = 0
                if (typeof item.avgQoe === 'number') {
                  avgQoe = item.avgQoe
                } else if (typeof item.avgQoe === 'string') {
                  avgQoe = parseFloat(item.avgQoe) || 0
                }
                networkMap.set(timeStamp, avgQoe)
              }
            })
            
            const clientAvgQoes = sortedTimeStamps.map((timeStamp) => {
              return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
            })
            const networkAvgQoes = sortedTimeStamps.map((timeStamp) => {
              return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
            })
            
            const avgQoeOption = {
              title: {
                text: t('experienceTest.dataComparison.avgQoeComparison'),
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
                  t('experienceTest.dataComparison.clientAvgQoe'),
                  t('experienceTest.dataComparison.networkAvgQoe'),
                ],
                top: 30,
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sortedTimeStamps,
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  name: t('experienceTest.dataComparison.clientAvgQoe'),
                  type: 'line',
                  data: clientAvgQoes,
                  smooth: true,
                },
                {
                  name: t('experienceTest.dataComparison.networkAvgQoe'),
                  type: 'line',
                  data: networkAvgQoes,
                  smooth: true,
                },
              ],
            }
            
            tempChart.setOption(avgQoeOption)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const avgQoeImage = tempChart.getDataURL({
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#fff',
            })
            if (avgQoeImage) {
              zip.file(`avg-qoe-comparison-${taskId}.png`, avgQoeImage.split(',')[1], { base64: true })
              hasAnyChart = true
            }
            const avgQoeClientData = avgQoeData.clientAvgQoeList || []
            const avgQoeNetworkData = avgQoeData.networkAvgQoeList || []
            const avgQoeMaxLen = Math.max(avgQoeClientData.length, avgQoeNetworkData.length)
            const avgQoeRows = []
            for (let i = 0; i < avgQoeMaxLen; i++) {
              const c = avgQoeClientData[i]
              const n = avgQoeNetworkData[i]
              const ts = (c && (c.timeStamp || c.sequenceNumber)) || (n && n.timeStamp) || String(i + 1)
              const cq = c != null ? (typeof c.avgQoe === 'number' ? c.avgQoe : parseFloat(c.avgQoe) || '') : ''
              const nq = n != null ? (typeof n.avgQoe === 'number' ? n.avgQoe : parseFloat(n.avgQoe) || '') : ''
              avgQoeRows.push([ts, cq, nq])
            }
            avgQoeTableAoa = [
              [t('experienceTest.dataComparison.sequenceNumber'), t('experienceTest.dataComparison.clientAvgQoe'), t('experienceTest.dataComparison.networkAvgQoe')],
              ...avgQoeRows,
            ]
            console.log('[导出表格] 平均QOE对比-网络侧数据', avgQoeNetworkData)
            tempChart.dispose()
            tempContainer.removeChild(tempDiv)
          }
        } finally {
          // 清理临时容器
          document.body.removeChild(tempContainer)
        }

        // 将表格数据导出为 Excel 并加入 zip
        const hasAnyTable = speedTableAoa || rttTableAoa || stutterTableAoa || avgQoeTableAoa
        if (hasAnyTable) {
          try {
            const xlsxModule = await import('xlsx')
            const lib = xlsxModule.default || xlsxModule
            const utils = lib && lib.utils
            const write = lib && lib.write
            if (!utils || !write) {
              throw new Error('xlsx 库未正确加载')
            }
            const wb = utils.book_new()
            if (speedTableAoa) {
              const ws = utils.aoa_to_sheet(speedTableAoa)
              utils.book_append_sheet(wb, ws, t('experienceTest.dataComparison.speedComparison'))
            }
            if (rttTableAoa) {
              const ws = utils.aoa_to_sheet(rttTableAoa)
              utils.book_append_sheet(wb, ws, t('experienceTest.dataComparison.rttComparison'))
            }
            if (stutterTableAoa) {
              const ws = utils.aoa_to_sheet(stutterTableAoa)
              utils.book_append_sheet(wb, ws, t('experienceTest.dataComparison.stutterComparison'))
            }
            if (avgQoeTableAoa) {
              const ws = utils.aoa_to_sheet(avgQoeTableAoa)
              utils.book_append_sheet(wb, ws, t('experienceTest.dataComparison.avgQoeComparison'))
            }
            const excelBuffer = write(wb, { type: 'array', bookType: 'xlsx' })
            zip.file(`comparison-data-${taskId}.xlsx`, excelBuffer, { binary: true })
          } catch (excelError) {
            console.error('Export Excel error:', excelError)
            ElMessage.warning('表格数据导出为 Excel 失败，仅导出图表')
          }
        }

        const hasAnyData = hasAnyChart || hasAnyTable
        if (!hasAnyData) {
          ElMessage.warning('没有可导出的图表或表格数据')
          return
        }

        // 生成zip文件并下载
        const content = await zip.generateAsync({ type: 'blob' })
        const url = window.URL.createObjectURL(content)
        const link = document.createElement('a')
        link.href = url
        link.download = `comparison-charts-${taskId}-${Date.now()}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        ElMessage.success(t('experienceTest.dataComparison.exportSuccess'))
      } catch (error) {
        console.error('Export charts error:', error)
        ElMessage.error(t('experienceTest.dataComparison.exportFailed') + ': ' + (error.message || '未知错误'))
      }
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
        rttComparisonData.value = null
        stutterComparisonData.value = null
        avgQoeComparisonData.value = null
        
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
          
          // 设置当前保存的网络侧开始时间和端侧开始序号
          if (response.data.networkStartTime) {
            selectedNetworkStartTime.value = response.data.networkStartTime
          } else {
            selectedNetworkStartTime.value = ''
          }
          if (response.data.clientStartSequence != null) {
            selectedClientStartSequence.value = response.data.clientStartSequence
          } else {
            selectedClientStartSequence.value = null
          }
          
          // 初始化网络侧开始时间选项和端侧开始序号选项
          initNetworkStartTimeOptions()
          initClientStartSequenceOptions()
          
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

    // 初始化网络侧开始时间选项
    const initNetworkStartTimeOptions = () => {
      if (!speedComparisonData.value || !speedComparisonData.value.networkSpeedList) {
        networkStartTimeOptions.value = []
        return
      }
      
      // 从网络侧数据中提取所有唯一的start_time作为选项
      const timeSet = new Set()
      speedComparisonData.value.networkSpeedList.forEach((item) => {
        if (item.startTime) {
          timeSet.add(item.startTime)
        }
      })
      
      // 转换为选项数组并排序
      networkStartTimeOptions.value = Array.from(timeSet)
        .sort()
        .map((time) => ({
          label: time,
          value: time,
        }))
    }

    // 初始化端侧开始序号选项
    const initClientStartSequenceOptions = () => {
      if (!speedComparisonData.value || !speedComparisonData.value.clientSpeedList) {
        clientStartSequenceOptions.value = []
        return
      }
      
      // 从端侧数据中提取所有唯一的sequenceNumber作为选项
      const sequenceSet = new Set()
      speedComparisonData.value.clientSpeedList.forEach((item) => {
        if (item.sequenceNumber) {
          const seqNum = parseInt(item.sequenceNumber)
          if (!isNaN(seqNum)) {
            sequenceSet.add(seqNum)
          }
        }
      })
      
      // 转换为选项数组并排序
      clientStartSequenceOptions.value = Array.from(sequenceSet)
        .sort((a, b) => a - b)
        .map((seq) => ({
          label: seq.toString(),
          value: seq,
        }))
    }

    // 保存网络侧开始时间和端侧开始序号
    const handleSaveNetworkStartTime = async () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(
          currentTaskId.value,
          selectedNetworkStartTime.value,
          selectedClientStartSequence.value,
        )
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          // 重新加载数据
          await loadSpeedComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Save network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 重置网络侧开始时间和端侧开始序号
    const handleResetNetworkStartTime = async () => {
      if (!currentTaskId.value) {
        return
      }
      
      selectedNetworkStartTime.value = ''
      selectedClientStartSequence.value = null
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(currentTaskId.value, '', null)
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          // 重新加载数据
          await loadSpeedComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Reset network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
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

    // 通用格式化方法
    const formatValue = (value) => {
      if (value === null || value === undefined) {
        return '-'
      }
      if (typeof value === 'number') {
        return value.toFixed(2)
      }
      if (typeof value === 'string') {
        const num = parseFloat(value)
        if (isNaN(num)) {
          return '-'
        }
        return num.toFixed(2)
      }
      return '-'
    }

    // 比较时间戳（序列号），按数字大小排序
    const compareTimeStamps = (a, b) => {
      if (!a && !b) {
        return 0
      }
      if (!a) {
        return 1
      }
      if (!b) {
        return -1
      }

      // 尝试转换为数字进行比较
      const numA = parseFloat(a)
      const numB = parseFloat(b)

      // 如果都是有效数字，按数字大小排序
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }

      // 如果只有一个有效数字，数字排在前面
      if (!isNaN(numA) && isNaN(numB)) {
        return -1
      }
      if (isNaN(numA) && !isNaN(numB)) {
        return 1
      }

      // 如果都不是数字，按字符串比较
      return String(a).localeCompare(String(b))
    }

    // 合并端侧和网络侧速率数据到同一张表
    const mergedSpeedData = computed(() => {
      if (!speedComparisonData.value) {
        return []
      }

      const clientList = speedComparisonData.value.clientSpeedList || []
      const networkList = speedComparisonData.value.networkSpeedList || []
      const merged = []

      // 创建时间戳到数据的映射
      const clientMap = new Map()
      const networkMap = new Map()

      // 处理端侧数据
      clientList.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        clientMap.set(timeStamp, item)
      })

      // 处理网络侧数据
      networkList.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        networkMap.set(timeStamp, item)
      })

      // 获取所有唯一的时间戳
      const allTimeStamps = new Set()
      clientMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })
      networkMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })

      // 按时间戳（序列号）排序，使用数字排序
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })

      // 合并数据
      sortedTimeStamps.forEach((timeStamp) => {
        const clientData = clientMap.get(timeStamp)
        const networkData = networkMap.get(timeStamp)

        const mergedItem = {
          timeStamp: timeStamp,
          clientSpeed: clientData ? clientData.speed : null,
          networkUplinkSpeed: networkData ? networkData.uplinkBandwidth : null,
          networkDownlinkSpeed: networkData ? networkData.downlinkBandwidth : null,
        }

        merged.push(mergedItem)
      })

      // 如果时间戳无法匹配，则分别添加所有数据
      if (merged.length === 0) {
        // 添加所有端侧数据
        clientList.forEach((item) => {
          merged.push({
            timeStamp: item.timeStamp || item.sequenceNumber || '-',
            clientSpeed: item.speed,
            networkUplinkSpeed: null,
            networkDownlinkSpeed: null,
          })
        })

        // 添加所有网络侧数据（如果时间戳不重复）
        networkList.forEach((item) => {
          const timeStamp = item.timeStamp || '-'
          // 检查是否已存在该时间戳
          const exists = merged.some((m) => m.timeStamp === timeStamp)
          if (!exists) {
            merged.push({
              timeStamp: timeStamp,
              clientSpeed: null,
              networkUplinkSpeed: item.uplinkBandwidth,
              networkDownlinkSpeed: item.downlinkBandwidth,
            })
          } else {
            // 如果已存在，更新网络侧数据
            const existingItem = merged.find((m) => m.timeStamp === timeStamp)
            if (existingItem) {
              existingItem.networkUplinkSpeed = item.uplinkBandwidth
              existingItem.networkDownlinkSpeed = item.downlinkBandwidth
            }
          }
        })
      }

      // 根据timeStamp字段排序
      merged.sort((a, b) => {
        return compareTimeStamps(a.timeStamp, b.timeStamp)
      })

      return merged
    })

    // 合并RTT对比数据
    const mergedRttData = computed(() => {
      if (!rttComparisonData.value) {
        return []
      }

      const clientList = rttComparisonData.value.clientRttList || []
      const networkList = rttComparisonData.value.networkRttList || []
      const merged = []

      // 创建时间戳到数据的映射
      const clientMap = new Map()
      const networkMap = new Map()

      // 处理端侧数据
      clientList.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          clientMap.set(timeStamp, item)
        }
      })

      // 处理网络侧数据
      networkList.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          networkMap.set(timeStamp, item)
        }
      })

      // 获取所有唯一的时间戳
      const allTimeStamps = new Set()
      clientMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })
      networkMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })

      // 按时间戳（序列号）排序，使用数字排序
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })

      // 合并数据
      sortedTimeStamps.forEach((timeStamp) => {
        const clientData = clientMap.get(timeStamp)
        const networkData = networkMap.get(timeStamp)

        const mergedItem = {
          timeStamp: timeStamp,
          clientRtt: clientData ? clientData.rtt : null,
          networkServiceDelay: networkData ? networkData.serviceDelay : null,
        }

        merged.push(mergedItem)
      })

      // 如果时间戳无法匹配，则分别添加所有数据
      if (merged.length === 0) {
        // 添加所有端侧数据
        clientList.forEach((item) => {
          merged.push({
            timeStamp: item.timeStamp || item.sequenceNumber || '-',
            clientRtt: item.rtt,
            networkServiceDelay: null,
          })
        })

        // 添加所有网络侧数据（如果时间戳不重复）
        networkList.forEach((item) => {
          const timeStamp = item.timeStamp || '-'
          // 检查是否已存在该时间戳
          const exists = merged.some((m) => m.timeStamp === timeStamp)
          if (!exists) {
            merged.push({
              timeStamp: timeStamp,
              clientRtt: null,
              networkServiceDelay: item.serviceDelay,
            })
          } else {
            // 如果已存在，更新网络侧数据
            const existingItem = merged.find((m) => m.timeStamp === timeStamp)
            if (existingItem) {
              existingItem.networkServiceDelay = item.serviceDelay
            }
          }
        })
      }

      // 根据timeStamp字段排序
      merged.sort((a, b) => {
        return compareTimeStamps(a.timeStamp, b.timeStamp)
      })

      return merged
    })

    // 合并卡顿对比数据
    const mergedStutterData = computed(() => {
      if (!stutterComparisonData.value) {
        return []
      }

      const clientList = stutterComparisonData.value.clientStutterList || []
      const networkList = stutterComparisonData.value.networkStutterList || []
      const merged = []

      // 创建时间戳到数据的映射
      const clientMap = new Map()
      const networkMap = new Map()

      // 处理端侧数据
      clientList.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          clientMap.set(timeStamp, item)
        }
      })

      // 处理网络侧数据
      networkList.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          networkMap.set(timeStamp, item)
        }
      })

      // 获取所有唯一的时间戳
      const allTimeStamps = new Set()
      clientMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })
      networkMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })

      // 按时间戳（序列号）排序，使用数字排序
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })

      // 合并数据
      sortedTimeStamps.forEach((timeStamp) => {
        const clientData = clientMap.get(timeStamp)
        const networkData = networkMap.get(timeStamp)

        const mergedItem = {
          timeStamp: timeStamp,
          clientStutterRatio: clientData ? clientData.stutterRatio : null,
          networkStallingNumberDiv10: networkData ? networkData.stallingNumberDiv10 : null,
        }

        merged.push(mergedItem)
      })

      // 如果时间戳无法匹配，则分别添加所有数据
      if (merged.length === 0) {
        // 添加所有端侧数据
        clientList.forEach((item) => {
          merged.push({
            timeStamp: item.timeStamp || item.sequenceNumber || '-',
            clientStutterRatio: item.stutterRatio,
            networkStallingNumberDiv10: null,
          })
        })

        // 添加所有网络侧数据（如果时间戳不重复）
        networkList.forEach((item) => {
          const timeStamp = item.timeStamp || '-'
          // 检查是否已存在该时间戳
          const exists = merged.some((m) => m.timeStamp === timeStamp)
          if (!exists) {
            merged.push({
              timeStamp: timeStamp,
              clientStutterRatio: null,
              networkStallingNumberDiv10: item.stallingNumberDiv10,
            })
          } else {
            // 如果已存在，更新网络侧数据
            const existingItem = merged.find((m) => m.timeStamp === timeStamp)
            if (existingItem) {
              existingItem.networkStallingNumberDiv10 = item.stallingNumberDiv10
            }
          }
        })
      }

      // 根据timeStamp字段排序
      merged.sort((a, b) => {
        return compareTimeStamps(a.timeStamp, b.timeStamp)
      })

      return merged
    })

    // 合并平均QOE对比数据
    const mergedAvgQoeData = computed(() => {
      if (!avgQoeComparisonData.value) {
        return []
      }

      const clientList = avgQoeComparisonData.value.clientAvgQoeList || []
      const networkList = avgQoeComparisonData.value.networkAvgQoeList || []
      const merged = []

      // 创建时间戳到数据的映射
      const clientMap = new Map()
      const networkMap = new Map()

      // 处理端侧数据
      clientList.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          clientMap.set(timeStamp, item)
        }
      })

      // 处理网络侧数据
      networkList.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          networkMap.set(timeStamp, item)
        }
      })

      // 获取所有唯一的时间戳
      const allTimeStamps = new Set()
      clientMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })
      networkMap.forEach((_, timeStamp) => {
        allTimeStamps.add(timeStamp)
      })

      // 按时间戳（序列号）排序，使用数字排序
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })

      // 合并数据
      sortedTimeStamps.forEach((timeStamp) => {
        const clientData = clientMap.get(timeStamp)
        const networkData = networkMap.get(timeStamp)

        const mergedItem = {
          timeStamp: timeStamp,
          clientAvgQoe: clientData ? clientData.avgQoe : null,
          networkAvgQoe: networkData ? networkData.avgQoe : null,
        }

        merged.push(mergedItem)
      })

      // 如果时间戳无法匹配，则分别添加所有数据
      if (merged.length === 0) {
        // 添加所有端侧数据
        clientList.forEach((item) => {
          merged.push({
            timeStamp: item.timeStamp || item.sequenceNumber || '-',
            clientAvgQoe: item.avgQoe,
            networkAvgQoe: null,
          })
        })

        // 添加所有网络侧数据（如果时间戳不重复）
        networkList.forEach((item) => {
          const timeStamp = item.timeStamp || '-'
          // 检查是否已存在该时间戳
          const exists = merged.some((m) => m.timeStamp === timeStamp)
          if (!exists) {
            merged.push({
              timeStamp: timeStamp,
              clientAvgQoe: null,
              networkAvgQoe: item.avgQoe,
            })
          } else {
            // 如果已存在，更新网络侧数据
            const existingItem = merged.find((m) => m.timeStamp === timeStamp)
            if (existingItem) {
              existingItem.networkAvgQoe = item.avgQoe
            }
          }
        })
      }

      // 根据timeStamp字段排序
      merged.sort((a, b) => {
        return compareTimeStamps(a.timeStamp, b.timeStamp)
      })

      return merged
    })

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
      
      // 合并所有时间戳并排序
      const allTimeStamps = new Set()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      
      // 按数字顺序排序时间戳
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })
      
      // 创建时间戳到数据的映射
      const clientMap = new Map()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber
        if (timeStamp) {
          let speed = 0
          if (typeof item.speed === 'number') {
            speed = item.speed
          } else if (typeof item.speed === 'string') {
            speed = parseFloat(item.speed) || 0
          }
          clientMap.set(timeStamp, speed)
        }
      })
      
      const networkUplinkMap = new Map()
      const networkDownlinkMap = new Map()
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          let uplinkSpeed = 0
          if (typeof item.uplinkBandwidth === 'number') {
            uplinkSpeed = item.uplinkBandwidth
          } else if (typeof item.uplinkBandwidth === 'string') {
            uplinkSpeed = parseFloat(item.uplinkBandwidth) || 0
          }
          networkUplinkMap.set(timeStamp, uplinkSpeed)
          
          let downlinkSpeed = 0
          if (typeof item.downlinkBandwidth === 'number') {
            downlinkSpeed = item.downlinkBandwidth
          } else if (typeof item.downlinkBandwidth === 'string') {
            downlinkSpeed = parseFloat(item.downlinkBandwidth) || 0
          }
          networkDownlinkMap.set(timeStamp, downlinkSpeed)
        }
      })
      
      // 按照排序后的时间戳顺序提取数据（确保0值也能正确显示）
      const clientSpeeds = sortedTimeStamps.map((timeStamp) => {
        return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
      })
      const networkUplinkSpeeds = sortedTimeStamps.map((timeStamp) => {
        return networkUplinkMap.has(timeStamp) ? networkUplinkMap.get(timeStamp) : null
      })
      const networkDownlinkSpeeds = sortedTimeStamps.map((timeStamp) => {
        return networkDownlinkMap.has(timeStamp) ? networkDownlinkMap.get(timeStamp) : null
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
            data: sortedTimeStamps,
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Kbps',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'solid',
              },
            },
          },
        ],
        series: [
          {
            name: t('experienceTest.dataComparison.clientSpeed'),
            type: 'line',
            data: clientSpeeds,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkUplinkSpeed'),
            type: 'line',
            data: networkUplinkSpeeds,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#67C23A',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkDownlinkSpeed'),
            type: 'line',
            data: networkDownlinkSpeeds,
            smooth: true,
            connectNulls: true,
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

    // 渲染RTT对比图表
    const renderRttChart = () => {
      if (!rttChartRef.value || !rttComparisonData.value) {
        return
      }
      
      // 销毁旧图表
      if (rttChart) {
        rttChart.dispose()
        rttChart = null
      }
      
      // 创建新图表
      rttChart = echarts.init(rttChartRef.value)
      
      // 准备数据
      const clientData = rttComparisonData.value.clientRttList || []
      const networkData = rttComparisonData.value.networkRttList || []
      
      // 合并所有时间戳并排序
      const allTimeStamps = new Set()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      
      // 按数字顺序排序时间戳
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })
      
      // 创建时间戳到数据的映射
      const clientMap = new Map()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          let rtt = 0
          if (typeof item.rtt === 'number') {
            rtt = item.rtt
          } else if (typeof item.rtt === 'string') {
            rtt = parseFloat(item.rtt) || 0
          }
          clientMap.set(timeStamp, rtt)
        }
      })
      
      const networkMap = new Map()
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          let serviceDelay = 0
          if (typeof item.serviceDelay === 'number') {
            serviceDelay = item.serviceDelay
          } else if (typeof item.serviceDelay === 'string') {
            serviceDelay = parseFloat(item.serviceDelay) || 0
          }
          networkMap.set(timeStamp, serviceDelay)
        }
      })
      
      // 按照排序后的时间戳顺序提取数据（确保0值也能正确显示）
      const clientRtts = sortedTimeStamps.map((timeStamp) => {
        return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
      })
      const networkServiceDelays = sortedTimeStamps.map((timeStamp) => {
        return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
      })
      
      // 配置图表选项
      const option = {
        title: {
          text: t('experienceTest.dataComparison.rttComparison'),
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
            t('experienceTest.dataComparison.clientRtt'),
            t('experienceTest.dataComparison.networkServiceDelay'),
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
            data: sortedTimeStamps,
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'ms',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'solid',
              },
            },
          },
        ],
        series: [
          {
            name: t('experienceTest.dataComparison.clientRtt'),
            type: 'line',
            data: clientRtts,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkServiceDelay'),
            type: 'line',
            data: networkServiceDelays,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#67C23A',
            },
          },
        ],
      }
      
      rttChart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        if (rttChart) {
          rttChart.resize()
        }
      })
    }

    // 渲染卡顿对比图表
    const renderStutterChart = () => {
      if (!stutterChartRef.value || !stutterComparisonData.value) {
        return
      }
      
      // 销毁旧图表
      if (stutterChart) {
        stutterChart.dispose()
        stutterChart = null
      }
      
      // 创建新图表
      stutterChart = echarts.init(stutterChartRef.value)
      
      // 准备数据
      const clientData = stutterComparisonData.value.clientStutterList || []
      const networkData = stutterComparisonData.value.networkStutterList || []
      
      // 合并所有时间戳并排序
      const allTimeStamps = new Set()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      
      // 按数字顺序排序时间戳
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })
      
      // 创建时间戳到数据的映射
      const clientMap = new Map()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          let stutterRatio = 0
          if (typeof item.stutterRatio === 'number') {
            stutterRatio = item.stutterRatio
          } else if (typeof item.stutterRatio === 'string') {
            stutterRatio = parseFloat(item.stutterRatio) || 0
          }
          clientMap.set(timeStamp, stutterRatio)
        }
      })
      
      const networkMap = new Map()
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          let stallingNumberDiv10 = 0
          if (typeof item.stallingNumberDiv10 === 'number') {
            stallingNumberDiv10 = item.stallingNumberDiv10
          } else if (typeof item.stallingNumberDiv10 === 'string') {
            stallingNumberDiv10 = parseFloat(item.stallingNumberDiv10) || 0
          }
          networkMap.set(timeStamp, stallingNumberDiv10)
        }
      })
      
      // 按照排序后的时间戳顺序提取数据（确保0值也能正确显示）
      const clientStutterRatios = sortedTimeStamps.map((timeStamp) => {
        return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
      })
      const networkStallingNumbers = sortedTimeStamps.map((timeStamp) => {
        return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
      })
      
      // 配置图表选项
      const option = {
        title: {
          text: t('experienceTest.dataComparison.stutterComparison'),
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
            t('experienceTest.dataComparison.clientStutterRatio'),
            t('experienceTest.dataComparison.networkStallingNumberDiv10'),
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
            data: sortedTimeStamps,
          },
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'solid',
              },
            },
          },
        ],
        series: [
          {
            name: t('experienceTest.dataComparison.clientStutterRatio'),
            type: 'line',
            data: clientStutterRatios,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkStallingNumberDiv10'),
            type: 'line',
            data: networkStallingNumbers,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#67C23A',
            },
          },
        ],
      }
      
      stutterChart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        if (stutterChart) {
          stutterChart.resize()
        }
      })
    }

    // 渲染平均QOE对比图表
    const renderAvgQoeChart = () => {
      if (!avgQoeChartRef.value || !avgQoeComparisonData.value) {
        return
      }
      
      // 销毁旧图表
      if (avgQoeChart) {
        avgQoeChart.dispose()
        avgQoeChart = null
      }
      
      // 创建新图表
      avgQoeChart = echarts.init(avgQoeChartRef.value)
      
      // 准备数据
      const clientData = avgQoeComparisonData.value.clientAvgQoeList || []
      const networkData = avgQoeComparisonData.value.networkAvgQoeList || []
      
      // 合并所有时间戳并排序
      const allTimeStamps = new Set()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          allTimeStamps.add(timeStamp)
        }
      })
      
      // 按数字顺序排序时间戳
      const sortedTimeStamps = Array.from(allTimeStamps).sort((a, b) => {
        return compareTimeStamps(a, b)
      })
      
      // 创建时间戳到数据的映射
      const clientMap = new Map()
      clientData.forEach((item) => {
        const timeStamp = item.timeStamp || item.sequenceNumber || ''
        if (timeStamp) {
          let avgQoe = 0
          if (typeof item.avgQoe === 'number') {
            avgQoe = item.avgQoe
          } else if (typeof item.avgQoe === 'string') {
            avgQoe = parseFloat(item.avgQoe) || 0
          }
          clientMap.set(timeStamp, avgQoe)
        }
      })
      
      const networkMap = new Map()
      networkData.forEach((item) => {
        const timeStamp = item.timeStamp || ''
        if (timeStamp) {
          let avgQoe = 0
          if (typeof item.avgQoe === 'number') {
            avgQoe = item.avgQoe
          } else if (typeof item.avgQoe === 'string') {
            avgQoe = parseFloat(item.avgQoe) || 0
          }
          networkMap.set(timeStamp, avgQoe)
        }
      })
      
      // 按照排序后的时间戳顺序提取数据（确保0值也能正确显示）
      const clientAvgQoes = sortedTimeStamps.map((timeStamp) => {
        return clientMap.has(timeStamp) ? clientMap.get(timeStamp) : null
      })
      const networkAvgQoes = sortedTimeStamps.map((timeStamp) => {
        return networkMap.has(timeStamp) ? networkMap.get(timeStamp) : null
      })
      
      // 配置图表选项
      const option = {
        title: {
          text: t('experienceTest.dataComparison.avgQoeComparison'),
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
            t('experienceTest.dataComparison.clientAvgQoe'),
            t('experienceTest.dataComparison.networkAvgQoe'),
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
            data: sortedTimeStamps,
          },
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'solid',
              },
            },
          },
        ],
        series: [
          {
            name: t('experienceTest.dataComparison.clientAvgQoe'),
            type: 'line',
            data: clientAvgQoes,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            name: t('experienceTest.dataComparison.networkAvgQoe'),
            type: 'line',
            data: networkAvgQoes,
            smooth: true,
            connectNulls: true,
            itemStyle: {
              color: '#67C23A',
            },
          },
        ],
      }
      
      avgQoeChart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        if (avgQoeChart) {
          avgQoeChart.resize()
        }
      })
    }

    // 加载RTT对比数据
    const loadRttComparisonData = async (taskId) => {
      if (!taskId) {
        return
      }
      
      rttComparisonLoading.value = true
      try {
        const response = await getRttComparison(taskId)
        if (response.code === 200 && response.data) {
          rttComparisonData.value = response.data
          
          // 设置当前保存的网络侧开始时间和端侧开始序号
          if (response.data.networkStartTime) {
            selectedNetworkStartTimeRtt.value = response.data.networkStartTime
          } else {
            selectedNetworkStartTimeRtt.value = ''
          }
          if (response.data.clientStartSequence != null) {
            selectedClientStartSequenceRtt.value = response.data.clientStartSequence
          } else {
            selectedClientStartSequenceRtt.value = null
          }
          
          // 初始化网络侧开始时间选项和端侧开始序号选项
          initNetworkStartTimeOptionsRtt()
          initClientStartSequenceOptionsRtt()
          
          // 等待DOM更新后渲染图表
          nextTick(() => {
            renderRttChart()
          })
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load RTT comparison error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        rttComparisonLoading.value = false
      }
    }

    // 加载卡顿对比数据
    const loadStutterComparisonData = async (taskId) => {
      if (!taskId) {
        return
      }
      
      stutterComparisonLoading.value = true
      try {
        const response = await getStutterComparison(taskId)
        if (response.code === 200 && response.data) {
          stutterComparisonData.value = response.data
          
          // 设置当前保存的网络侧开始时间和端侧开始序号
          if (response.data.networkStartTime) {
            selectedNetworkStartTimeStutter.value = response.data.networkStartTime
          } else {
            selectedNetworkStartTimeStutter.value = ''
          }
          if (response.data.clientStartSequence != null) {
            selectedClientStartSequenceStutter.value = response.data.clientStartSequence
          } else {
            selectedClientStartSequenceStutter.value = null
          }
          
          // 初始化网络侧开始时间选项和端侧开始序号选项
          initNetworkStartTimeOptionsStutter()
          initClientStartSequenceOptionsStutter()
          
          // 等待DOM更新后渲染图表
          nextTick(() => {
            renderStutterChart()
          })
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load stutter comparison error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        stutterComparisonLoading.value = false
      }
    }

    // 加载平均QOE对比数据
    const loadAvgQoeComparisonData = async (taskId) => {
      if (!taskId) {
        return
      }
      
      avgQoeComparisonLoading.value = true
      try {
        const response = await getAvgQoeComparison(taskId)
        if (response.code === 200 && response.data) {
          avgQoeComparisonData.value = response.data
          
          // 设置当前保存的网络侧开始时间和端侧开始序号
          if (response.data.networkStartTime) {
            selectedNetworkStartTimeAvgQoe.value = response.data.networkStartTime
          } else {
            selectedNetworkStartTimeAvgQoe.value = ''
          }
          if (response.data.clientStartSequence != null) {
            selectedClientStartSequenceAvgQoe.value = response.data.clientStartSequence
          } else {
            selectedClientStartSequenceAvgQoe.value = null
          }
          
          // 初始化网络侧开始时间选项和端侧开始序号选项
          initNetworkStartTimeOptionsAvgQoe()
          initClientStartSequenceOptionsAvgQoe()
          
          // 等待DOM更新后渲染图表
          nextTick(() => {
            renderAvgQoeChart()
          })
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load avg QOE comparison error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        avgQoeComparisonLoading.value = false
      }
    }

    // 初始化RTT对比的网络侧开始时间选项
    const initNetworkStartTimeOptionsRtt = () => {
      if (!rttComparisonData.value || !rttComparisonData.value.networkRttList) {
        networkStartTimeOptionsRtt.value = []
        return
      }
      
      const timeSet = new Set()
      rttComparisonData.value.networkRttList.forEach((item) => {
        if (item.startTime) {
          timeSet.add(item.startTime)
        }
      })
      
      networkStartTimeOptionsRtt.value = Array.from(timeSet)
        .sort()
        .map((time) => ({
          label: time,
          value: time,
        }))
    }

    // 初始化RTT对比的端侧开始序号选项
    const initClientStartSequenceOptionsRtt = () => {
      if (!rttComparisonData.value || !rttComparisonData.value.clientRttList) {
        clientStartSequenceOptionsRtt.value = []
        return
      }
      
      const sequenceSet = new Set()
      rttComparisonData.value.clientRttList.forEach((item) => {
        if (item.sequenceNumber) {
          const seqNum = parseInt(item.sequenceNumber)
          if (!isNaN(seqNum)) {
            sequenceSet.add(seqNum)
          }
        }
      })
      
      clientStartSequenceOptionsRtt.value = Array.from(sequenceSet)
        .sort((a, b) => a - b)
        .map((seq) => ({
          label: seq.toString(),
          value: seq,
        }))
    }

    // 初始化卡顿对比的网络侧开始时间选项
    const initNetworkStartTimeOptionsStutter = () => {
      if (!stutterComparisonData.value || !stutterComparisonData.value.networkStutterList) {
        networkStartTimeOptionsStutter.value = []
        return
      }
      
      const timeSet = new Set()
      stutterComparisonData.value.networkStutterList.forEach((item) => {
        if (item.startTime) {
          timeSet.add(item.startTime)
        }
      })
      
      networkStartTimeOptionsStutter.value = Array.from(timeSet)
        .sort()
        .map((time) => ({
          label: time,
          value: time,
        }))
    }

    // 初始化卡顿对比的端侧开始序号选项
    const initClientStartSequenceOptionsStutter = () => {
      if (!stutterComparisonData.value || !stutterComparisonData.value.clientStutterList) {
        clientStartSequenceOptionsStutter.value = []
        return
      }
      
      const sequenceSet = new Set()
      stutterComparisonData.value.clientStutterList.forEach((item) => {
        if (item.sequenceNumber) {
          const seqNum = parseInt(item.sequenceNumber)
          if (!isNaN(seqNum)) {
            sequenceSet.add(seqNum)
          }
        }
      })
      
      clientStartSequenceOptionsStutter.value = Array.from(sequenceSet)
        .sort((a, b) => a - b)
        .map((seq) => ({
          label: seq.toString(),
          value: seq,
        }))
    }

    // 初始化平均QOE对比的网络侧开始时间选项
    const initNetworkStartTimeOptionsAvgQoe = () => {
      if (!avgQoeComparisonData.value || !avgQoeComparisonData.value.networkAvgQoeList) {
        networkStartTimeOptionsAvgQoe.value = []
        return
      }
      
      const timeSet = new Set()
      avgQoeComparisonData.value.networkAvgQoeList.forEach((item) => {
        if (item.startTime) {
          timeSet.add(item.startTime)
        }
      })
      
      networkStartTimeOptionsAvgQoe.value = Array.from(timeSet)
        .sort()
        .map((time) => ({
          label: time,
          value: time,
        }))
    }

    // 初始化平均QOE对比的端侧开始序号选项
    const initClientStartSequenceOptionsAvgQoe = () => {
      if (!avgQoeComparisonData.value || !avgQoeComparisonData.value.clientAvgQoeList) {
        clientStartSequenceOptionsAvgQoe.value = []
        return
      }
      
      const sequenceSet = new Set()
      avgQoeComparisonData.value.clientAvgQoeList.forEach((item) => {
        if (item.sequenceNumber) {
          const seqNum = parseInt(item.sequenceNumber)
          if (!isNaN(seqNum)) {
            sequenceSet.add(seqNum)
          }
        }
      })
      
      clientStartSequenceOptionsAvgQoe.value = Array.from(sequenceSet)
        .sort((a, b) => a - b)
        .map((seq) => ({
          label: seq.toString(),
          value: seq,
        }))
    }

    // 保存RTT对比的网络侧开始时间和端侧开始序号
    const handleSaveNetworkStartTimeRtt = async () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(
          currentTaskId.value,
          selectedNetworkStartTimeRtt.value,
          selectedClientStartSequenceRtt.value,
        )
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadRttComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Save network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 重置RTT对比的网络侧开始时间和端侧开始序号
    const handleResetNetworkStartTimeRtt = async () => {
      if (!currentTaskId.value) {
        return
      }
      
      selectedNetworkStartTimeRtt.value = ''
      selectedClientStartSequenceRtt.value = null
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(currentTaskId.value, '', null)
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadRttComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Reset network start time error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 保存卡顿对比的网络侧开始时间和端侧开始序号
    const handleSaveNetworkStartTimeStutter = async () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(
          currentTaskId.value,
          selectedNetworkStartTimeStutter.value,
          selectedClientStartSequenceStutter.value,
        )
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadStutterComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Save network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 重置卡顿对比的网络侧开始时间和端侧开始序号
    const handleResetNetworkStartTimeStutter = async () => {
      if (!currentTaskId.value) {
        return
      }
      
      selectedNetworkStartTimeStutter.value = ''
      selectedClientStartSequenceStutter.value = null
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(currentTaskId.value, '', null)
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadStutterComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Reset network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 保存平均QOE对比的网络侧开始时间和端侧开始序号
    const handleSaveNetworkStartTimeAvgQoe = async () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(
          currentTaskId.value,
          selectedNetworkStartTimeAvgQoe.value,
          selectedClientStartSequenceAvgQoe.value,
        )
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadAvgQoeComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Save network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }

    // 重置平均QOE对比的网络侧开始时间和端侧开始序号
    const handleResetNetworkStartTimeAvgQoe = async () => {
      if (!currentTaskId.value) {
        return
      }
      
      selectedNetworkStartTimeAvgQoe.value = ''
      selectedClientStartSequenceAvgQoe.value = null
      savingNetworkStartTime.value = true
      try {
        const response = await updateNetworkStartTime(currentTaskId.value, '', null)
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          await loadAvgQoeComparisonData(currentTaskId.value)
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Reset network start time and client start sequence error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        savingNetworkStartTime.value = false
      }
    }


    // 刷新速率对比数据
    const handleRefreshSpeedComparison = () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      loadSpeedComparisonData(currentTaskId.value)
    }

    // 刷新RTT对比数据
    const handleRefreshRttComparison = () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      loadRttComparisonData(currentTaskId.value)
    }

    // 刷新卡顿对比数据
    const handleRefreshStutterComparison = () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      loadStutterComparisonData(currentTaskId.value)
    }

    // 刷新平均QOE对比数据
    const handleRefreshAvgQoeComparison = () => {
      if (!currentTaskId.value) {
        ElMessage.warning('任务ID不存在')
        return
      }
      loadAvgQoeComparisonData(currentTaskId.value)
    }

    // 监听对比tab切换，自动加载对应数据
    watch(activeComparisonTab, (newTab) => {
      if (!currentTaskId.value) {
        return
      }
      
      // 根据tab名称加载对应的数据
      if (newTab === 'rtt' && !rttComparisonData.value) {
        loadRttComparisonData(currentTaskId.value)
      } else if (newTab === 'stutter' && !stutterComparisonData.value) {
        loadStutterComparisonData(currentTaskId.value)
      } else if (newTab === 'avgQoe' && !avgQoeComparisonData.value) {
        loadAvgQoeComparisonData(currentTaskId.value)
      } else if (newTab === 'speed' && !speedComparisonData.value) {
        loadSpeedComparisonData(currentTaskId.value)
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
      // 检查路由参数，如果是从端侧数据页面跳转过来的，自动打开详情页
      const taskId = route.query.taskId
      const autoOpenDetail = route.query.autoOpenDetail
      
      if (taskId && autoOpenDetail === 'true') {
        // 自动切换到详情tab并加载数据
        activeMainTab.value = 'detail'
        activeComparisonTab.value = 'speed'
        currentTaskId.value = taskId
        
        // 加载速率对比数据
        loadSpeedComparisonData(taskId)
      } else {
        // 确保默认显示数据列表tab
        activeMainTab.value = 'list'
        // 使用 nextTick 确保 DOM 更新后再加载数据
        nextTick(() => {
          loadData()
        })
      }
    })

    onBeforeUnmount(() => {
      // 销毁图表
      if (speedChart) {
        speedChart.dispose()
        speedChart = null
      }
      if (rttChart) {
        rttChart.dispose()
        rttChart = null
      }
      if (stutterChart) {
        stutterChart.dispose()
        stutterChart = null
      }
      if (avgQoeChart) {
        avgQoeChart.dispose()
        avgQoeChart = null
      }
    })

    return {
      loading,
      tableData,
      pagination,
      searchForm,
      exporting,
      activeMainTab,
      detailLoading,
      comparisonDetail,
      activeComparisonTab,
      speedComparisonLoading,
      speedComparisonData,
      speedChartRef,
      mergedSpeedData,
      selectedNetworkStartTime,
      selectedClientStartSequence,
      savingNetworkStartTime,
      networkStartTimeOptions,
      clientStartSequenceOptions,
      rttComparisonLoading,
      rttComparisonData,
      rttChartRef,
      mergedRttData,
      selectedNetworkStartTimeRtt,
      selectedClientStartSequenceRtt,
      networkStartTimeOptionsRtt,
      clientStartSequenceOptionsRtt,
      stutterComparisonLoading,
      stutterComparisonData,
      stutterChartRef,
      mergedStutterData,
      selectedNetworkStartTimeStutter,
      selectedClientStartSequenceStutter,
      networkStartTimeOptionsStutter,
      clientStartSequenceOptionsStutter,
      avgQoeComparisonLoading,
      avgQoeComparisonData,
      avgQoeChartRef,
      mergedAvgQoeData,
      selectedNetworkStartTimeAvgQoe,
      selectedClientStartSequenceAvgQoe,
      networkStartTimeOptionsAvgQoe,
      clientStartSequenceOptionsAvgQoe,
      loadData,
      handleCompare,
      handleView,
      handleSearch,
      handleReset,
      handleExportCharts,
      handleExportFromList,
      handleSizeChange,
      handleCurrentChange,
      formatSpeed,
      formatValue,
      handleSaveNetworkStartTime,
      handleResetNetworkStartTime,
      handleSaveNetworkStartTimeRtt,
      handleResetNetworkStartTimeRtt,
      handleSaveNetworkStartTimeStutter,
      handleResetNetworkStartTimeStutter,
      handleSaveNetworkStartTimeAvgQoe,
      handleResetNetworkStartTimeAvgQoe,
      handleRefreshSpeedComparison,
      handleRefreshRttComparison,
      handleRefreshStutterComparison,
      handleRefreshAvgQoeComparison,
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

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.export-operations {
  margin-bottom: 16px;
  text-align: right;
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
  overflow: hidden;
}

.comparison-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comparison-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.comparison-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.comparison-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.chart-container {
  margin-bottom: 30px;
}

.speed-chart,
.rtt-chart,
.stutter-chart,
.avg-qoe-chart {
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

.selection-container {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selection-form {
  margin: 0;
}
</style>




















