<template>
  <div class="network-data-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.networkData') }}</h2>
      <p class="page-description">{{ $t('experienceTest.networkData.description') }}</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 第一个tab：聚合数据列表 -->
        <el-tab-pane :label="$t('experienceTest.networkData.groupList')" name="group">
          <div class="table-operations">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              {{ $t('common.add') }}
            </el-button>
            <el-button @click="loadGroupData">
              <el-icon><Refresh /></el-icon>
              {{ $t('common.refresh') }}
            </el-button>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="groupSearchForm.gpsi"
              :placeholder="$t('experienceTest.networkData.searchGpsi')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-date-picker
              v-model="groupSearchForm.date"
              type="date"
              :placeholder="$t('experienceTest.networkData.searchDate')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="groupSearchForm.subAppId"
              :placeholder="$t('experienceTest.networkData.searchSubAppId')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-button type="primary" @click="handleGroupSearch">
              <el-icon><Search /></el-icon>
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleGroupReset">
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('common.reset') }}
            </el-button>
          </div>

          <el-table :data="groupTableData" v-loading="groupLoading" style="width: 100%" stripe border>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="gpsi" :label="$t('experienceTest.networkData.gpsi')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="date" :label="$t('experienceTest.networkData.date')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="subAppId" :label="$t('experienceTest.networkData.subAppId')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="count" :label="$t('experienceTest.networkData.dataCount')" width="120" />
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
              v-model:current-page="groupPagination.current"
              v-model:page-size="groupPagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="groupPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleGroupSizeChange"
              @current-change="handleGroupCurrentChange"
            />
          </div>
        </el-tab-pane>

        <!-- 第二个tab：详细数据列表 -->
        <el-tab-pane :label="$t('experienceTest.networkData.detailList')" name="detail">
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

          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              :model-value="filterFromGroup.gpsi || searchForm.gpsi"
              @input="handleGpsiInput"
              :placeholder="$t('experienceTest.networkData.searchGpsi')"
              style="width: 200px; margin-right: 10px;"
              :disabled="!!filterFromGroup.gpsi"
              :clearable="!filterFromGroup.gpsi"
            />
            <el-input
              :model-value="filterFromGroup.subAppId || searchForm.subAppId"
              @input="handleSubAppIdInput"
              :placeholder="$t('experienceTest.networkData.searchSubAppId')"
              style="width: 200px; margin-right: 10px;"
              :disabled="!!filterFromGroup.subAppId"
              :clearable="!filterFromGroup.subAppId"
            />
            <el-date-picker
              v-model="searchForm.startTime"
              type="datetime"
              :placeholder="$t('experienceTest.networkData.searchStartTime')"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-value="getDefaultStartTime()"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-date-picker
              v-model="searchForm.endTime"
              type="datetime"
              :placeholder="$t('experienceTest.networkData.searchEndTime')"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-value="getDefaultEndTime()"
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
        </el-tab-pane>
      </el-tabs>

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
          :limit="10"
          :multiple="true"
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

        <div v-if="selectedFiles && selectedFiles.length > 0" class="file-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('experienceTest.networkData.fileCount')">
              {{ selectedFiles.length }} {{ $t('experienceTest.networkData.files') }}
            </el-descriptions-item>
          </el-descriptions>
          <el-table :data="selectedFiles" style="margin-top: 10px;" border>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column :label="$t('experienceTest.networkData.fileName')" prop="name" min-width="200" show-overflow-tooltip />
            <el-table-column :label="$t('experienceTest.networkData.fileSize')" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
          </el-table>
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
              :disabled="!selectedFiles || selectedFiles.length === 0"
            >
              {{ $t('common.upload') }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Plus, Refresh, UploadFilled, Search, RefreshLeft } from '@element-plus/icons-vue'
