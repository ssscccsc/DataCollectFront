<template>
  <div class="client-data-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.clientData') }}</h2>
      <p class="page-description">{{ $t('experienceTest.clientData.description') }}</p>
    </div>

    <el-card>
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

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="taskId" :label="$t('experienceTest.clientData.taskId')" width="200" />
        <el-table-column prop="service" :label="$t('experienceTest.clientData.service')" width="150" />
        <el-table-column prop="app" :label="$t('experienceTest.clientData.app')" width="150" />
        <el-table-column prop="startTime" :label="$t('experienceTest.clientData.startTime')" width="180" />
        <el-table-column prop="endTime" :label="$t('experienceTest.clientData.endTime')" width="180" />
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
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Plus, Refresh, UploadFilled, Search } from '@element-plus/icons-vue'
import { uploadClientDataFile, getClientDataPage, getClientDataDetail } from '@/api/client-data'

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
    const detailDialogVisible = ref(false)
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
      try {
        loading.value = true
        const response = await getClientDataDetail(row.taskId)
        if (response.code === 200) {
          taskDetail.value = {
            taskInfo: response.data.taskInfo || null,
            vmosDataList: response.data.vmosDataList || [],
            speedDataList: response.data.speedDataList || [],
            rttDataList: response.data.rttDataList || [],
            lostDataList: response.data.lostDataList || [],
            videoDataList: response.data.videoDataList || [],
          }
          activeDetailTab.value = 'basic'
          detailDialogVisible.value = true
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Get detail error:', error)
        ElMessage.error(t('common.error'))
      } finally {
        loading.value = false
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
      loadData()
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
      detailDialogVisible,
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
}

.page-header {
  margin-bottom: 20px;
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

.table-operations {
  margin-bottom: 16px;
}

.table-operations .el-button {
  margin-right: 8px;
}

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.file-info {
  margin-top: 20px;
}

.el-upload__tip {
  color: #606266;
  font-size: 12px;
  margin-top: 7px;
}
</style>




















