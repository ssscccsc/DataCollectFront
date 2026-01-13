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
        <el-select
          v-model="platformType"
          :placeholder="$t('appVersionChange.platformType')"
          style="width: 120px; margin-right: 10px;"
          @change="handlePlatformChange"
        >
          <el-option :label="$t('appVersionChange.android')" :value="false" />
          <el-option :label="$t('appVersionChange.ios')" :value="true" />
        </el-select>
        <el-select
          v-model="dialVersionLatest"
          :placeholder="$t('appVersionChange.dialVersionLatest')"
          style="width: 180px; margin-right: 10px;"
          clearable
          @change="handleSearch"
        >
          <el-option :label="$t('appVersionChange.all')" value="" />
          <el-option :label="$t('appVersionChange.isLatest')" value="true" />
          <el-option :label="$t('appVersionChange.notLatest')" value="false" />
        </el-select>
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
        <el-table-column prop="changeRecord" :label="$t('appVersionChange.changeRecord')" :min-width="columnWidths.changeRecord">
          <template #default="scope">
            <div v-if="scope.row.changeRecord" class="change-record-cell">
              <el-tag type="info" size="small" class="change-record-tag">
                {{ scope.row.changeRecord }}
              </el-tag>
            </div>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="dialVersion" :label="$t('appVersionChange.dialVersion')" :min-width="columnWidths.dialVersion">
          <template #default="scope">
            <span 
              :style="{
                color: scope.row.version === scope.row.dialVersion ? '#67C23A' : '#F56C6C',
                fontWeight: '500'
              }"
            >
              {{ scope.row.dialVersion || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('appVersionChange.autoCollect')" width="180" align="center">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <el-switch
                v-model="scope.row.autoCollect"
                @change="handleAutoCollectChange(scope.row)"
              />
              <el-button
                v-if="scope.row.autoCollect"
                type="text"
                size="small"
                @click="handleSelectTemplate(scope.row)"
                style="padding: 0; margin-left: 8px;"
              >
                {{ getTemplateName(scope.row) || $t('appVersionChange.selectTemplate') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operations')" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="operations-cell">
              <el-button type="primary" size="small" @click="handleStartDialTest(scope.row)">
                {{ $t('appVersionChange.startDialTest') }}
              </el-button>
              <el-button type="info" size="small" @click="handleViewChangeHistory(scope.row)">
                {{ $t('appVersionChange.changeHistory') }}
              </el-button>
            </div>
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

    <!-- 版本历史弹窗 -->
    <el-dialog
      v-model="versionHistoryDialogVisible"
      :title="$t('appVersionChange.changeHistory')"
      width="70%"
      :close-on-click-modal="false"
      class="version-history-dialog"
    >
      <div v-loading="versionHistoryLoading" class="version-history-content">
        <div v-if="versionHistoryData" class="app-info-section">
          <div class="app-info-item">
            <span class="info-label">{{ $t('appVersionChange.appName') }}：</span>
            <div class="app-name-with-icon">
              <img 
                v-if="versionHistoryData.icon" 
                :src="`data:image/png;base64,${versionHistoryData.icon}`" 
                alt="App Icon" 
                class="app-icon-small"
              />
              <span class="app-name-text">{{ versionHistoryData.appName || '-' }}</span>
            </div>
          </div>
          <div class="app-info-item">
            <span class="info-label">{{ $t('appVersionChange.category') }}：</span>
            <span class="info-value">{{ versionHistoryData.appCategory || '-' }}</span>
          </div>
          <div class="app-info-item">
            <span class="info-label">{{ $t('appVersionChange.latestVersion') }}：</span>
            <span class="info-value">{{ versionHistoryData.appVersion || '-' }}</span>
          </div>
          <div class="app-info-item">
            <span class="info-label">{{ $t('appVersionChange.description') }}：</span>
            <div class="info-value-description">
              <span class="info-value">{{ versionHistoryData.appDescription || '-' }}</span>
            </div>
          </div>
          <div class="app-info-item">
            <span class="info-label">{{ $t('appVersionChange.dialVersion') }}：</span>
            <span class="info-value">{{ versionHistoryData.dialVersion || '-' }}</span>
          </div>
        </div>

        <div class="version-list-section">
          <h4 class="section-title">{{ $t('appVersionChange.historyVersion') }}</h4>
          <el-table 
            v-if="versionHistoryData && versionHistoryData.version && versionHistoryData.version.length > 0"
            :data="versionHistoryData.version"
            stripe
            style="width: 100%"
            :max-height="400"
          >
            <el-table-column 
              prop="version" 
              :label="$t('appVersionChange.historyVersion')" 
              min-width="150"
              align="center"
            >
              <template #default="scope">
                <span>{{ scope.row.version || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column 
              prop="changeLog" 
              :label="$t('appVersionChange.changeRecord')" 
              min-width="300"
              show-overflow-tooltip
            >
              <template #default="scope">
                <span>{{ scope.row.changeLog || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column 
              prop="versionUpdateDate" 
              :label="$t('appVersionChange.updateTime')" 
              min-width="180"
              align="center"
            >
              <template #default="scope">
                <span>{{ scope.row.versionUpdateDate || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else :description="$t('appVersionChange.noVersionHistory')" :image-size="80" />
        </div>
      </div>
      <template #footer>
        <el-button @click="versionHistoryDialogVisible = false">{{ $t('common.cancel') }}</el-button>
      </template>
    </el-dialog>

    <!-- 选择采集任务模版对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="$t('appVersionChange.selectTemplate')"
      width="50%"
      :close-on-click-modal="false"
      @close="handleTemplateDialogClose"
    >
      <el-select
        v-model="selectedTemplateId"
        :placeholder="$t('appVersionChange.selectTemplatePlaceholder')"
        style="width: 100%;"
        filterable
        clearable
      >
        <el-option
          v-for="template in templateOptions"
          :key="template.id"
          :label="template.name"
          :value="template.id"
        >
          <div>
            <div style="font-weight: 500;">{{ template.name }}</div>
            <div v-if="template.description" style="font-size: 12px; color: #909399; margin-top: 4px;">
              {{ template.description }}
            </div>
          </div>
        </el-option>
      </el-select>
      <template #footer>
        <el-button @click="templateDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirmTemplate">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
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
    const router = useRouter()
    const loading = ref(false)
    const tableData = ref([])
    const searchKeyword = ref('')
    const platformType = ref(false) // 平台类型：false=安卓, true=iOS，默认安卓
    const dialVersionLatest = ref('') // 拨测版本是否最新：''全部, 'true'是最新, 'false'不是最新
    const allData = ref([]) // 保存所有已加载的数据
    
    // 版本历史弹窗相关
    const versionHistoryDialogVisible = ref(false)
    const versionHistoryLoading = ref(false)
    const versionHistoryData = ref(null)
    
    // 自动采集相关
    const autoCollectConfigs = ref({}) // 存储自动采集配置 { appName: config }
    const templateDialogVisible = ref(false)
    const templateOptions = ref([])
    const selectedTemplateId = ref(null)
    const currentEditingRow = ref(null)
    const isFromSwitchChange = ref(false) // 标记对话框是否由开关变化触发

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    // 根据比例计算列宽（基础单位：12px）
    // 应用名称15%, 类别10%, 简介25%, 版本15%, 时间10%, 变更记录18%, 拨测版本12%, 操作列10%
    const baseUnit = 12
    const columnWidths = reactive({
      appName: 15 * baseUnit,      // 180px (15%)
      category: 10 * baseUnit,     // 120px (10%)
      description: 25 * baseUnit,  // 300px (25%)
      version: 15 * baseUnit,      // 180px (15%)
      updateTime: 10 * baseUnit,   // 120px (10%)
      changeRecord: 18 * baseUnit, // 216px (18%)
      dialVersion: 12 * baseUnit,  // 144px (12%)
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
        const appName = item.app_name || '-'
        // 从配置中获取自动采集信息
        const config = autoCollectConfigs.value[appName]
        
        return {
          appName: appName,
          icon: item.icon || null,
          category: item.app_category || '-',
          description: item.app_description || '-',
          version: item.app_version || '-',
          updateTime: item.version_update_date || '-',
          changeRecord: item.change_log || '-',
          dialVersion: item.dial_verion || '-',
          autoCollect: config ? config.autoCollect : false,
          templateId: config ? config.templateId : null,
          templateName: config ? config.templateName : null,
        }
      })
    }

    // 根据搜索关键词和分页信息更新表格数据
    const updateTableData = () => {
      let filteredData = allData.value
      
      // 如果有搜索关键词，只从 appName 中查找
      if (searchKeyword.value && searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        filteredData = filteredData.filter((item) => {
          return item.appName && item.appName.toLowerCase().includes(keyword)
        })
      }
      
      // 如果选择了拨测版本是否最新筛选
      if (dialVersionLatest.value !== '') {
        const isLatest = dialVersionLatest.value === 'true'
        filteredData = filteredData.filter((item) => {
          const versionMatch = item.version === item.dialVersion
          return isLatest ? versionMatch : !versionMatch
        })
      }
      
      // 前端分页处理
      const start = (pagination.current - 1) * pagination.size
      const end = start + pagination.size
      tableData.value = filteredData.slice(start, end)
      pagination.total = filteredData.length
    }

    // 加载自动采集配置
    const loadAutoCollectConfigs = async (appNames) => {
      if (!appNames || appNames.length === 0) {
        return
      }
      
      try {
        const response = await request.get('/app-version-auto-collect/batch', {
          params: {
            appNames: appNames.join(','),
            platformType: platformType.value,
          },
        })
        
        if (response.data) {
          const configMap = response.data
          // 加载模版名称
          for (const [appName, config] of Object.entries(configMap)) {
            if (config.templateId) {
              try {
                const templateRes = await request.get(`/collect-task-template/${config.templateId}`)
                if (templateRes.data) {
                  config.templateName = templateRes.data.name
                }
              } catch (e) {
                console.error('加载模版名称失败:', e)
              }
            }
            autoCollectConfigs.value[appName] = config
          }
        }
      } catch (error) {
        console.error('加载自动采集配置失败:', error)
      }
    }
    
    // 加载采集任务模版列表
    const loadTemplateOptions = async () => {
      try {
        const response = await request.get('/collect-task-template/list')
        if (response.data) {
          templateOptions.value = response.data
        }
      } catch (error) {
        console.error('加载模版列表失败:', error)
        ElMessage.error(t('appVersionChange.loadTemplateFailed') || '加载模版列表失败')
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        const response = await request.post('/external/apps/get_version_history', {
          is_ios: platformType.value,
        })
        
        if (response.code === 200 && response.message === 'success' && response.data) {
          // 提取所有应用名称
          const appNames = response.data.map(item => item.app_name || '').filter(name => name)
          
          // 加载自动采集配置
          await loadAutoCollectConfigs(appNames)
          
          // 映射API数据到表格数据并保存
          allData.value = mapApiDataToTableData(response.data)
          
          // 重置搜索和分页
          pagination.current = 1
          updateTableData()
        } else {
          allData.value = []
          tableData.value = []
          pagination.total = 0
        }
      } catch (error) {
        ElMessage.error(t('appVersionChange.loadDataFailed') || '加载数据失败')
        allData.value = []
        tableData.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    const handlePlatformChange = () => {
      // 平台切换时重新加载数据
      loadData()
    }

    const handleSearch = () => {
      pagination.current = 1
      updateTableData()
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      updateTableData()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      updateTableData()
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

    const handleStartDialTest = (row) => {
      // 携带 app 信息跳转到新建采集任务页面
      router.push({
        name: 'CollectTask',
        query: {
          fromAppVersion: 'true',
          appName: row.appName || '',
          appVersion: row.version || '',
          appCategory: row.category || '',
          appDescription: row.description || '',
        },
      })
    }

    const handleViewChangeHistory = async (row) => {
      versionHistoryDialogVisible.value = true
      versionHistoryLoading.value = true
      versionHistoryData.value = null
      
      try {
        const response = await request.post('/external/apps/get_single_app_version_history', {
          app_name: row.appName || '',
          is_ios: platformType.value,
        })
        
        if (response.message === 'success' && response.data) {
          versionHistoryData.value = response.data
        } else {
          ElMessage.error(response.message || t('appVersionChange.loadDataFailed'))
          versionHistoryData.value = null
        }
      } catch (error) {
        ElMessage.error(t('appVersionChange.loadDataFailed') || '加载版本历史失败')
        versionHistoryData.value = null
      } finally {
        versionHistoryLoading.value = false
      }
    }
    
    // 处理自动采集开关变化
    const handleAutoCollectChange = async (row) => {
      try {
        // 如果启用自动采集但未绑定模版，弹出选择模版对话框
        if (row.autoCollect && !row.templateId) {
          currentEditingRow.value = row
          selectedTemplateId.value = null
          isFromSwitchChange.value = true
          templateDialogVisible.value = true
          // 如果模版列表未加载，先加载
          if (templateOptions.value.length === 0) {
            await loadTemplateOptions()
          }
          return
        }
        
        // 保存配置
        await saveAutoCollectConfig(row)
      } catch (error) {
        console.error('保存自动采集配置失败:', error)
        // 恢复开关状态
        row.autoCollect = !row.autoCollect
        ElMessage.error(t('appVersionChange.saveConfigFailed') || '保存配置失败')
      }
    }
    
    // 处理模版对话框关闭
    const handleTemplateDialogClose = () => {
      // 如果对话框是由开关变化触发的，且用户取消了，需要恢复开关状态
      if (isFromSwitchChange.value && currentEditingRow.value) {
        currentEditingRow.value.autoCollect = false
        isFromSwitchChange.value = false
      }
      currentEditingRow.value = null
      selectedTemplateId.value = null
    }
    
    // 选择模版
    const handleSelectTemplate = (row) => {
      currentEditingRow.value = row
      selectedTemplateId.value = row.templateId || null
      templateDialogVisible.value = true
      // 如果模版列表未加载，先加载
      if (templateOptions.value.length === 0) {
        loadTemplateOptions()
      }
    }
    
    // 确认选择模版
    const handleConfirmTemplate = async () => {
      if (!currentEditingRow.value) {
        return
      }
      
      if (!selectedTemplateId.value) {
        ElMessage.warning(t('appVersionChange.templateRequired') || '请选择采集任务模版')
        return
      }
      
      try {
        // 更新当前行的模版信息
        currentEditingRow.value.templateId = selectedTemplateId.value
        const selectedTemplate = templateOptions.value.find(t => t.id === selectedTemplateId.value)
        if (selectedTemplate) {
          currentEditingRow.value.templateName = selectedTemplate.name
        }
        
        // 保存配置
        await saveAutoCollectConfig(currentEditingRow.value)
        
        templateDialogVisible.value = false
        isFromSwitchChange.value = false
        currentEditingRow.value = null
        selectedTemplateId.value = null
      } catch (error) {
        console.error('保存模版配置失败:', error)
        ElMessage.error(t('appVersionChange.saveConfigFailed') || '保存配置失败')
      }
    }
    
    // 保存自动采集配置
    const saveAutoCollectConfig = async (row) => {
      try {
        const response = await request.post('/app-version-auto-collect', {
          appName: row.appName,
          platformType: platformType.value,
          autoCollect: row.autoCollect,
          templateId: row.autoCollect ? row.templateId : null,
        })
        
        if (response.code === 200) {
          // 更新配置缓存
          if (row.autoCollect) {
            autoCollectConfigs.value[row.appName] = {
              autoCollect: true,
              templateId: row.templateId,
              templateName: row.templateName,
            }
          } else {
            delete autoCollectConfigs.value[row.appName]
          }
          
          ElMessage.success(t('appVersionChange.saveConfigSuccess') || '配置保存成功')
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存自动采集配置失败:', error)
        throw error
      }
    }
    
    // 获取模版名称
    const getTemplateName = (row) => {
      if (row.templateName) {
        return row.templateName
      }
      return null
    }

    onMounted(() => {
      loadData()
      loadTemplateOptions()
    })

    return {
      loading,
      tableData,
      searchKeyword,
      platformType,
      dialVersionLatest,
      pagination,
      handlePlatformChange,
      columnWidths,
      versionHistoryDialogVisible,
      versionHistoryLoading,
      versionHistoryData,
      loadData,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleStartDialTest,
      handleViewChangeHistory,
      formatDateTime,
      getChangeTypeTag,
      getChangeTypeText,
      handleAutoCollectChange,
      handleSelectTemplate,
      handleConfirmTemplate,
      handleTemplateDialogClose,
      getTemplateName,
      templateDialogVisible,
      templateOptions,
      selectedTemplateId,
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

.version-history-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

.version-history-content {
  height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-info-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.app-info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  min-height: 32px;
}

.app-info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #606266;
  flex: 1;
}

.info-value-description {
  flex: 1;
  max-height: 72px; /* 固定3行的高度 (24px * 3) */
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-all;
  padding: 2px 0;
}

.info-value-description .info-value {
  display: block;
  white-space: normal;
  line-height: 24px;
  word-break: break-word;
  margin: 0;
}

.app-name-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.app-icon-small {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
}

.app-name-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.version-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  flex-shrink: 0;
}

.operations-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.operations-cell .el-button {
  flex-shrink: 0;
}

.change-record-cell {
  height: 72px; /* 固定3行的高度 (24px * 3) */
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-all;
  padding: 2px 0;
}

.change-record-tag {
  display: block;
  white-space: normal;
  line-height: 24px;
  word-break: break-word;
  margin: 0;
}

/* 自定义滚动条样式 */
.change-record-cell::-webkit-scrollbar {
  width: 6px;
}

.change-record-cell::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.change-record-cell::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.change-record-cell::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 简介滚动条样式 */
.info-value-description::-webkit-scrollbar {
  width: 6px;
}

.info-value-description::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.info-value-description::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.info-value-description::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>



    }
    
    // 获取模版名称
    const getTemplateName = (row) => {
      if (row.templateName) {
        return row.templateName
      }
      return null
    }

    onMounted(() => {
      loadData()
      loadTemplateOptions()
    })

    return {
      loading,
      tableData,
      searchKeyword,
      platformType,
      dialVersionLatest,
      pagination,
      handlePlatformChange,
      columnWidths,
      versionHistoryDialogVisible,
      versionHistoryLoading,
      versionHistoryData,
      loadData,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleStartDialTest,
      handleViewChangeHistory,
      formatDateTime,
      getChangeTypeTag,
      getChangeTypeText,
      handleAutoCollectChange,
      handleSelectTemplate,
      handleConfirmTemplate,
      handleTemplateDialogClose,
      getTemplateName,
      templateDialogVisible,
      templateOptions,
      selectedTemplateId,
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

.version-history-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

.version-history-content {
  height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-info-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.app-info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  min-height: 32px;
}

.app-info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #606266;
  flex: 1;
}

.info-value-description {
  flex: 1;
  max-height: 72px; /* 固定3行的高度 (24px * 3) */
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-all;
  padding: 2px 0;
}

.info-value-description .info-value {
  display: block;
  white-space: normal;
  line-height: 24px;
  word-break: break-word;
  margin: 0;
}

.app-name-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.app-icon-small {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
}

.app-name-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.version-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  flex-shrink: 0;
}

.operations-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.operations-cell .el-button {
  flex-shrink: 0;
}

.change-record-cell {
  height: 72px; /* 固定3行的高度 (24px * 3) */
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-all;
  padding: 2px 0;
}

.change-record-tag {
  display: block;
  white-space: normal;
  line-height: 24px;
  word-break: break-word;
  margin: 0;
}

/* 自定义滚动条样式 */
.change-record-cell::-webkit-scrollbar {
  width: 6px;
}

.change-record-cell::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.change-record-cell::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.change-record-cell::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 简介滚动条样式 */
.info-value-description::-webkit-scrollbar {
  width: 6px;
}

.info-value-description::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.info-value-description::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.info-value-description::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