import { uploadNetworkDataFile, getNetworkDataPage, getGroupedNetworkDataPage } from '@/api/test-settings'

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
    const activeTab = ref('group')
    const loading = ref(false)
    const groupLoading = ref(false)
    const tableData = ref([])
    const groupTableData = ref([])
    const uploadDialogVisible = ref(false)
    const uploading = ref(false)
    const selectedFiles = ref([])
    const uploadRef = ref(null)

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const groupPagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const searchForm = reactive({
      gpsi: '',
      startTime: '',
      endTime: '',
      subAppId: '',
    })

    // 聚合列表搜索表单
    const groupSearchForm = reactive({
      gpsi: '',
      date: '',
      subAppId: '',
    })

    // 从第一个tab传递过来的筛选条件
    const filterFromGroup = reactive({
      gpsi: '',
      subAppId: '',
      date: '',
    })

    // 加载聚合数据
    const loadGroupData = async () => {
      groupLoading.value = true
      try {
        const params = {
          current: groupPagination.current,
          size: groupPagination.size,
        }

        // 添加筛选条件
        if (groupSearchForm.gpsi) {
          params.gpsi = groupSearchForm.gpsi
        }
        if (groupSearchForm.date) {
          params.date = groupSearchForm.date
        }
        if (groupSearchForm.subAppId) {
          params.subAppId = groupSearchForm.subAppId
        }

        const response = await getGroupedNetworkDataPage(params)
        if (response.code === 200) {
          groupTableData.value = response.data.records || []
          groupPagination.total = response.data.total || 0
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Load group data error:', error)
        ElMessage.error(t('common.error'))
      } finally {
        groupLoading.value = false
      }
    }

    // 聚合列表搜索
    const handleGroupSearch = () => {
      groupPagination.current = 1
      loadGroupData()
    }

    // 聚合列表重置
    const handleGroupReset = () => {
      groupSearchForm.gpsi = ''
      groupSearchForm.date = ''
      groupSearchForm.subAppId = ''
      groupPagination.current = 1
      loadGroupData()
    }

    // 加载详细数据
    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        
        // 优先使用从第一个tab传递过来的筛选条件
        if (filterFromGroup.gpsi) {
          params.gpsi = filterFromGroup.gpsi
        } else if (searchForm.gpsi) {
          params.gpsi = searchForm.gpsi
        }
        
        if (filterFromGroup.subAppId) {
          params.subAppId = filterFromGroup.subAppId
        } else if (searchForm.subAppId) {
          params.subAppId = searchForm.subAppId
        }
        
        if (searchForm.startTime) {
          params.startTimeBegin = searchForm.startTime
        }
        if (searchForm.endTime) {
          params.startTimeEnd = searchForm.endTime
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

    // 查看详情（从第一个tab跳转到第二个tab）
    const handleViewDetail = (row) => {
      // 设置筛选条件
      filterFromGroup.gpsi = row.gpsi
      filterFromGroup.subAppId = row.subAppId
      filterFromGroup.date = row.date || ''
      
      // 清空搜索表单中的GPSI和子应用ID，使用筛选条件
      searchForm.gpsi = ''
      searchForm.subAppId = ''
      
      // 如果有日期，设置开始时间和结束时间的默认值
      if (row.date) {
        // 开始时间设为该日期的 00:00:00
        searchForm.startTime = `${row.date} 00:00:00`
        // 结束时间设为该日期的 23:59:59
        searchForm.endTime = `${row.date} 23:59:59`
      } else {
        // 否则使用今天的日期
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const todayStr = `${year}-${month}-${day}`
        searchForm.startTime = `${todayStr} 00:00:00`
        searchForm.endTime = `${todayStr} 23:59:59`
      }
      
      // 切换到第二个tab
      activeTab.value = 'detail'
      
      // 重置分页并加载数据
      pagination.current = 1
      loadData()
    }

    // 处理GPSI输入
    const handleGpsiInput = (value) => {
      if (!filterFromGroup.gpsi) {
        searchForm.gpsi = value
      }
    }

    // 处理子应用ID输入
    const handleSubAppIdInput = (value) => {
      if (!filterFromGroup.subAppId) {
        searchForm.subAppId = value
      }
    }

    const handleSearch = () => {
      // 清空从第一个tab传递过来的筛选条件
      filterFromGroup.gpsi = ''
      filterFromGroup.subAppId = ''
      filterFromGroup.date = ''
      pagination.current = 1
      loadData()
    }

    // 获取默认开始时间
    const getDefaultStartTime = () => {
      if (filterFromGroup.date) {
        // 如果有从聚合列表传递过来的日期，使用该日期的 00:00:00
        return new Date(`${filterFromGroup.date} 00:00:00`)
      } else {
        // 否则使用今天的 00:00:00
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
      }
    }

    // 获取默认结束时间
    const getDefaultEndTime = () => {
      if (filterFromGroup.date) {
        // 如果有从聚合列表传递过来的日期，使用该日期的 23:59:59
        return new Date(`${filterFromGroup.date} 23:59:59`)
      } else {
        // 否则使用今天的 23:59:59
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return today
      }
    }

    const handleReset = () => {
      searchForm.gpsi = ''
      searchForm.startTime = ''
      searchForm.endTime = ''
      searchForm.subAppId = ''
      filterFromGroup.gpsi = ''
      filterFromGroup.subAppId = ''
      filterFromGroup.date = ''
      pagination.current = 1
      loadData()
    }

    const handleAdd = () => {
      uploadDialogVisible.value = true
      selectedFiles.value = []
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }

    const handleFileChange = (file, fileList) => {
      // 更新选中的文件列表
      selectedFiles.value = fileList.map(item => ({
        name: item.name,
        size: item.size,
        raw: item.raw,
      }))
    }

    const handleFileRemove = (file, fileList) => {
      // 更新选中的文件列表
      selectedFiles.value = fileList.map(item => ({
        name: item.name,
        size: item.size,
        raw: item.raw,
      }))
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
      if (!selectedFiles.value || selectedFiles.value.length === 0) {
        ElMessage.warning(t('experienceTest.networkData.selectFileFirst'))
        return
      }

      // 验证所有文件类型
      const validExtensions = ['.zip', '.gz', '.tar.gz', '.rar']
      const invalidFiles = []
      
      for (const file of selectedFiles.value) {
        const fileName = file.name.toLowerCase()
        const isValid = validExtensions.some(ext => fileName.endsWith(ext))
        if (!isValid) {
          invalidFiles.push(file.name)
        }
      }
      
      if (invalidFiles.length > 0) {
        ElMessage.error(t('experienceTest.networkData.invalidFileType') + ': ' + invalidFiles.join(', '))
        return
      }

      uploading.value = true
      try {
        // 提取文件对象数组
        const files = selectedFiles.value.map(file => file.raw)
        const response = await uploadNetworkDataFile(files)
        
        if (response.code === 200) {
          const result = response.data
          let message = t('experienceTest.networkData.uploadSuccess')
          
          // 显示解析结果
          if (result.totalNetworkDataCount) {
            message += `\n${t('experienceTest.networkData.totalNetworkDataCount')}: ${result.totalNetworkDataCount}`
          }
          if (result.successCount) {
            message += `\n${t('experienceTest.networkData.successCount')}: ${result.successCount}`
          }
          if (result.failCount && result.failCount > 0) {
            message += `\n${t('experienceTest.networkData.failCount')}: ${result.failCount}`
          }
          
          ElMessage.success(message)
          uploadDialogVisible.value = false
          selectedFiles.value = []
          if (uploadRef.value) {
            uploadRef.value.clearFiles()
          }
          // 刷新数据列表
          if (activeTab.value === 'group') {
            loadGroupData()
          } else {
            loadData()
          }
        } else {
          // 显示后端返回的错误信息
          const errorMsg = response.message || response.data?.error || t('common.error')
          ElMessage.error(errorMsg)
        }
      } catch (error) {
        console.error('Upload error:', error)
        // 优先显示后端返回的错误信息
        const errorMsg = error.response?.data?.message || error.message || t('common.error')
        ElMessage.error(errorMsg)
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

    const handleGroupSizeChange = (val) => {
      groupPagination.size = val
      loadGroupData()
    }

    const handleGroupCurrentChange = (val) => {
      groupPagination.current = val
      loadGroupData()
    }

    // 监听tab切换，加载对应数据
    watch(activeTab, (newTab) => {
      if (newTab === 'group') {
        loadGroupData()
      } else if (newTab === 'detail') {
        loadData()
      }
    })

    onMounted(() => {
      loadGroupData()
    })

    return {
      activeTab,
      loading,
      groupLoading,
      tableData,
      groupTableData,
      pagination,
      groupPagination,
      searchForm,
      groupSearchForm,
      filterFromGroup,
      uploadDialogVisible,
      uploading,
      selectedFiles,
      uploadRef,
      loadData,
      loadGroupData,
      handleAdd,
      handleSearch,
      handleReset,
      handleGroupSearch,
      handleGroupReset,
      handleGpsiInput,
      handleSubAppIdInput,
      getDefaultStartTime,
      getDefaultEndTime,
      handleSizeChange,
      handleCurrentChange,
      handleGroupSizeChange,
      handleGroupCurrentChange,
      handleFileChange,
      handleFileRemove,
      handleUpload,
      handleViewDetail,
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
