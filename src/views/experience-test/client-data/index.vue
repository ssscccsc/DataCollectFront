<template>
  <div class="client-data-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.clientData') }}</h2>
      <p class="page-description">{{ $t('experienceTest.clientData.description') }}</p>
    </div>

    <el-card>
      <el-tabs v-model="activeMainTab" type="border-card">
        <!-- 第一个tab：端侧任务列表页 -->
        <el-tab-pane :label="$t('experienceTest.clientData.taskList')" name="taskList">
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('common.add') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>
      <!-- 文件上传对话框 -->
      <el-dialog
        v-model="uploadDialogVisible"
        :title="$t('experienceTest.clientData.uploadFile')"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="1"
          accept=".zip,.gz,.tar.gz,.rar"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            {{ $t('experienceTest.clientData.uploadTip') }}
          </div>
          <template #tip>
            <div class="el-upload__tip">
              {{ $t('experienceTest.clientData.uploadTipDetail') }}
            </div>
          </template>
        </el-upload>

        <div v-if="selectedFile" class="file-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('experienceTest.clientData.fileName')">
              {{ selectedFile.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('experienceTest.clientData.fileSize')">
              {{ formatFileSize(selectedFile.size) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="uploadDialogVisible = false">
              {{ $t('common.cancel') }}
            </el-button>
            <el-button
              type="primary"
              @click="handleUpload"
              :loading="uploading"
              :disabled="!selectedFile"
            >
              {{ $t('common.upload') }}
            </el-button>
          </span>
        </template>
      </el-dialog>
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchForm.taskId"
              :placeholder="$t('experienceTest.clientData.searchTaskId')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.service"
              :placeholder="$t('experienceTest.clientData.searchService')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.app"
              :placeholder="$t('experienceTest.clientData.searchApp')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleReset">
              {{ $t('common.reset') }}
            </el-button>
          </div>

          <el-table 
            :data="tableData" 
            v-loading="loading" 
            style="width: 100%"
            :fit="true"
            stripe
            border
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="taskId" :label="$t('experienceTest.clientData.taskId')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="service" :label="$t('experienceTest.clientData.service')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="app" :label="$t('experienceTest.clientData.app')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="startTime" :label="$t('experienceTest.clientData.startTime')" min-width="180" show-overflow-tooltip />
            <el-table-column prop="endTime" :label="$t('experienceTest.clientData.endTime')" min-width="180" show-overflow-tooltip />
            <el-table-column :label="$t('common.operations')" width="120" fixed="right">
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
            />
          </div>
        </el-tab-pane>

        <!-- 第二个tab：任务详情页 -->
        <el-tab-pane :label="$t('experienceTest.clientData.detailTitle')" name="detail">
          <div class="detail-container" v-loading="detailLoading">
            <el-tabs v-model="activeDetailTab" type="border-card">
              <!-- 基础信息 -->
              <el-tab-pane :label="$t('experienceTest.clientData.basicInfo')" name="basic">
                <el-descriptions :column="2" border v-if="taskDetail.taskInfo">
                  <el-descriptions-item :label="$t('experienceTest.clientData.taskId')">
                    {{ taskDetail.taskInfo.taskId }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.service')">
                    {{ taskDetail.taskInfo.service }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.app')">
                    {{ taskDetail.taskInfo.app }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.nation')">
                    {{ taskDetail.taskInfo.nation }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.operator')">
                    {{ taskDetail.taskInfo.operator }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.deviceId')">
                    {{ taskDetail.taskInfo.deviceId }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.startTime')">
                    {{ taskDetail.taskInfo.startTime }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.endTime')">
                    {{ taskDetail.taskInfo.endTime }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.prb')">
                    {{ taskDetail.taskInfo.prb }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.rsrp')">
                    {{ taskDetail.taskInfo.rsrp }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('experienceTest.clientData.userCategory')">
                    {{ taskDetail.taskInfo.userCategory }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('common.createTime')" :span="2">
                    {{ taskDetail.taskInfo.createTime }}
                  </el-descriptions-item>
                </el-descriptions>
                <el-empty v-else :description="$t('common.noData')" />
              </el-tab-pane>

              <!-- vMOS数据 -->
              <el-tab-pane :label="$t('experienceTest.clientData.vmos')" name="vmos">
                <el-table :data="taskDetail.vmosDataList" border style="width: 100%" max-height="600">
                  <el-table-column type="index" label="#" width="60" />
                  <el-table-column prop="sequenceNumber" :label="$t('experienceTest.clientData.sequenceNumber')" width="120" />
                  <el-table-column prop="speed" :label="$t('experienceTest.clientData.speed')" width="120" />
                  <el-table-column prop="resolution" :label="$t('experienceTest.clientData.resolution')" width="150" />
                  <el-table-column prop="rtt" :label="$t('experienceTest.clientData.rtt')" width="120" />
                  <el-table-column prop="packetLossRate" :label="$t('experienceTest.clientData.packetLossRate')" width="150" />
                  <el-table-column prop="stutterRatio" :label="$t('experienceTest.clientData.stutterRatio')" width="150" />
                  <el-table-column prop="initialBufferingDelay" :label="$t('experienceTest.clientData.initialBufferingDelay')" width="180" />
                  <el-table-column prop="bitrate" :label="$t('experienceTest.clientData.bitrate')" width="120" />
                  <el-table-column prop="videoExperience" :label="$t('experienceTest.clientData.videoExperience')" width="150" />
                  <el-table-column prop="interactionExperience" :label="$t('experienceTest.clientData.interactionExperience')" width="180" />
                  <el-table-column prop="presentationExperience" :label="$t('experienceTest.clientData.presentationExperience')" width="180" />
                  <el-table-column prop="alpha" :label="$t('experienceTest.clientData.alpha')" width="100" />
                  <el-table-column prop="beta" :label="$t('experienceTest.clientData.beta')" width="100" />
                  <el-table-column prop="vmos" :label="$t('experienceTest.clientData.vmos')" width="100" />
                  <el-table-column prop="avgQoe" :label="$t('experienceTest.clientData.avgQoe')" width="120" />
                </el-table>
                <el-empty v-if="!taskDetail.vmosDataList || taskDetail.vmosDataList.length === 0" :description="$t('common.noData')" />
              </el-tab-pane>

              <!-- 上下行速率统计 -->
              <el-tab-pane :label="$t('experienceTest.clientData.speedStatistics')" name="speed">
                <el-table :data="taskDetail.speedDataList" border style="width: 100%" max-height="600">
                  <el-table-column type="index" label="#" width="60" />
                  <el-table-column prop="dlSpeed" :label="$t('experienceTest.clientData.dlSpeed')" width="150" />
                  <el-table-column prop="ulSpeed" :label="$t('experienceTest.clientData.ulSpeed')" width="150" />
                  <el-table-column prop="total" :label="$t('experienceTest.clientData.total')" width="150" />
                </el-table>
                <el-empty v-if="!taskDetail.speedDataList || taskDetail.speedDataList.length === 0" :description="$t('common.noData')" />
              </el-tab-pane>

              <!-- 上下行RTT统计 -->
              <el-tab-pane :label="$t('experienceTest.clientData.rttStatistics')" name="rtt">
                <el-table :data="taskDetail.rttDataList" border style="width: 100%" max-height="600">
                  <el-table-column type="index" label="#" width="60" />
                  <el-table-column prop="indexTime" :label="$t('experienceTest.clientData.indexTime')" width="180" />
                  <el-table-column prop="dlDelay" :label="$t('experienceTest.clientData.dlDelay')" width="150" />
                  <el-table-column prop="ulDelay" :label="$t('experienceTest.clientData.ulDelay')" width="150" />
                </el-table>
                <el-empty v-if="!taskDetail.rttDataList || taskDetail.rttDataList.length === 0" :description="$t('common.noData')" />
              </el-tab-pane>

              <!-- 上下行丢包率统计 -->
              <el-tab-pane :label="$t('experienceTest.clientData.lostStatistics')" name="lost">
                <el-table :data="taskDetail.lostDataList" border style="width: 100%" max-height="600">
                  <el-table-column type="index" label="#" width="60" />
                  <el-table-column prop="indexTime" :label="$t('experienceTest.clientData.indexTime')" width="180" />
                  <el-table-column prop="dlLoss" :label="$t('experienceTest.clientData.dlLoss')" width="150" />
                  <el-table-column prop="ulLoss" :label="$t('experienceTest.clientData.ulLoss')" width="150" />
                  <el-table-column prop="totalLoss" :label="$t('experienceTest.clientData.totalLoss')" width="150" />
                </el-table>
                <el-empty v-if="!taskDetail.lostDataList || taskDetail.lostDataList.length === 0" :description="$t('common.noData')" />
              </el-tab-pane>

              <!-- 视频卡顿统计 -->
              <el-tab-pane :label="$t('experienceTest.clientData.videoStatistics')" name="video">
                <el-table :data="taskDetail.videoDataList" border style="width: 100%" max-height="600">
                  <el-table-column type="index" label="#" width="60" />
                  <el-table-column prop="time" :label="$t('experienceTest.clientData.time')" width="180" />
                  <el-table-column prop="catonTime" :label="$t('experienceTest.clientData.catonTime')" width="150" />
                </el-table>
                <el-empty v-if="!taskDetail.videoDataList || taskDetail.videoDataList.length === 0" :description="$t('common.noData')" />
              </el-tab-pane>
            </el-tabs>
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
import { Plus, Refresh, UploadFilled, Search } from '@element-plus/icons-vue'
import { uploadClientDataFile, getClientDataPage, getClientDataDetail } from '@/api/test-settings'

export default {
  name: 'ClientData',
  components: {
    Plus,
    Refresh,
    UploadFilled,
    Search,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const uploadDialogVisible = ref(false)
    const uploading = ref(false)
    const selectedFile = ref(null)
    const uploadRef = ref(null)
    // 初始化主tab，默认显示任务列表
    const activeMainTab = ref('taskList')
    const detailLoading = ref(false)
    const activeDetailTab = ref('basic')
    const taskDetail = ref({
      taskInfo: null,
      vmosDataList: [],
      speedDataList: [],
      rttDataList: [],
      lostDataList: [],
      videoDataList: [],
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const searchForm = reactive({
      taskId: '',
      service: '',
      app: '',
    })

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        if (searchForm.taskId) {
          params.taskId = searchForm.taskId
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

    const handleSearch = () => {
      pagination.current = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.taskId = ''
      searchForm.service = ''
      searchForm.app = ''
      pagination.current = 1
      loadData()
    }

    const handleViewDetail = async (row) => {
      if (!row || !row.taskId) {
        ElMessage.warning('无效的数据')
        return
      }
      
      try {
        // 切换到详情tab
        activeMainTab.value = 'detail'
        activeDetailTab.value = 'basic'
        detailLoading.value = true
        
        // 重置数据
        taskDetail.value = {
          taskInfo: null,
          vmosDataList: [],
          speedDataList: [],
          rttDataList: [],
          lostDataList: [],
          videoDataList: [],
        }
        
        const response = await getClientDataDetail(row.taskId)
        if (response.code === 200 && response.data) {
          taskDetail.value = {
            taskInfo: response.data.taskInfo || null,
            vmosDataList: response.data.vmosDataList || [],
            speedDataList: response.data.speedDataList || [],
            rttDataList: response.data.rttDataList || [],
            lostDataList: response.data.lostDataList || [],
            videoDataList: response.data.videoDataList || [],
          }
          // 确保默认显示基础信息子tab
          activeDetailTab.value = 'basic'
        } else {
          ElMessage.error(response.message || t('common.error'))
          // 如果加载失败，切换回任务列表tab
          activeMainTab.value = 'taskList'
        }
      } catch (error) {
        console.error('Get detail error:', error)
        ElMessage.error(error.message || t('common.error'))
        // 如果加载失败，切换回任务列表tab
        activeMainTab.value = 'taskList'
      } finally {
        detailLoading.value = false
      }
    }

    const handleAdd = () => {
      uploadDialogVisible.value = true
      selectedFile.value = null
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }

    const handleFileChange = (file) => {
      selectedFile.value = file.raw
    }

    const handleFileRemove = () => {
      selectedFile.value = null
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) {
        return '0 B'
      }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleUpload = async () => {
      if (!selectedFile.value) {
        ElMessage.warning(t('experienceTest.clientData.selectFileFirst'))
        return
      }

      // 验证文件类型
      const fileName = selectedFile.value.name.toLowerCase()
      const validExtensions = ['.zip', '.gz', '.tar.gz', '.rar']
      const isValid = validExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isValid) {
        ElMessage.error(t('experienceTest.clientData.invalidFileType'))
        return
      }

      uploading.value = true
      try {
        const response = await uploadClientDataFile(selectedFile.value)
        
        if (response.code === 200) {
          const result = response.data
          let message = t('experienceTest.clientData.uploadSuccess')
          
          // 显示解析结果
          if (result.taskId) {
            message += `\n${t('experienceTest.clientData.taskId')}: ${result.taskId}`
          }
          if (result.speedDataCount) {
            message += `\n${t('experienceTest.clientData.speedDataCount')}: ${result.speedDataCount}`
          }
          if (result.vmosDataCount) {
            message += `\n${t('experienceTest.clientData.vmosDataCount')}: ${result.vmosDataCount}`
          }
          if (result.rttDataCount) {
            message += `\n${t('experienceTest.clientData.rttDataCount')}: ${result.rttDataCount}`
          }
          if (result.lostDataCount) {
            message += `\n${t('experienceTest.clientData.lostDataCount')}: ${result.lostDataCount}`
          }
          if (result.videoDataCount) {
            message += `\n${t('experienceTest.clientData.videoDataCount')}: ${result.videoDataCount}`
          }
          
          ElMessage.success(message)
          uploadDialogVisible.value = false
          selectedFile.value = null
          if (uploadRef.value) {
            uploadRef.value.clearFiles()
          }
          // 刷新数据列表
          loadData()
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Upload error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        uploading.value = false
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
      // 确保默认显示任务列表tab
      activeMainTab.value = 'taskList'
      // 使用 nextTick 确保 DOM 更新后再加载数据
      nextTick(() => {
        loadData()
      })
    })

    return {
      loading,
      tableData,
      pagination,
      searchForm,
      uploadDialogVisible,
      uploading,
      selectedFile,
      uploadRef,
      activeMainTab,
      detailLoading,
      activeDetailTab,
      taskDetail,
      loadData,
      handleAdd,
      handleSearch,
      handleReset,
      handleViewDetail,
      handleSizeChange,
      handleCurrentChange,
      handleFileChange,
      handleFileRemove,
      handleUpload,
      formatFileSize,
    }
  },
}
</script>

<style scoped>
.client-data-page {
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

.client-data-page :deep(.el-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.client-data-page :deep(.el-card__body) {
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

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.client-data-page :deep(.el-table) {
  flex: 1;
  width: 100% !important;
}

.client-data-page :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.pagination {
  margin-top: 20px;
  text-align: right;
  flex-shrink: 0;
}

.file-info {
  margin-top: 20px;
}

.el-upload__tip {
  color: #606266;
  font-size: 12px;
  margin-top: 7px;
}

.detail-container {
  min-height: 400px;
  padding: 20px;
}

.empty-container {
  text-align: center;
  padding: 40px;
}
</style>




















