<template>
  <div class="test-case-set-detail-page">
    <div class="page-header">
      <el-button @click="goBack" type="text" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('pageTitle.testCaseSetDetail') }}</h2>
    </div>

    <el-card v-if="testCaseSet" class="test-case-set-info">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ $t('testCaseSet.testCaseSetInfo') }}</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('testCaseSet.testCaseSetName')">
          {{ testCaseSet.name }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.version')">
          {{ testCaseSet.version }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.description')">
          {{ testCaseSet.description || $t('testCaseSet.noDescription') }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.fileSize')">
          {{ formatFileSize(testCaseSet.fileSize) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.status')">
          <el-tag :type="testCaseSet.status === 1 ? 'success' : 'danger'">
            {{ testCaseSet.status === 1 ? $t('testCaseSet.enabled') : $t('testCaseSet.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.createTime')">
          {{ formatDateTime(testCaseSet.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('testCaseSet.fileAccess')" :span="2" v-if="testCaseSet.gohttpserverUrl">
          <el-link 
            type="primary" 
            :href="getReplacedUrl(testCaseSet.gohttpserverUrl)" 
            target="_blank"
            :underline="false"
          >
            <el-icon><Link /></el-icon>
            {{ getShortUrl(testCaseSet.gohttpserverUrl) }}
          </el-link>
          <el-button 
            size="small" 
            type="text" 
            @click="copyUrl(getReplacedUrl(testCaseSet.gohttpserverUrl))"
            style="margin-left: 8px;"
          >
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="test-cases-list">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ $t('testCaseSet.testCases') }} ({{ testCases.length }})</span>
          <div class="header-actions">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="tree">目录视图</el-radio-button>
              <el-radio-button label="table">表格视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 目录视图 -->
      <div v-if="viewMode === 'tree'" v-loading="loading" class="tree-view">
        <el-empty v-if="testCases.length === 0" :description="$t('common.noData')" />
        
        <!-- 第一层：模型场景 -->
        <el-collapse v-model="activeModelScenarios" v-else>
          <el-collapse-item 
            v-for="(scenarioData, scenario) in groupedTestCases" 
            :key="scenario"
            :name="scenario"
          >
            <template #title>
              <div class="collapse-title">
                <el-icon><Folder /></el-icon>
                <span class="title-text">{{ $t('testCaseSet.modelScenario') }}: {{ scenario || $t('collectTask.notConfigured') }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px;">{{ getScenarioCount(scenarioData) }} 个用例</el-tag>
              </div>
            </template>
            
            <!-- 第二层：业务大类 -->
            <el-collapse v-model="activeBusinessCategories[scenario]" class="nested-collapse">
              <el-collapse-item 
                v-for="(categoryData, category) in scenarioData" 
                :key="`${scenario}-${category}`"
                :name="`${scenario}-${category}`"
              >
                <template #title>
                  <div class="collapse-title level-2">
                    <el-icon><FolderOpened /></el-icon>
                    <span class="title-text">{{ $t('testCaseSet.businessCategory') }}: {{ category || $t('collectTask.notConfigured') }}</span>
                    <el-tag size="small" type="success" style="margin-left: 8px;">{{ getCategoryCount(categoryData) }} 个用例</el-tag>
                  </div>
                </template>
                
                <!-- 第三层：APP -->
                <el-collapse v-model="activeApps[`${scenario}-${category}`]" class="nested-collapse">
                  <el-collapse-item 
                    v-for="(appCases, app) in categoryData" 
                    :key="`${scenario}-${category}-${app}`"
                    :name="`${scenario}-${category}-${app}`"
                  >
                    <template #title>
                      <div class="collapse-title level-3">
                        <el-icon><Document /></el-icon>
                        <span class="title-text">{{ $t('testCaseSet.app') }}: {{ app || $t('collectTask.notConfigured') }}</span>
                        <el-tag size="small" type="warning" style="margin-left: 8px;">{{ appCases.length }} 个用例</el-tag>
                      </div>
                    </template>
                    
                    <!-- 用例列表 -->
                    <div class="test-case-list">
                      <el-card 
                        v-for="testCase in appCases" 
                        :key="testCase.id"
                        class="test-case-card"
                        shadow="hover"
                      >
                        <div class="test-case-content">
                          <div class="test-case-header">
                            <h4 class="test-case-name">
                              <el-tag type="primary" size="small" style="margin-right: 8px;">{{ testCase.number }}</el-tag>
                              {{ testCase.name }}
                            </h4>
                          </div>
                          
                          <el-descriptions :column="2" size="small" border>
                            <el-descriptions-item :label="$t('testCaseSet.testCaseNumber')">
                              {{ testCase.number }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('testCaseSet.phoneOsType')">
                              {{ testCase.phoneOsType || $t('collectTask.notConfigured') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('testCaseSet.logicNetwork')" :span="2">
                              <div v-if="testCase.logicNetwork">
                                <el-tag 
                                  v-for="network in testCase.logicNetwork.split(';')" 
                                  :key="network"
                                  size="small"
                                  style="margin-right: 4px; margin-bottom: 4px;"
                                >
                                  {{ network }}
                                </el-tag>
                              </div>
                              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('testCaseSet.testSteps')" :span="2">
                              <div class="test-steps">
                                <pre>{{ testCase.testSteps }}</pre>
                              </div>
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('testCaseSet.expectedResult')" :span="2">
                              <div class="expected-result">
                                <pre>{{ testCase.expectedResult }}</pre>
                              </div>
                            </el-descriptions-item>
                          </el-descriptions>
                        </div>
                      </el-card>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-collapse-item>
            </el-collapse>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 表格视图 -->
      <div v-else v-loading="loading">
        <el-table :data="testCases" style="width: 100%" border stripe>
          <el-table-column prop="name" :label="$t('testCaseSet.testCaseName')" min-width="200" fixed="left" show-overflow-tooltip />
          <el-table-column prop="number" :label="$t('testCaseSet.testCaseNumber')" width="140" align="center" />
          <el-table-column prop="modelScenario" :label="$t('testCaseSet.modelScenario')" width="150" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.modelScenario">{{ scope.row.modelScenario }}</span>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="businessCategory" :label="$t('testCaseSet.businessCategory')" width="140" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.businessCategory">{{ scope.row.businessCategory }}</span>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="app" :label="$t('testCaseSet.app')" width="140" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.app">{{ scope.row.app }}</span>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="appEn" :label="$t('testCaseSet.appEn')" width="140" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.appEn">{{ scope.row.appEn }}</span>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="phoneOsType" :label="$t('testCaseSet.phoneOsType')" width="120" align="center">
            <template #default="scope">
              <span v-if="scope.row.phoneOsType">{{ scope.row.phoneOsType }}</span>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="logicNetwork" :label="$t('testCaseSet.logicNetwork')" min-width="180">
            <template #default="scope">
              <div v-if="scope.row.logicNetwork">
                <el-tag 
                  v-for="network in scope.row.logicNetwork.split(';')" 
                  :key="network"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ network }}
                </el-tag>
              </div>
              <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="testSteps" :label="$t('testCaseSet.testSteps')" min-width="250">
            <template #default="scope">
              <div class="test-steps">
                <pre>{{ scope.row.testSteps }}</pre>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="expectedResult" :label="$t('testCaseSet.expectedResult')" min-width="250">
            <template #default="scope">
              <div class="expected-result">
                <pre>{{ scope.row.expectedResult }}</pre>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Link, CopyDocument, Folder, FolderOpened, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { replaceUrlHost, getShortUrl as getShortUrlUtil } from '@/utils/urlHelper'

export default {
  name: 'TestCaseSetDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t, locale } = useI18n()
    const loading = ref(false)
    const testCaseSet = ref(null)
    const testCases = ref([])
    
    // 视图模式：tree-目录视图，table-表格视图
    const viewMode = ref('tree')
    
    // 折叠面板激活状态
    const activeModelScenarios = ref([])
    const activeBusinessCategories = reactive({})
    const activeApps = reactive({})

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return ''
      const currentLocale = locale.value === 'zh' ? 'zh-CN' : 'en-US'
      return new Date(dateTime).toLocaleString(currentLocale)
    }
    
    // 计算属性：按照 模型场景 -> 业务大类 -> APP 进行分组
    const groupedTestCases = computed(() => {
      const grouped = {}
      
      testCases.value.forEach(testCase => {
        const scenario = testCase.modelScenario || '未配置'
        const category = testCase.businessCategory || '未配置'
        const app = testCase.app || '未配置'
        
        if (!grouped[scenario]) {
          grouped[scenario] = {}
        }
        if (!grouped[scenario][category]) {
          grouped[scenario][category] = {}
        }
        if (!grouped[scenario][category][app]) {
          grouped[scenario][category][app] = []
        }
        
        grouped[scenario][category][app].push(testCase)
      })
      
      return grouped
    })
    
    // 获取模型场景下的用例总数
    const getScenarioCount = (scenarioData) => {
      let count = 0
      Object.values(scenarioData).forEach(categoryData => {
        Object.values(categoryData).forEach(appCases => {
          count += appCases.length
        })
      })
      return count
    }
    
    // 获取业务大类下的用例总数
    const getCategoryCount = (categoryData) => {
      let count = 0
      Object.values(categoryData).forEach(appCases => {
        count += appCases.length
      })
      return count
    }

    // 获取替换后的URL（根据当前页面IP替换）
    const getReplacedUrl = (url) => {
      return replaceUrlHost(url)
    }

    const getShortUrl = (url) => {
      return getShortUrlUtil(url)
    }

    const copyUrl = async (url) => {
      try {
        await navigator.clipboard.writeText(url)
        ElMessage.success(t('testCaseSet.urlCopied'))
      } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        ElMessage.success(t('testCaseSet.urlCopied'))
      }
    }

    const loadTestCaseSet = async () => {
      const id = route.params.id
      if (!id) {
        ElMessage.error(t('testCaseSet.testCaseSetIdRequired'))
        return
      }

      loading.value = true
      try {
        const res = await request({
          url: `/test-case-set/${id}`,
          method: 'get',
        })
        testCaseSet.value = res.data
      } catch (error) {
        console.error('Load test case set failed:', error)
        ElMessage.error(t('testCaseSet.loadDataFailed'))
      } finally {
        loading.value = false
      }
    }

    const loadTestCases = async () => {
      const id = route.params.id
      if (!id) return

      try {
        const res = await request({
          url: `/test-case-set/${id}/test-cases`,
          method: 'get',
        })
        testCases.value = res.data
      } catch (error) {
        console.error('Load test cases failed:', error)
        ElMessage.error(t('testCaseSet.loadDataFailed'))
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    onMounted(() => {
      loadTestCaseSet()
      loadTestCases()
    })

    return {
      loading,
      testCaseSet,
      testCases,
      viewMode,
      activeModelScenarios,
      activeBusinessCategories,
      activeApps,
      groupedTestCases,
      getScenarioCount,
      getCategoryCount,
      formatFileSize,
      formatDateTime,
      getReplacedUrl,
      getShortUrl,
      copyUrl,
      goBack,
    }
  },
}
</script>

<style scoped>
.test-case-set-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  margin-right: 16px;
  font-size: 14px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.test-case-set-info {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-cases-list {
  margin-bottom: 20px;
}

/* 目录视图样式 */
.tree-view {
  padding: 12px;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding: 4px 0;
}

.collapse-title .el-icon {
  font-size: 18px;
  color: #409eff;
}

.collapse-title.level-2 .el-icon {
  color: #67c23a;
}

.collapse-title.level-3 .el-icon {
  color: #e6a23c;
}

.collapse-title .title-text {
  flex: 1;
}

.nested-collapse {
  margin-left: 24px;
  margin-top: 8px;
}

/* 用例卡片样式 */
.test-case-list {
  padding: 12px;
  margin-left: 24px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.test-case-card {
  margin-bottom: 12px;
  border-left: 3px solid #409eff;
}

.test-case-card:last-child {
  margin-bottom: 0;
}

.test-case-content {
  padding: 8px;
}

.test-case-header {
  margin-bottom: 12px;
}

.test-case-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.test-steps,
.expected-result {
  max-height: 100px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
}

.test-steps pre,
.expected-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

/* 滚动条样式 */
.test-steps::-webkit-scrollbar,
.expected-result::-webkit-scrollbar {
  width: 4px;
}

.test-steps::-webkit-scrollbar-track,
.expected-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.test-steps::-webkit-scrollbar-thumb,
.expected-result::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.test-steps::-webkit-scrollbar-thumb:hover,
.expected-result::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
