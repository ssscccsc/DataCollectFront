<template>
  <div class="network-data-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.networkData') }}</h2>
      <p class="page-description">{{ $t('experienceTest.networkData.description') }}</p>
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
        :title="$t('experienceTest.networkData.uploadFile')"
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
            {{ $t('experienceTest.networkData.uploadTip') }}
          </div>
          <template #tip>
            <div class="el-upload__tip">
              {{ $t('experienceTest.networkData.uploadTipDetail') }}
            </div>
          </template>
        </el-upload>

        <div v-if="selectedFile" class="file-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('experienceTest.networkData.fileName')">
              {{ selectedFile.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('experienceTest.networkData.fileSize')">
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
          v-model="searchForm.gpsi"
          :placeholder="$t('experienceTest.networkData.searchGpsi')"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <el-input
          v-model="searchForm.startTime"
          :placeholder="$t('experienceTest.networkData.searchStartTime')"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <el-input
          v-model="searchForm.timeStamp"
          :placeholder="$t('experienceTest.networkData.searchTimeStamp')"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <el-input
          v-model="searchForm.subAppId"
          :placeholder="$t('experienceTest.networkData.searchSubAppId')"
          style="width: 200px; margin-right: 10px;"
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
        <el-table-column prop="gpsi" :label="$t('experienceTest.networkData.gpsi')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="startTime" :label="$t('experienceTest.networkData.startTime')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="timeStamp" :label="$t('experienceTest.networkData.timeStamp')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="appId" :label="$t('experienceTest.networkData.appId')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="subAppId" :label="$t('experienceTest.networkData.subAppId')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="uplinkBandwidth" :label="$t('experienceTest.networkData.uplinkBandwidth')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="downlinkBandwidth" :label="$t('experienceTest.networkData.downlinkBandwidth')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="avgQoe" :label="$t('experienceTest.networkData.avgQoe')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="mostResolution" :label="$t('experienceTest.networkData.mostResolution')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="stallingDuration" :label="$t('experienceTest.networkData.stallingDuration')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="stallingNumber" :label="$t('experienceTest.networkData.stallingNumber')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="serviceDelay" :label="$t('experienceTest.networkData.serviceDelay')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="serviceInitialDuration" :label="$t('experienceTest.networkData.serviceInitialDuration')" min-width="180" show-overflow-tooltip />
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
import { Plus, Refresh, UploadFilled, Search, RefreshLeft } from '@element-plus/icons-vue'
import { uploadNetworkDataFile, getNetworkDataPage } from '@/api/test-settings'

export default {
  name: 'NetworkData',
  components: {
    Plus,
    Refresh,
    UploadFilled,
    Search,
    RefreshLeft,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const uploadDialogVisible = ref(false)
    const uploading = ref(false)
    const selectedFile = ref(null)
    const uploadRef = ref(null)

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const searchForm = reactive({
      gpsi: '',
      timeStamp: '',
      startTime: '',
      subAppId: '',
    })

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        if (searchForm.gpsi) {
          params.gpsi = searchForm.gpsi
        }
        if (searchForm.timeStamp) {
          params.timeStamp = searchForm.timeStamp
        }
        if (searchForm.startTime) {
          params.startTime = searchForm.startTime
        }
        if (searchForm.subAppId) {
          params.subAppId = searchForm.subAppId
        }

        const response = await getNetworkDataPage(params)
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
      searchForm.gpsi = ''
      searchForm.timeStamp = ''
      searchForm.startTime = ''
      searchForm.subAppId = ''
      pagination.current = 1
      loadData()
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
        ElMessage.warning(t('experienceTest.networkData.selectFileFirst'))
        return
      }

      // 验证文件类型
      const fileName = selectedFile.value.name.toLowerCase()
      const validExtensions = ['.zip', '.gz', '.tar.gz', '.rar']
      const isValid = validExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isValid) {
        ElMessage.error(t('experienceTest.networkData.invalidFileType'))
        return
      }

      uploading.value = true
      try {
        const response = await uploadNetworkDataFile(selectedFile.value)
        
        if (response.code === 200) {
          const result = response.data
          let message = t('experienceTest.networkData.uploadSuccess')
          
          // 显示解析结果
          if (result.networkDataCount) {
            message += `\n${t('experienceTest.networkData.networkDataCount')}: ${result.networkDataCount}`
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
      loadData,
      handleAdd,
      handleSearch,
      handleReset,
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
.network-data-page {
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




















