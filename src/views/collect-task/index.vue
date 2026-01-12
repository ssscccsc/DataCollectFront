<template>
  <div class="collect-task-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.collectTask') }}</h2>
      <p class="page-description">{{ $t('collectTask.description') }}</p>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <el-card>
        <!-- Tab切换 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" @tab-remove="handleTabRemove">
          <el-tab-pane :label="$t('collectTask.taskList')" name="list">
            <div class="table-operations">
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                {{ $t('collectTask.addTask') }}
              </el-button>
              <el-button @click="refreshAllData" :loading="loading">
                <el-icon><Refresh /></el-icon>
                {{ $t('collectTask.refresh') }}
              </el-button>
            </div>

            <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" :label="$t('collectTask.taskId')" width="80" />
        <el-table-column prop="name" :label="$t('collectTask.taskName')">
          <template #default="scope">
            <el-button 
              type="text" 
              @click="handleViewDetail(scope.row)"
              style="color: #409eff; text-decoration: none;"
            >
              {{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('collectTask.status')">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('collectTask.executionProgress')" width="200">
          <template #default="scope">
            <div class="progress-display">
              <div class="progress-info">
                <span class="progress-text">{{ getTableProgressText(scope.row) }}</span>
                <span class="progress-percentage">{{ getTableProgressPercentage(scope.row) }}%</span>
              </div>
              <el-progress 
                :percentage="getTableProgressPercentage(scope.row)" 
                :status="getTableProgressStatus(scope.row)"
                :stroke-width="8"
                :show-text="false"
                :color="getProgressColor(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('collectTask.createTime')" />
        <el-table-column :label="$t('collectTask.operations')" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="danger" 
              @click="handleStop(scope.row)"
              :disabled="scope.row.status === 'STOPPED' || scope.row.status === 'COMPLETED'"
            >
              {{ $t('collectTask.stop') }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('collectTask.delete') }}</el-button>
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

          <!-- 采集任务模版Tab -->
          <el-tab-pane :label="$t('collectTask.templateList')" name="template">
            <div class="table-operations">
              <el-button type="primary" @click="handleAddTemplate">
                <el-icon><Plus /></el-icon>
                {{ $t('collectTask.addTemplate') }}
              </el-button>
              <el-button @click="refreshTemplateData" :loading="templateLoading">
                <el-icon><Refresh /></el-icon>
                {{ $t('collectTask.refresh') }}
              </el-button>
            </div>

            <el-table :data="templateTableData" v-loading="templateLoading" style="width: 100%">
              <el-table-column prop="id" :label="$t('collectTask.templateId')" width="80" />
              <el-table-column prop="name" :label="$t('collectTask.templateName')">
                <template #default="scope">
                  <el-button 
                    type="text" 
                    @click="handleEditTemplate(scope.row)"
                    style="color: #409eff; text-decoration: none;"
                  >
                    {{ scope.row.name }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="description" :label="$t('collectTask.templateDescription')" />
              <el-table-column prop="createTime" :label="$t('collectTask.createTime')" />
              <el-table-column :label="$t('collectTask.operations')" width="150">
                <template #default="scope">
                  <el-button size="small" @click="handleEditTemplate(scope.row)">{{ $t('collectTask.editTemplate') }}</el-button>
                  <el-button size="small" type="danger" @click="handleDeleteTemplate(scope.row)">{{ $t('collectTask.delete') }}</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="templatePagination.current"
                v-model:page-size="templatePagination.size"
                :page-sizes="[10, 20, 50, 100]"
                :total="templatePagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleTemplateSizeChange"
                @current-change="handleTemplateCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 动态任务详情Tab -->
          <el-tab-pane 
            v-for="task in openedTasks"
            :key="task.id"
            :label="`${$t('collectTask.taskDetail')} - ${task.name}`" 
            :name="`detail-${task.id}`"
            closable
          >
            <div v-if="getCurrentTask()" class="task-detail">
              <!-- 基本信息 -->
              <el-card class="detail-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('collectTask.basicInfo') }}</span>
                  </div>
                </template>
                <el-descriptions :column="2" border>
                  <el-descriptions-item :label="$t('collectTask.taskId')">{{ getCurrentTask().id }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('collectTask.taskName')">{{ getCurrentTask().name }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('collectTask.status')">
                    <el-tag :type="getStatusType(getCurrentTask().status)">
                      {{ getStatusText(getCurrentTask().status) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('collectTask.createTime')">{{ getCurrentTask().createTime }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('collectTask.taskDescription')">{{ getCurrentTask().description || $t('collectTask.noDescription') }}</el-descriptions-item>
                </el-descriptions>
              </el-card>

              <!-- 执行进度 -->
              <el-card class="detail-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('collectTask.executionProgressTitle') }}</span>
                    <el-button size="small" @click="refreshTaskProgress">{{ $t('collectTask.refresh') }}</el-button>
                  </div>
                </template>
                <div class="progress-section">
                  <div class="progress-overview">
                    <el-row :gutter="20">
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number">{{ getCalculatedProgress().totalCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.totalCases') }}</div>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number success">{{ getCalculatedProgress().successCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.successCases') }}</div>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number warning">{{ getCalculatedProgress().failedCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.failedCases') }}</div>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number info">{{ getCalculatedProgress().runningCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.runningCases') }}</div>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number danger">{{ getCalculatedProgress().blockedCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.blockedCases') }}</div>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <div class="progress-item">
                          <div class="progress-number">{{ getCalculatedProgress().pendingCount }}</div>
                          <div class="progress-label">{{ $t('collectTask.pendingCases') }}</div>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                  
                  <div class="progress-bar-section">
                    <div class="progress-bar-label">
                      {{ $t('collectTask.progressLabel') }}: {{ getProgressPercentage() }}%
                    </div>
                    <el-progress 
                      :percentage="getProgressPercentage()" 
                      :status="getProgressStatus()"
                      :stroke-width="20"
                    />
                  </div>
                </div>
              </el-card>

              <!-- 质检结果 -->
              <el-card class="detail-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('collectTask.qcResult') }}</span>
                    <el-button size="small" @click="refreshExecutionInstances">{{ $t('collectTask.refresh') }}</el-button>
                  </div>
                </template>
                <div class="qc-result-section">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="qc-result-list">
                        <div v-if="qcResultSummary.length === 0" class="no-qc-data">
                          {{ $t('collectTask.noQcData') }}
                        </div>
                        <div v-else class="qc-result-items">
                          <div 
                            v-for="(item, index) in qcResultSummary" 
                            :key="index"
                            class="qc-result-item"
                          >
                            <div class="qc-error-name">{{ item.name }}</div>
                            <div class="qc-error-count">{{ item.count }}</div>
                          </div>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="qc-chart-container">
                        <div 
                          ref="qcChartRef" 
                          class="qc-chart"
                          v-loading="qcChartLoading"
                        ></div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>

              <!-- 用例例次执行信息 -->
              <el-card class="detail-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('collectTask.executionInstances') }}</span>
                    <el-button size="small" @click="refreshExecutionInstances">{{ $t('collectTask.refresh') }}</el-button>
                  </div>
                </template>
                <div class="instances-section">
                  <el-table :data="executionInstances" v-loading="instancesLoading" style="width: 100%">
                    <el-table-column prop="testCaseId" :label="$t('collectTask.testCaseId')" width="100" />
                    <el-table-column prop="testCaseNumber" :label="$t('collectTask.testCaseNumber')" width="120" />
                    <el-table-column prop="testCaseName" :label="$t('collectTask.testCaseName')" />
                    <el-table-column prop="round" :label="$t('collectTask.round')" width="80" />
                    <el-table-column prop="logicEnvironmentName" :label="$t('collectTask.logicEnvironment')" width="150" />
                    <el-table-column prop="executorIp" :label="$t('collectTask.executorIp')" width="120">
                      <template #default="scope">
                        <el-button 
                          v-if="scope.row.executorIp"
                          type="text" 
                          size="small"
                          @click="openRemoteDesktop(scope.row.executorIp)"
                          style="color: #409eff; text-decoration: none; padding: 0;"
                        >
                          {{ scope.row.executorIp }}
                        </el-button>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('collectTask.executionStatus')" width="100">
                      <template #default="scope">
                        <el-tag :type="getInstanceStatusType(scope.row.status)">
                          {{ getInstanceStatusText(scope.row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="result" :label="$t('collectTask.executionResult')" width="100">
                      <template #default="scope">
                        <el-tag v-if="scope.row.result" :type="getInstanceResultType(scope.row.result)">
                          {{ getInstanceResultText(scope.row.result) }}
                        </el-tag>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="failureReason" :label="$t('collectTask.failureReason')" width="200">
                      <template #default="scope">
                        <div v-if="scope.row.failureReason">
                          <el-tooltip :content="scope.row.failureReason" placement="top" :show-after="500">
                            <span class="failure-reason-text">{{ scope.row.failureReason }}</span>
                          </el-tooltip>
                        </div>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="logFilePath" :label="$t('collectTask.logFilePath')" width="200">
                      <template #default="scope">
                        <div v-if="scope.row.logFilePath">
                          <el-tooltip :content="scope.row.logFilePath" placement="top" :show-after="500">
                            <el-link 
                              v-if="scope.row.logFilePath.startsWith('http')" 
                              type="primary" 
                              :href="getReplacedUrl(scope.row.logFilePath)" 
                              target="_blank"
                              :underline="false"
                            >
                              {{ $t('collectTask.viewLog') }}
                            </el-link>
                            <span v-else class="log-file-path">{{ scope.row.logFilePath }}</span>
                          </el-tooltip>
                        </div>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="collectPath" :label="$t('collectTask.collectPath')" width="200">
                      <template #default="scope">
                        <div v-if="scope.row.collectPath">
                          <el-tooltip :content="scope.row.collectPath" placement="top" :show-after="500">
                            <el-link 
                              v-if="scope.row.collectPath.startsWith('http')" 
                              type="primary" 
                              :href="scope.row.collectPath" 
                              target="_blank"
                              :underline="false"
                            >
                              {{ $t('collectTask.openPath') }}
                            </el-link>
                            <el-button 
                              v-else
                              type="text" 
                              size="small"
                              @click="openCollectPath(scope.row.collectPath)"
                              style="color: #409eff; text-decoration: none; padding: 0;"
                            >
                              {{ scope.row.collectPath }}
                            </el-button>
                          </el-tooltip>
                        </div>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="executionTaskId" :label="$t('collectTask.executionTaskId')" width="200" />
                    <el-table-column prop="createTime" :label="$t('collectTask.createTime')" width="160" />
                    <el-table-column prop="updateTime" :label="$t('collectTask.updateTime')" width="160" />
                  </el-table>
                </div>
              </el-card>
            </div>
            <div v-else class="no-task-selected">
              <el-empty :description="$t('collectTask.noTaskSelected')" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 4步创建对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      top="5vh"
      @close="resetForm"
    >
      <!-- 步骤导航 -->
      <div class="step-navigation">
        <el-steps :active="currentStep" align-center>
          <el-step :title="$t('collectTask.step1Title')" :description="$t('collectTask.step1Desc')" />
          <el-step :title="$t('collectTask.step2Title')" :description="$t('collectTask.step2Desc')" />
          <el-step :title="$t('collectTask.step3Title')" :description="$t('collectTask.step3Desc')" />
        </el-steps>
      </div>
      
      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1：基本信息、采集策略 -->
        <div v-if="currentStep === 0" class="step-panel">
          <!-- 基本信息 -->
          <div class="sub-step-section">
            <h3 class="step-title">{{ $t('collectTask.basicInfoTitle') }}</h3>
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item :label="$t('collectTask.taskNameLabel')" prop="name">
              <el-input v-model="basicForm.name" :placeholder="$t('collectTask.taskNamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('collectTask.taskDescriptionLabel')" prop="description">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                :rows="3"
                :placeholder="$t('collectTask.taskDescriptionPlaceholder')"
              />
            </el-form-item>
          </el-form>
          </div>

          <!-- 网元选择 -->
          <div class="sub-step-section">
            <h3 class="step-title">{{ $t('collectTask.networkElementTitle') }}</h3>
            <el-form
              ref="networkElementFormRef"
              :model="networkElementForm"
              :rules="networkElementRules"
              label-width="120px"
            >
              <el-form-item :label="$t('collectTask.networkElementLabel')" prop="networkElementIds">
                <el-select 
                  v-model="networkElementForm.networkElementIds" 
                  :placeholder="$t('collectTask.networkElementPlaceholder')" 
                  style="width: 100%;" 
                  multiple
                  filterable
                  clearable
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="3"
                  :loading="networkElementLoading"
                  @visible-change="handleNetworkElementVisibleChange"
                >
                  <el-option
                    v-for="item in networkElementOptions"
                    :key="item.networkElement.id"
                    :label="item.networkElement.name"
                    :value="item.networkElement.id"
                  >
                    <span>{{ item.networkElement.name }}</span>
                    <span v-if="item.networkElement.description" style="color: #8492a6; font-size: 12px; margin-left: 10px;">
                      ({{ item.networkElement.description }})
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <div v-if="selectedNetworkElements && selectedNetworkElements.length > 0" class="network-element-info">
                <h4>{{ $t('collectTask.networkElementDetails') }} ({{ selectedNetworkElements.length }})</h4>
                <div v-for="(selectedElement, index) in selectedNetworkElements" :key="selectedElement.networkElement.id" style="margin-bottom: 15px;">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item :label="$t('collectTask.networkElementName')">
                      {{ selectedElement.networkElement.name }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('collectTask.networkElementStatus')">
                      <el-tag v-if="selectedElement.networkElement.status === 1" size="small" type="success">
                        {{ $t('networkElement.enabled') }}
                      </el-tag>
                      <el-tag v-else size="small" type="danger">
                        {{ $t('networkElement.disabled') }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('collectTask.networkElementDescription')" :span="2">
                      {{ selectedElement.networkElement.description || $t('collectTask.notConfigured') }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('networkElement.attributeCount')" :span="2">
                      {{ selectedElement.attributes ? selectedElement.attributes.length : 0 }}
                      <span v-if="selectedElement.attributes && selectedElement.attributes.length > 0" style="margin-left: 10px;">
                        <el-tag
                          v-for="attr in selectedElement.attributes"
                          :key="attr.id"
                          size="small"
                          style="margin-right: 5px;"
                        >
                          {{ attr.attributeName }}: {{ attr.attributeValue || '-' }}
                        </el-tag>
                      </span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-form>
          </div>

          <!-- 采集策略 -->
          <div class="sub-step-section">
            <h3 class="step-title">{{ $t('collectTask.collectStrategyTitle') }}</h3>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 10px;">
                <el-button @click="handleRefreshStrategy" :loading="strategyLoading" size="default">
                  <el-icon><Refresh /></el-icon>
                  {{ $t('common.refresh') }}
                </el-button>
                <el-button v-if="fromAppVersion" type="primary" @click="handleAddStrategy" size="default">
                  <el-icon><Plus /></el-icon>
                  {{ $t('common.add') }}
                </el-button>
              </div>   
          <el-form
            ref="strategyFormRef"
            :model="strategyForm"
            :rules="strategyRules"
            label-width="120px"
          >
            <el-form-item :label="$t('collectTask.collectStrategyLabel')" prop="strategyId">
              <el-select v-model="strategyForm.strategyId" :placeholder="$t('collectTask.collectStrategyPlaceholder')" style="width: 100%;" @change="handleStrategyChange">
                <el-option
                  v-for="item in strategyOptions"
                  :key="item.id"
                  :label="`${item.name} (${item.collectCount}${$t('collectTask.collectCount')})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <div v-if="selectedStrategy" class="strategy-info">
              <h4>{{ $t('collectTask.strategyDetails') }}</h4>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item :label="$t('collectTask.strategyName')">{{ selectedStrategy.name }}</el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.collectIntent')">
                  <el-tag v-if="selectedStrategy.intentName" size="small" type="warning">
                    {{ selectedStrategy.intentName }}
                  </el-tag>
                  <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.collectCount')">{{ selectedStrategy.collectCount }}次</el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.relatedTestCaseSet')">{{ selectedStrategy.testCaseSetName }} ({{ selectedStrategy.testCaseSetVersion }})</el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.businessCategoryFilter')">
                  <el-select 
                    v-model="selectedStrategy.businessCategory" 
                    :placeholder="$t('collectTask.noFilter')" 
                    size="small" 
                    clearable
                    style="width: 100%;"
                  >
                    <el-option 
                      v-for="category in strategyBusinessCategoryOptions" 
                      :key="category" 
                      :label="category"
                      :value="category"
                    />
                  </el-select>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.appFilter')">
                  <el-select 
                    v-model="selectedStrategy.app" 
                    :placeholder="$t('collectTask.noFilter')" 
                    size="small" 
                    clearable
                    style="width: 100%;"
                  >
                    <el-option 
                      v-for="app in strategyAppOptions" 
                      :key="app" 
                      :label="app"
                      :value="app"
                    />
                  </el-select>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('testCaseSet.appEn')">
                  <el-tag v-if="selectedStrategyAppEn" size="small" type="warning">
                    {{ selectedStrategyAppEn }}
                  </el-tag>
                  <span v-else style="color: #909399;">{{ $t('collectTask.noFilter') }}</span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.testCaseCount')" :span="1">
                  <span>{{ getFilteredTestCaseCount() }}个</span>
                  <span v-if="selectedStrategy.businessCategory || selectedStrategy.app" style="color: #909399; margin-left: 8px;">
                    ({{ $t('collectTask.filtered') }})
                  </span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectTask.customParams')" :span="2">
                  <div class="custom-params-section">
                    <div class="custom-params-header">
                      <span>{{ $t('collectTask.customParamsConfig') }}</span>
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="showCustomParamsEditor = !showCustomParamsEditor"
                      >
                        {{ showCustomParamsEditor ? $t('collectTask.collapse') : $t('collectTask.edit') }}
                      </el-button>
                    </div>
                    
                    <!-- 编辑模式 -->
                    <div v-if="showCustomParamsEditor" class="custom-params-editor">
                      <div 
                        v-for="(param, index) in editableCustomParams" 
                        :key="index" 
                        class="param-item"
                      >
                        <el-input 
                          v-model="param.key" 
                          :placeholder="$t('collectTask.paramName')" 
                          style="width: 150px; margin-right: 8px;"
                        />
                        <el-input 
                          v-model="param.value" 
                          :placeholder="$t('collectTask.paramValue')" 
                          style="width: 200px; margin-right: 8px;"
                        />
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeCustomParam(index)"
                          :disabled="editableCustomParams.length === 1"
                        >
                          {{ $t('collectTask.delete') }}
                        </el-button>
                      </div>
                      <el-button 
                        type="primary" 
                        size="small" 
                        @click="addCustomParam"
                        style="margin-top: 8px;"
                      >
                        {{ $t('collectTask.addParam') }}
                      </el-button>
                      <div class="param-actions" style="margin-top: 12px;">
                        <el-button 
                          type="primary" 
                          size="small" 
                          @click="saveCustomParams"
                        >
                          {{ $t('collectTask.save') }}
                        </el-button>
                        <el-button 
                          size="small" 
                          @click="cancelCustomParamsEdit"
                        >
                          {{ $t('collectTask.cancel') }}
                        </el-button>
                      </div>
                    </div>
                    
                    <!-- 只读模式 -->
                    <div v-else>
                      <div v-if="editableCustomParams && editableCustomParams.length > 0">
                        <el-tag 
                          v-for="param in editableCustomParams" 
                          :key="param.key" 
                          size="small" 
                          type="info"
                          style="margin-right: 8px; margin-bottom: 4px;"
                        >
                          {{ param.key }}: {{ param.value }}
                        </el-tag>
                      </div>
                      <span v-else style="color: #909399;">{{ $t('collectTask.noParams') }}</span>
                    </div>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
              
              <!-- 筛选后的用例列表 -->
              <div v-if="selectedStrategy && selectedStrategy.testCaseList && selectedStrategy.testCaseList.length > 0" class="filtered-test-cases">
                <h4>{{ $t('collectTask.filteredTestCases') }}</h4>
                <div class="test-cases-summary">
                  <span class="summary-text">{{ $t('collectTask.totalTestCases', { count: getFilteredTestCaseCount() }) }}</span>
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="showFilteredTestCases = !showFilteredTestCases"
                    v-if="getFilteredTestCaseCount() > 0"
                  >
                    {{ showFilteredTestCases ? $t('collectTask.collapse') : $t('collectTask.expand') }}
                  </el-button>
                </div>
                <div v-if="showFilteredTestCases && getFilteredTestCaseCount() > 0" class="test-cases-table">
                  <el-table :data="getFilteredTestCases()" size="small" max-height="300">
                    <el-table-column prop="name" :label="$t('collectTask.testCaseName')" min-width="150" />
                    <el-table-column prop="number" :label="$t('collectTask.testCaseNumber')" width="100" />
                    <el-table-column prop="businessCategory" :label="$t('collectTask.businessCategoryFilter')" width="120">
                      <template #default="scope">
                        <span v-if="scope.row.businessCategory">{{ scope.row.businessCategory }}</span>
                        <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="app" :label="$t('collectTask.appFilter')" width="100">
                      <template #default="scope">
                        <span v-if="scope.row.app">{{ scope.row.app }}</span>
                        <span v-else style="color: #909399;">{{ $t('collectTask.notConfigured') }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="logicNetwork" :label="$t('collectTask.logicNetwork')" min-width="150">
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
                  </el-table>
                </div>
                <div v-else-if="showFilteredTestCases && getFilteredTestCaseCount() === 0" class="no-filtered-cases">
                  <el-empty :description="'没有符合条件的测试用例'" />
                </div>
              </div>
            </div>
          </el-form>
          </div>
        </div>

        <!-- 步骤2：环境编排 -->
        <div v-if="currentStep === 1" class="step-panel">
          <h3 class="step-title">{{ $t('collectTask.environmentOrchestration') }}</h3>
          <el-form
            ref="environmentFormRef"
            :model="environmentForm"
            :rules="environmentRules"
            label-width="120px"
          >
            <el-form-item :label="$t('collectTask.manufacturerLabel')" prop="manufacturer">
              <el-select 
                v-model="environmentForm.manufacturer" 
                :placeholder="$t('collectTask.manufacturerPlaceholder')" 
                style="width: 100%" 
                multiple
                clearable
              >
                <el-option
                  v-for="item in manufacturerOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('collectTask.networkLabel')" prop="network">
              <el-select 
                v-model="environmentForm.network" 
                :placeholder="$t('collectTask.networkPlaceholder')" 
                style="width: 100%" 
                clearable
              >
                <el-option
                  v-for="item in networkOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('collectTask.regionFilter')" prop="regionId">
              <el-select 
                v-model="environmentForm.regionId" 
                :placeholder="$t('collectTask.regionPlaceholder')" 
                style="width: 100%" 
                clearable
                @change="handleRegionChange"
              >
                <el-option
                  v-for="item in regionOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('collectTask.countryFilter')" prop="countryId">
              <el-select 
                v-model="environmentForm.countryId" 
                :placeholder="$t('collectTask.countryPlaceholder')" 
                style="width: 100%" 
                clearable
                @change="handleCountryChange" 
                :disabled="!environmentForm.regionId"
              >
                <el-option
                  v-for="item in countryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('collectTask.provinceFilter')" prop="provinceId">
              <el-select 
                v-model="environmentForm.provinceId" 
                :placeholder="$t('collectTask.provincePlaceholder')" 
                style="width: 100%" 
                clearable
                @change="handleProvinceChange" 
                :disabled="!environmentForm.countryId"
              >
                <el-option
                  v-for="item in provinceOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('collectTask.cityFilter')" prop="cityId">
              <el-select 
                v-model="environmentForm.cityId" 
                :placeholder="$t('collectTask.cityPlaceholder')" 
                style="width: 100%" 
                clearable
                @change="handleCityChange" 
                :disabled="!environmentForm.provinceId"
              >
                <el-option
                  v-for="item in cityOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <div class="environment-summary">
              <h4>{{ $t('collectTask.environmentConfigSummary') }}</h4>
              <el-alert
                :title="environmentSummary"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </el-form>
          
          <!-- 可用逻辑环境列表 -->
          <div v-if="selectedStrategy && (environmentForm.regionId || environmentForm.countryId || environmentForm.provinceId || environmentForm.cityId)" class="available-environments">
            <h4>{{ $t('collectTask.availableLogicEnvironments') }}</h4>
            <div v-loading="environmentsLoading" class="environments-content">
              <div v-if="availableEnvironments.length === 0" class="no-environments">
                <el-empty :description="$t('collectTask.noAvailableEnvironments')" />
              </div>
              <div v-else class="environments-list">
                <el-card 
                  v-for="env in availableEnvironments" 
                  :key="env.id" 
                  class="environment-card"
                  shadow="hover"
                  :class="{ 
                    'selected': selectedEnvironmentIds.includes(env.id),
                    'disabled': env.status !== 1 || env.onlineStatus !== true
                  }"
                  @click="toggleEnvironmentSelection(env.id)"
                >
                  <div class="environment-header">
                    <h5 class="environment-name" :title="env.name">{{ env.name }}</h5>
                    <div class="environment-status">
                      <!-- 在线状态显示 -->
                      <el-tag 
                        v-if="env.onlineStatus === 'checking'" 
                        type="info" 
                        size="small"
                        style="margin-right: 8px; flex-shrink: 0;"
                      >
                        {{ $t('collectTask.checkingOnline') }}
                      </el-tag>
                      <el-tag 
                        v-else-if="env.onlineStatus === true" 
                        type="success" 
                        size="small"
                        style="margin-right: 8px; flex-shrink: 0;"
                      >
                        {{ $t('collectTask.online') }}
                      </el-tag>
                      <el-tag 
                        v-else-if="env.onlineStatus === false" 
                        type="danger" 
                        size="small"
                        style="margin-right: 8px; flex-shrink: 0;"
                      >
                        {{ $t('collectTask.offline') }}
                      </el-tag>
                      <!-- 环境状态显示 -->
                      <el-tag 
                        :type="env.status === 1 && env.onlineStatus === true ? 'success' : 'danger'" 
                        size="small"
                        style="margin-right: 8px; flex-shrink: 0;"
                      >
                        {{ (env.status === 1 && env.onlineStatus === true) ? $t('collectTask.available') : $t('collectTask.unavailable') }}
                      </el-tag>
                      <el-checkbox 
                        v-model="selectedEnvironmentIds" 
                        :value="env.id"
                        @change="handleEnvironmentSelection"
                        :disabled="env.status !== 1 || env.onlineStatus !== true"
                        style="flex-shrink: 0;"
                        @click.stop
                      />
                    </div>
                  </div>
                  <div class="environment-actions">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click.stop="toggleEnvironmentDetail(env.id)"
                      style="padding: 0;"
                    >
                      {{ expandedEnvironmentIds.includes(env.id) ? $t('collectTask.hideDetail') : $t('collectTask.showDetail') }}
                      <el-icon style="margin-left: 4px;">
                        <ArrowDown v-if="!expandedEnvironmentIds.includes(env.id)" />
                        <ArrowUp v-else />
                      </el-icon>
                    </el-button>
                  </div>
                  <!-- 环境详情（可展开） -->
                  <div v-if="expandedEnvironmentIds.includes(env.id)" class="environment-detail">
                    <div class="environment-info">
                      <p><strong>{{ $t('collectTask.executor') }}：</strong>{{ env.executorName }} ({{ env.executorIpAddress }})</p>
                      <p><strong>{{ $t('collectTask.region') }}：</strong>{{ env.executorRegionName }}</p>
                      <p v-if="env.description"><strong>{{ $t('collectTask.description') }}：</strong>{{ env.description }}</p>
                    </div>
                    <div v-if="env.ueList && env.ueList.length > 0" class="environment-ue">
                      <p><strong>{{ $t('collectTask.ueDevices') }}：</strong></p>
                      <div class="ue-list">
                        <el-tag 
                          v-for="ue in env.ueList" 
                          :key="ue.id" 
                          size="small" 
                          style="margin-right: 8px; margin-bottom: 4px;"
                        >
                          {{ ue.name }} ({{ ue.ueId }})
                        </el-tag>
                      </div>
                    </div>
                    <div v-if="env.networkList && env.networkList.length > 0" class="environment-networks">
                      <p><strong>{{ $t('collectTask.environmentNetworking') }}：</strong></p>
                      <div class="network-list">
                        <el-tag 
                          v-for="network in env.networkList" 
                          :key="network.id" 
                          type="info" 
                          size="small" 
                          style="margin-right: 8px; margin-bottom: 4px;"
                        >
                          {{ network.name }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
            
            <!-- 选择提示 -->
            <div v-if="availableEnvironments.length > 0" class="selection-tip">
              <el-alert
                :title="$t('collectTask.selectedEnvironments', { count: selectedEnvironmentIds.length })"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </div>

        <!-- 步骤3：用例配置 -->
        <div v-if="currentStep === 2" class="step-panel">
          <h3 class="step-title">{{ $t('collectTask.testCaseConfigTitle') }}</h3>
          <div v-if="selectedStrategy && selectedTestCases.length > 0" class="test-case-config-container">
            <el-alert
              :title="$t('collectTask.testCaseConfigTip')"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 16px;"
            >
              <template #default>
                {{ $t('collectTask.testCaseConfigDescription', { count: selectedTestCases.length }) }}
              </template>
            </el-alert>

            <el-collapse v-model="activeTestCaseConfigItems" accordion>
              <el-collapse-item 
                v-for="(testCase, index) in selectedTestCases" 
                :key="testCase.id"
                :name="testCase.id"
              >
                <template #title>
                  <div class="test-case-config-item-title">
                    <el-tag type="primary" size="small" style="margin-right: 8px;">{{ index + 1 }}</el-tag>
                    <strong style="margin-right: 12px;">{{ testCase.name }}</strong>
                    <el-tag size="small" type="info">{{ testCase.number }}</el-tag>
                    <span style="margin-left: auto; margin-right: 12px; font-size: 12px; color: #909399;">
                      <el-icon v-if="getTaskTestCaseExecutionCount(testCase.id) > 0" style="color: #e6a23c;"><Clock /></el-icon>
                      {{ getTaskTestCaseExecutionCount(testCase.id) > 0 ? `${getTaskTestCaseExecutionCount(testCase.id)} 次` : $t('collectTask.notConfigured') }}
                      <el-divider direction="vertical" />
                      <el-icon v-if="getTaskTestCaseParamCount(testCase.id) > 0" style="color: #67c23a;"><Setting /></el-icon>
                      {{ getTaskTestCaseParamCount(testCase.id) > 0 ? `${getTaskTestCaseParamCount(testCase.id)} 个参数` : $t('collectTask.noParams') }}
                    </span>
                  </div>
                </template>
                
                <div class="test-case-config-item-content">
                  <!-- 用例基本信息（直接显示） -->
                  <div class="test-case-info-section" style="margin-bottom: 16px;">
                    <div class="test-case-info-title" style="font-size: 14px; color: #606266; margin-bottom: 12px; font-weight: 600;">
                      <el-icon><InfoFilled /></el-icon>
                      <span style="margin-left: 4px;">{{ $t('collectTask.testCaseInfo') }}</span>
                    </div>
                    <el-descriptions :column="3" border size="small">
                      <el-descriptions-item :label="$t('collectTask.businessCategory')">
                        {{ testCase.businessCategory || $t('collectTask.notConfigured') }}
                      </el-descriptions-item>
                      <el-descriptions-item :label="$t('collectTask.app')">
                        {{ testCase.app || $t('collectTask.notConfigured') }}
                      </el-descriptions-item>
                      <el-descriptions-item :label="$t('collectTask.appen')">
                        {{ testCase.appEn || testCase.appen || $t('collectTask.notConfigured') }}
                      </el-descriptions-item>
                      <el-descriptions-item :label="$t('collectTask.logicNetwork')">
                        <div v-if="testCase.logicNetwork">
                          <el-tag 
                            v-for="network in testCase.logicNetwork.split(';')" 
                            :key="network"
                            size="small"
                            style="margin-right: 4px;"
                          >
                            {{ network }}
                          </el-tag>
                        </div>
                        <span v-else>{{ $t('collectTask.notConfigured') }}</span>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>

                  <!-- 执行次数配置 -->
                  <div class="config-section">
                    <div class="config-section-title">
                      <el-icon><Clock /></el-icon>
                      <span>{{ $t('collectTask.executionConfig') }}</span>
                    </div>
                    <el-input-number
                      v-model="taskTestCaseExecutionCounts[testCase.id]"
                      :min="1"
                      :max="100"
                      :placeholder="$t('collectTask.executionCountPlaceholder')"
                      style="width: 200px;"
                    />
                    <span style="margin-left: 12px; color: #909399; font-size: 12px;">
                      {{ $t('collectTask.executionCountTip') }}
                    </span>
                  </div>

                  <!-- 自定义参数配置 -->
                  <div class="config-section">
                    <div class="config-section-title">
                      <el-icon><Setting /></el-icon>
                      <span>{{ $t('collectTask.testCaseParamsLabel') }}</span>
                      <el-button 
                        type="primary" 
                        size="small" 
                        @click="addTaskTestCaseParam(testCase.id)"
                        :icon="Plus"
                        style="margin-left: auto;"
                      >
                        {{ $t('collectTask.addParam') }}
                      </el-button>
                    </div>
                    
                    <div v-if="!taskTestCaseCustomParams[testCase.id] || taskTestCaseCustomParams[testCase.id].length === 0" class="empty-params-inline">
                      <span style="color: #909399; font-size: 12px;">{{ $t('collectTask.noTestCaseParams') }}</span>
                    </div>
                    
                    <div v-else class="params-list-inline">
                      <div 
                        v-for="(param, paramIndex) in taskTestCaseCustomParams[testCase.id]" 
                        :key="paramIndex" 
                        class="param-item-inline"
                      >
                        <div class="param-index-small">{{ paramIndex + 1 }}</div>
                        <el-select 
                          v-model="param.key" 
                          :placeholder="$t('collectTask.paramKey')" 
                          size="small"
                          filterable
                          allow-create
                          default-first-option
                          clearable
                          style="flex: 1;"
                          @change="handleTaskParamKeyChange(testCase.id, paramIndex)"
                        >
                          <el-option
                            v-for="paramOption in getTaskParamKeyOptions(testCase)"
                            :key="paramOption.paramName"
                            :label="paramOption.paramName"
                            :value="paramOption.paramName"
                          />
                        </el-select>
                        <el-select 
                          v-model="param.value" 
                          :placeholder="$t('collectTask.paramValue')" 
                          size="small"
                          multiple
                          filterable
                          allow-create
                          default-first-option
                          clearable
                          style="flex: 1;"
                        >
                          <el-option
                            v-for="valueOption in getTaskParamValueOptions(testCase.id, paramIndex)"
                            :key="valueOption"
                            :label="valueOption"
                            :value="valueOption"
                          />
                        </el-select>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeTaskTestCaseParam(testCase.id, paramIndex)"
                          :icon="Delete"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div v-else class="no-test-cases">
            <el-empty :description="$t('collectTask.noTestCasesSelected')" />
          </div>
        </div>

      </div>

      <!-- 操作按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('collectTask.cancel') }}</el-button>
          <el-button v-if="currentStep > 0" @click="handlePrevStep">
            <el-icon><ArrowLeft /></el-icon>
            {{ $t('collectTask.prevStep') }}
          </el-button>
          <el-button 
            v-if="currentStep < 2" 
            type="primary" 
            @click="handleNextStep"
            :disabled="!canProceedToNextStep"
          >
            {{ $t('collectTask.nextStep') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button 
            v-if="currentStep === 2" 
            type="success" 
            @click="handleSubmit"
            :loading="submitLoading"
          >
            {{ $t('collectTask.createTask') }}
          </el-button>
        </span>
      </template>
    </el-dialog>


      <div v-if="selectedTask" class="task-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务ID">{{ selectedTask.id }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ selectedTask.name }}</el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusType(selectedTask.status)">
                {{ getStatusText(selectedTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedTask.createTime }}</el-descriptions-item>
            <el-descriptions-item label="任务描述">{{ selectedTask.description || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 执行进度 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>执行进度</span>
              <el-button size="small" @click="refreshTaskProgress">刷新</el-button>
            </div>
          </template>
          <div class="progress-section">
            <div class="progress-overview">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="progress-item">
                    <div class="progress-number">{{ taskProgress.totalCount || 0 }}</div>
                    <div class="progress-label">总用例数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="progress-item">
                    <div class="progress-number success">{{ taskProgress.successCount || 0 }}</div>
                    <div class="progress-label">成功用例数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="progress-item">
                    <div class="progress-number warning">{{ taskProgress.failedCount || 0 }}</div>
                    <div class="progress-label">失败用例数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="progress-item">
                    <div class="progress-number info">{{ taskProgress.runningCount || 0 }}</div>
                    <div class="progress-label">执行中用例数</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <div class="progress-bar-section">
              <div class="progress-bar-label">
                执行进度: {{ getProgressPercentage() }}%
              </div>
              <el-progress 
                :percentage="getProgressPercentage()" 
                :status="getProgressStatus()"
                :stroke-width="20"
              />
            </div>
          </div>
        </el-card>

        <!-- 执行结果统计 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>执行结果统计</span>
            </div>
          </template>
          <div class="statistics-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-card success">
                  <div class="stat-icon">✓</div>
                  <div class="stat-content">
                    <div class="stat-number">{{ taskProgress.successCount || 0 }}</div>
                    <div class="stat-label">成功执行</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card danger">
                  <div class="stat-icon">✗</div>
                  <div class="stat-content">
                    <div class="stat-number">{{ taskProgress.failedCount || 0 }}</div>
                    <div class="stat-label">执行失败</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card info">
                  <div class="stat-icon">⏳</div>
                  <div class="stat-content">
                    <div class="stat-number">{{ taskProgress.runningCount || 0 }}</div>
                    <div class="stat-label">执行中</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 用例例次执行信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>用例例次执行信息</span>
              <el-button size="small" @click="refreshExecutionInstances">刷新</el-button>
            </div>
          </template>
          <div class="instances-section">
            <el-table :data="executionInstances" v-loading="instancesLoading" style="width: 100%">
              <el-table-column prop="testCaseId" label="用例ID" width="100" />
              <el-table-column prop="testCaseNumber" label="用例编号" width="120" />
              <el-table-column prop="testCaseName" label="用例名称" />
              <el-table-column prop="round" label="轮次" width="80" />
              <el-table-column prop="logicEnvironmentName" label="逻辑环境" width="150" />
              <el-table-column prop="executorIp" label="执行机IP" width="120" />
              <el-table-column prop="status" label="执行状态" width="100">
                <template #default="scope">
                  <el-tag :type="getInstanceStatusType(scope.row.status)">
                    {{ getInstanceStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="result" label="执行结果" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.result" :type="getInstanceResultType(scope.row.result)">
                    {{ getInstanceResultText(scope.row.result) }}
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="failureReason" label="失败原因" width="200">
                <template #default="scope">
                  <div v-if="scope.row.failureReason">
                    <el-tooltip :content="scope.row.failureReason" placement="top" :show-after="500">
                      <span class="failure-reason-text">{{ scope.row.failureReason }}</span>
                    </el-tooltip>
                  </div>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="executionTaskId" label="执行任务ID" width="200" />
              <el-table-column prop="createTime" label="创建时间" width="160" />
              <el-table-column prop="updateTime" label="更新时间" width="160" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button 
                      v-if="scope.row.executionTaskId" 
                      type="text" 
                      size="small"
                      @click="viewInstanceResult(scope.row)"
                    >
                      查看详情
                    </el-button>
                    <el-button 
                      v-if="scope.row.executorIp" 
                      type="text" 
                      size="small"
                      @click="openRemoteLoginDialog(scope.row)"
                      style="margin-left: 8px;"
                    >
                      登录执行机
                    </el-button>
                    <span v-if="!scope.row.executionTaskId && !scope.row.executorIp">-</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 远程登录弹窗 -->
    <el-dialog
      v-model="remoteLoginDialogVisible"
      :title="$t('collectTask.remoteLogin')"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="remote-login-content">
        <el-form :model="remoteLoginForm" :rules="remoteLoginRules" ref="remoteLoginFormRef" label-width="100px">
          <el-form-item :label="$t('collectTask.executorInfo')">
            <div class="executor-info">
              <p><strong>{{ $t('collectTask.ipAddress') }}：</strong>{{ remoteLoginForm.executorIp }}</p>
              <p><strong>{{ $t('collectTask.logicEnvironmentName') }}：</strong>{{ remoteLoginForm.logicEnvironmentName }}</p>
            </div>
          </el-form-item>
          
          <el-form-item :label="$t('collectTask.operatingSystem')" prop="osType">
            <el-radio-group v-model="remoteLoginForm.osType">
              <el-radio label="linux">Linux</el-radio>
              <el-radio label="windows">Windows</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('collectTask.connectionMethod')" prop="connectionType">
            <el-radio-group v-model="remoteLoginForm.connectionType">
              <el-radio label="ssh" v-if="remoteLoginForm.osType === 'linux'">{{ $t('collectTask.ssh') }}</el-radio>
              <el-radio label="rdp" v-if="remoteLoginForm.osType === 'windows'">{{ $t('collectTask.rdp') }}</el-radio>
              <el-radio label="vnc" v-if="remoteLoginForm.osType === 'linux'">{{ $t('collectTask.vnc') }}</el-radio>
            </el-radio-group>
            <div v-if="remoteLoginForm.connectionType === 'rdp'" class="connection-tip">
              <el-alert 
                :title="$t('collectTask.rdpConnectionTip')" 
                type="info" 
                :closable="false"
                show-icon
              >
                <template #default>
                  <p>• {{ $t('collectTask.rdpTip1') }}</p>
                  <p>• {{ $t('collectTask.rdpTip2') }}</p>
                  <p>• {{ $t('collectTask.rdpTip3') }}</p>
                </template>
              </el-alert>
            </div>
          </el-form-item>

          <el-form-item :label="$t('collectTask.username')" prop="username">
            <el-input v-model="remoteLoginForm.username" :placeholder="$t('collectTask.usernamePlaceholder')" />
          </el-form-item>

          <el-form-item :label="$t('collectTask.password')" prop="password">
            <el-input 
              v-model="remoteLoginForm.password" 
              type="password" 
              :placeholder="$t('collectTask.passwordPlaceholder')"
              show-password
            />
          </el-form-item>

          <el-form-item :label="$t('collectTask.port')" prop="port">
            <el-input-number 
              v-model="remoteLoginForm.port" 
              :min="1" 
              :max="65535"
              :placeholder="$t('collectTask.portPlaceholder')"
            />
          </el-form-item>

          <el-form-item :label="$t('collectTask.operationNote')" prop="operationNote">
            <el-input 
              v-model="remoteLoginForm.operationNote" 
              type="textarea" 
              :rows="3"
              :placeholder="$t('collectTask.operationNotePlaceholder')"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeRemoteLoginDialog">{{ $t('collectTask.cancel') }}</el-button>
          <el-button type="primary" @click="connectRemoteMachine" :loading="connecting">
            {{ $t('collectTask.connect') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, ArrowDown, ArrowUp, Delete, Setting, Clock, ArrowLeft, ArrowRight, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import * as echarts from 'echarts'
import { replaceUrlHost } from '@/utils/urlHelper'

export default {
  name: 'CollectTask',
  components: {
    Plus,
    Refresh,
    ArrowDown,
    ArrowUp,
    Delete,
    Setting,
    Clock,
    ArrowLeft,
    ArrowRight,
    InfoFilled,
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const submitLoading = ref(false)
    const strategyLoading = ref(false)
    const fromAppVersion = ref(false) // 是否从app版本变更页面跳转过来
    const appInfo = ref({}) // 保存app信息
    
    // 模版相关
    const templateLoading = ref(false)
    const templateTableData = ref([])
    const templatePagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })
    const isTemplateMode = ref(false) // 是否为模版模式
    const editingTemplateId = ref(null) // 正在编辑的模版ID
    
    // Tab相关
    const activeTab = ref('list')
    const openedTasks = ref([]) // 已打开的任务列表
    
    // 任务详情相关
    const taskProgress = ref({})
    const executionInstances = ref([])
    const instancesLoading = ref(false)
    
    // 质检结果相关
    const qcChartRef = ref(null)
    const qcChartLoading = ref(false)
    let qcChart = null
    let resizeHandler = null
    
    // 表单引用
    const basicFormRef = ref()
    const networkElementFormRef = ref()
    const strategyFormRef = ref()
    const environmentFormRef = ref()
    
    // 选项数据
    const strategyOptions = ref([])
    const regionOptions = ref([])
    const countryOptions = ref([])
    const provinceOptions = ref([])
    const cityOptions = ref([])
    
    // 选中的策略
    const selectedStrategy = ref(null)
    const selectedStrategyAppLabel = computed(() => {
      if (!selectedStrategy.value || !selectedStrategy.value.app) {
        return ''
      }
      // 直接返回策略中的app字段值（这是筛选条件，通常是中文app名称）
      console.log('selectedStrategyAppLabel - selectedStrategy.value:', selectedStrategy.value)
      console.log('selectedStrategyAppLabel - app value:', selectedStrategy.value.app)
      return selectedStrategy.value.app
    })
    
    const selectedStrategyAppEn = computed(() => {
      if (!selectedStrategy.value || !selectedStrategy.value.app) {
        return ''
      }
      // 在策略包含 testCaseList 时，尝试从用例中反查 appEn 名称
      const list = selectedStrategy.value.testCaseList || []
      console.log('selectedStrategyAppEn - testCaseList:', list)
      console.log('selectedStrategyAppEn - looking for app:', selectedStrategy.value.app)
      const hit = list.find(tc => tc.app === selectedStrategy.value.app)
      console.log('selectedStrategyAppEn - found hit:', hit)
      return hit ? (hit.appEn || '') : ''
    })
    
    // 从策略用例列表中提取业务大类选项（基于策略选择的用例）
    const strategyBusinessCategoryOptions = computed(() => {
      if (!selectedStrategy.value || !selectedStrategy.value.testCaseList) {
        return []
      }
      const categories = new Set()
      // 获取策略中已选择的用例ID
      const selectedTestCaseIds = getSelectedTestCaseIds()
      const selectedApp = selectedStrategy.value.app
      
      if (selectedTestCaseIds.length > 0) {
        selectedStrategy.value.testCaseList.forEach(testCase => {
          const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
          if (selectedTestCaseIds.includes(testCaseId) && testCase.businessCategory) {
            // 如果选择了APP，只显示该APP对应的业务大类
            if (selectedApp && testCase.app !== selectedApp) {
              return
            }
            categories.add(testCase.businessCategory)
          }
        })
      } else {
        // 如果没有已选择的用例，从所有用例中提取
        selectedStrategy.value.testCaseList.forEach(testCase => {
          if (testCase.businessCategory) {
            // 如果选择了APP，只显示该APP对应的业务大类
            if (selectedApp && testCase.app !== selectedApp) {
              return
            }
            categories.add(testCase.businessCategory)
          }
        })
      }
      return Array.from(categories).sort()
    })
    
    // 从策略用例列表中提取app选项（基于策略选择的用例）
    const strategyAppOptions = computed(() => {
      if (!selectedStrategy.value || !selectedStrategy.value.testCaseList) {
        return []
      }
      const apps = new Set()
      // 获取策略中已选择的用例ID
      const selectedTestCaseIds = getSelectedTestCaseIds()
      const selectedBusinessCategory = selectedStrategy.value.businessCategory
      
      if (selectedTestCaseIds.length > 0) {
        selectedStrategy.value.testCaseList.forEach(testCase => {
          const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
          if (selectedTestCaseIds.includes(testCaseId) && testCase.app) {
            // 如果选择了业务大类，只显示该业务大类对应的APP
            if (selectedBusinessCategory && testCase.businessCategory !== selectedBusinessCategory) {
              return
            }
            apps.add(testCase.app)
          }
        })
      } else {
        // 如果没有已选择的用例，从所有用例中提取
        selectedStrategy.value.testCaseList.forEach(testCase => {
          if (testCase.app) {
            // 如果选择了业务大类，只显示该业务大类对应的APP
            if (selectedBusinessCategory && testCase.businessCategory !== selectedBusinessCategory) {
              return
            }
            apps.add(testCase.app)
          }
        })
      }
      return Array.from(apps).sort()
    })
    
    // 可用逻辑环境列表
    const availableEnvironments = ref([])
    const environmentsLoading = ref(false)
    
    // 选中的逻辑环境ID列表
    const selectedEnvironmentIds = ref([])
    
    // 展开详情的环境ID列表
    const expandedEnvironmentIds = ref([])
    
    // 步骤控制
    const currentStep = ref(0)
    
    // 用例配置相关
    const activeTestCaseConfigItems = ref(null) // 用例配置展开项（accordion模式，只展开一个）
    const taskTestCaseExecutionCounts = ref({}) // 用例执行次数 { testCaseId: count }
    const taskTestCaseCustomParams = ref({}) // 用例自定义参数 { testCaseId: [{ key: '', value: [] }] }
    const testCaseCustomParamList = ref([]) // 用例自定义参数列表
    const testCaseParamOptions = ref({}) // 每个用例的参数选项 { testCaseId: [paramOptions] }
    
    // 筛选用例相关
    const showFilteredTestCases = ref(false)
    
    // 自定义参数相关
    const showCustomParamsEditor = ref(false)
    const editableCustomParams = ref([])
    const originalCustomParams = ref([])

    // 远程登录相关
    const remoteLoginDialogVisible = ref(false)
    const connecting = ref(false)
    const remoteLoginFormRef = ref()
    const remoteLoginForm = reactive({
      executorIp: '',
      logicEnvironmentName: '',
      osType: 'linux',
      connectionType: 'ssh',
      username: '',
      password: '',
      port: 22,
      operationNote: ''
    })
    const remoteLoginRules = {
      osType: [
        { required: true, message: t('collectTask.osTypeRequired'), trigger: 'change' },
      ],
      connectionType: [
        { required: true, message: t('collectTask.connectionTypeRequired'), trigger: 'change' },
      ],
      username: [
        { required: true, message: t('collectTask.usernameRequired'), trigger: 'blur' },
      ],
      password: [
        { required: true, message: t('collectTask.passwordRequired'), trigger: 'blur' },
      ],
      port: [
        { required: true, message: t('collectTask.portRequired'), trigger: 'blur' },
      ],
      operationNote: [
        { required: true, message: t('collectTask.operationNoteRequired'), trigger: 'blur' },
      ],
    }

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    // 步骤1：基本信息表单
    const basicForm = reactive({
      name: '',
      description: '',
    })

    const basicRules = {
      name: [
        { required: true, message: t('collectTask.taskNameRequired'), trigger: 'blur' },
      ],
    }

    // 网元选择表单
    const networkElementForm = reactive({
      networkElementIds: [],
    })

    const networkElementRules = {
      networkElementIds: [
        // 网元选择为可选，不设置必填验证
      ],
    }

    // 网元选项列表
    const networkElementOptions = ref([])
    const networkElementLoading = ref(false)
    const selectedNetworkElements = computed(() => {
      if (!networkElementForm.networkElementIds || networkElementForm.networkElementIds.length === 0) {
        return []
      }
      return networkElementOptions.value.filter(item => 
        networkElementForm.networkElementIds.includes(item.networkElement.id)
      )
    })

    // 加载网元列表
    const loadNetworkElementList = async () => {
      if (networkElementLoading.value) {
        return
      }
      try {
        networkElementLoading.value = true
        const response = await request({
          url: '/network-element/page',
          method: 'get',
          params: {
            current: 1,
            size: 1000, // 加载所有网元
          },
        })
        if (response && response.data && response.data.records) {
          networkElementOptions.value = response.data.records
        }
      } catch (error) {
        console.error('加载网元列表失败:', error)
        ElMessage.error(t('collectTask.loadNetworkElementListFailed'))
      } finally {
        networkElementLoading.value = false
      }
    }

    // 网元选择器打开时加载数据
    const handleNetworkElementVisibleChange = (visible) => {
      if (visible && networkElementOptions.value.length === 0) {
        loadNetworkElementList()
      }
    }

    // 步骤2：采集策略表单
    const strategyForm = reactive({
      strategyId: null,
    })

    const strategyRules = {
      strategyId: [
        { required: true, message: t('collectTask.collectStrategyRequired'), trigger: 'change' },
      ],
    }

    // 厂商选项
    const manufacturerOptions = [
      { label: '小米', value: 'xiaomi' },
      { label: 'OPPO', value: 'oppo' },
      { label: 'vivo', value: 'vivo' },
      { label: '三星', value: 'samsung' },
      { label: '荣耀', value: 'honor' },
      { label: '华为', value: 'huawei' },
      { label: '苹果', value: 'apple' },
      { label: '华为海思', value: 'hisilicon' },
    ]

    // 获取所有厂商的值
    const getAllManufacturerValues = () => {
      return manufacturerOptions.map(item => item.value)
    }

    // 步骤2：环境编排表单
    const environmentForm = reactive({
      manufacturer: [],
      network: null,
      regionId: null,
      countryId: null,
      provinceId: null,
      cityId: null,
    })

    // 网络选项
    const networkOptions = [
      { label: 'normal', value: 'normal' },
      { label: 'weak', value: 'weak' },
      { label: 'congestion', value: 'congestion' },
      { label: 'weakcongestion', value: 'weakcongestion' },
      { label: 'sunshang', value: 'sunshang' },
    ]

    const environmentRules = {
      regionId: [
        { required: true, message: t('collectTask.regionRequired'), trigger: 'change' },
      ],
    }
    
    // 逻辑环境选择验证
    const validateEnvironmentSelection = () => {
      if (selectedEnvironmentIds.value.length === 0) {
        ElMessage.error(t('collectTask.selectAtLeastOneEnvironment'))
        return false
      }
      return true
    }



    const getStatusType = (status) => {
      const typeMap = {
        'RUNNING': 'success',
        'COMPLETED': 'success',
        'STOPPED': 'info',
        'PAUSED': 'warning',
      }
      return typeMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const textMap = {
        'RUNNING': t('collectTask.statusRunning'),
        'COMPLETED': t('collectTask.statusCompleted'),
        'STOPPED': t('collectTask.statusStopped'),
        'PAUSED': t('collectTask.statusPaused'),
        'FAILED': t('collectTask.statusFailed'),
      }
      return textMap[status] || t('collectTask.statusUnknown')
    }

    // 表格进度相关方法
    const getTableProgressText = (row) => {
      const total = row.totalCount || 0
      const completed = row.completedCount || 0
      const success = row.successCount || 0
      const failed = row.failedCount || 0
      const blocked = row.blockedCount || 0
      const running = row.runningCount || 0
      
      if (total === 0) {
        return t('collectTask.noData')
      }
      
      const parts = []
      if (success > 0) parts.push(`${success}${t('collectTask.progressSuccess')}`)
      if (failed > 0) parts.push(`${failed}${t('collectTask.progressFailed')}`)
      if (blocked > 0) parts.push(`${blocked}${t('collectTask.progressBlocked')}`)
      if (running > 0) parts.push(`${running}${t('collectTask.progressRunning')}`)
      
      return `${completed}/${total} (${parts.join(', ')})`
    }

    const getTableProgressPercentage = (row) => {
      const total = row.totalCount || 0
      const completed = row.completedCount || 0
      
      if (total === 0) {
        return 0
      }
      
      return Math.round((completed / total) * 100)
    }

    const getTableProgressStatus = (row) => {
      const percentage = getTableProgressPercentage(row)
      
      if (percentage === 100) {
        return 'success'
      }
      
      if (row.status === 'RUNNING') {
        return 'warning'
      }
      
      return ''
    }

    const getProgressColor = (row) => {
      const percentage = getTableProgressPercentage(row)
      
      if (percentage === 100) {
        return '#67c23a'
      }
      
      if (row.status === 'RUNNING') {
        return '#e6a23c'
      }
      
      return '#409eff'
    }

    // 计算属性
    const environmentSummary = computed(() => {
      const parts = []
      if (environmentForm.regionId) {
        const region = regionOptions.value.find(r => r.id === environmentForm.regionId)
        if (region) parts.push(region.name)
      }
      if (environmentForm.countryId) {
        const country = countryOptions.value.find(c => c.id === environmentForm.countryId)
        if (country) parts.push(country.name)
      }
      if (environmentForm.provinceId) {
        const province = provinceOptions.value.find(p => p.id === environmentForm.provinceId)
        if (province) parts.push(province.name)
      }
      if (environmentForm.cityId) {
        const city = cityOptions.value.find(c => c.id === environmentForm.cityId)
        if (city) parts.push(city.name)
      }
      return parts.length > 0 ? parts.join(' / ') : '未配置环境'
    })

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        const res = await request({
          url: '/collect-task/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
        
        // 为每个任务加载真实的执行状态数据
        await loadTaskExecutionStatus()
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 加载任务执行状态数据
    const loadTaskExecutionStatus = async () => {
      try {
        const promises = tableData.value.map(async (task) => {
          try {
            const res = await request({
              url: `/collect-task/${task.id}/execution-instances`,
              method: 'get',
            })
            
            const instances = res.data || []
            const totalCount = instances.length
            const successCount = instances.filter(instance => instance.result === 'SUCCESS').length
            const failedCount = instances.filter(instance => instance.result === 'FAILED').length
            const blockedCount = instances.filter(instance => instance.result === 'BLOCKED').length
            const runningCount = instances.filter(instance => instance.status === 'RUNNING').length
            // 只要不是执行中，都算作已完成
            const completedCount = instances.filter(instance => instance.status !== 'RUNNING').length
            
            // 更新任务数据
            task.totalCount = totalCount
            task.successCount = successCount
            task.failedCount = failedCount
            task.runningCount = runningCount
            task.completedCount = completedCount
            
          } catch (error) {
            console.error(`加载任务 ${task.id} 执行状态失败:`, error)
            // 如果获取失败，使用默认值
            task.totalCount = 0
            task.successCount = 0
            task.failedCount = 0
            task.runningCount = 0
            task.completedCount = 0
          }
        })
        
        await Promise.all(promises)
      } catch (error) {
        console.error('加载任务执行状态失败:', error)
      }
    }

    // 刷新所有数据（包括任务列表和执行状态）
    const refreshAllData = async () => {
      loading.value = true
      try {
        await loadData()
        ElMessage.success(t('collectTask.dataRefreshSuccess'))
      } catch (error) {
        console.error('刷新数据失败:', error)
        ElMessage.error(t('collectTask.dataRefreshFailed'))
      } finally {
        loading.value = false
      }
    }

    const loadStrategyOptions = async () => {
      strategyLoading.value = true
      try {
        const res = await request({
          url: '/collect-strategy/list',
          method: 'get',
        })
        strategyOptions.value = res.data
        ElMessage.success(t('collectTask.strategyRefreshSuccess'))
      } catch (error) {
        console.error('加载策略数据失败:', error)
        ElMessage.error(t('collectTask.strategyRefreshFailed'))
      } finally {
        strategyLoading.value = false
      }
    }

    // 刷新采集策略
    const handleRefreshStrategy = () => {
      loadStrategyOptions()
    }

    // 新增采集策略（打开新标签页）
    const handleAddStrategy = () => {
      const query = {
        action: 'add',
      }
      
      // 如果从app版本变更页面跳转过来，传递app信息
      if (fromAppVersion.value && appInfo.value.appName) {
        query.fromAppVersion = 'true'
        query.appName = appInfo.value.appName || ''
        query.appVersion = appInfo.value.appVersion || ''
        query.appCategory = appInfo.value.appCategory || ''
        query.appDescription = appInfo.value.appDescription || ''
      }
      
      const url = router.resolve({
        name: 'CollectStrategy',
        query,
      }).href
      window.open(url, '_blank')
    }

    const loadRegionOptions = async () => {
      try {
        const res = await request({
          url: '/region/list',
          method: 'get',
        })
        // 只显示顶级地域（level=1）的信息
        regionOptions.value = res.data.filter(region => region.level === 1)
      } catch (error) {
        console.error('加载地域数据失败:', error)
      }
    }

    const loadCountryOptions = async (regionId) => {
      try {
        const res = await request({
          url: `/region/parent/${regionId}`,
          method: 'get',
        })
        // 只显示国家级别（level=2）的数据
        countryOptions.value = res.data.filter(region => region.level === 2)
      } catch (error) {
        console.error('加载国家数据失败:', error)
      }
    }

    const loadProvinceOptions = async (countryId) => {
      try {
        const res = await request({
          url: `/region/parent/${countryId}`,
          method: 'get',
        })
        // 只显示省份级别（level=3）的数据
        provinceOptions.value = res.data.filter(region => region.level === 3)
      } catch (error) {
        console.error('加载省份数据失败:', error)
      }
    }

    const loadCityOptions = async (provinceId) => {
      try {
        const res = await request({
          url: `/region/parent/${provinceId}`,
          method: 'get',
        })
        // 只显示城市级别（level=4）的数据
        cityOptions.value = res.data.filter(region => region.level === 4)
      } catch (error) {
        console.error('加载城市数据失败:', error)
      }
    }
    
    const loadAvailableEnvironments = async () => {
      // 如果没有选择策略或者没有选择任何地域筛选条件，则不加载
      if (!selectedStrategy.value || (!environmentForm.regionId && !environmentForm.countryId && !environmentForm.provinceId && !environmentForm.cityId)) {
        availableEnvironments.value = []
        return
      }
      
      environmentsLoading.value = true
      try {
        const params = {
          strategyId: selectedStrategy.value.id,
          regionId: environmentForm.regionId,
          countryId: environmentForm.countryId,
          provinceId: environmentForm.provinceId,
          cityId: environmentForm.cityId,
          network: environmentForm.network,
        }
        
        // 如果选择了厂商，直接传递数组；如果为空，则传递所有厂商
        if (environmentForm.manufacturer && environmentForm.manufacturer.length > 0) {
          params.manufacturer = environmentForm.manufacturer
        } else {
          params.manufacturer = getAllManufacturerValues()
        }
        
        const res = await request({
          url: '/collect-task/available-logic-environments',
          method: 'get',
          params,
        })
        
        // 初始化环境列表，添加在线状态字段
        const environments = res.data.map(env => ({
          ...env,
          onlineStatus: 'checking', // checking, true, false
        }))
        availableEnvironments.value = environments
        
        // 批量检查执行机在线状态（通过WebSocket）
        await checkExecutorsOnlineStatus(environments)
      } catch (error) {
        console.error('加载可用逻辑环境失败:', error)
        availableEnvironments.value = []
      } finally {
        environmentsLoading.value = false
      }
    }
    
    // 批量检查执行机在线状态（通过WebSocket）
    const checkExecutorsOnlineStatus = async (environments) => {
      // 提取所有执行机IP地址
      const executorIps = environments
        .map(env => env.executorIpAddress)
        .filter(ip => ip != null && ip.trim() !== '')
      
      if (executorIps.length === 0) {
        // 如果没有执行机IP，将所有环境标记为离线
        environments.forEach(env => {
          env.onlineStatus = false
        })
        return
      }
      
      try {
        // 批量检查执行机在线状态
        const res = await request({
          url: '/collect-task/check-executors-online',
          method: 'post',
          data: executorIps,
        })
        
        if (res.data && typeof res.data === 'object') {
          const onlineStatusMap = res.data
          
          // 更新每个环境的在线状态
          environments.forEach(env => {
            if (env.executorIpAddress && onlineStatusMap.hasOwnProperty(env.executorIpAddress)) {
              env.onlineStatus = onlineStatusMap[env.executorIpAddress]
              // 如果执行机不在线，更新环境的status为0（不可用）
              if (!env.onlineStatus) {
                env.status = 0
              }
            } else {
              // 如果没有IP或不在返回结果中，标记为离线
              env.onlineStatus = false
              env.status = 0
            }
          })
        } else {
          // 如果返回数据格式不正确，将所有环境标记为离线
          environments.forEach(env => {
            env.onlineStatus = false
            env.status = 0
          })
        }
      } catch (error) {
        console.error('检查执行机在线状态失败:', error)
        // 检查失败，将所有环境标记为离线
        environments.forEach(env => {
          env.onlineStatus = false
          env.status = 0
        })
      }
    }

    const handleAdd = async () => {
      isTemplateMode.value = false
      editingTemplateId.value = null
      dialogTitle.value = t('collectTask.createTask')
      dialogVisible.value = true
      // 等待 DOM 更新，确保表单已渲染
      await nextTick()
      resetForm()
      loadRegionOptions()
    }
    
    // 新增模版
    const handleAddTemplate = async () => {
      isTemplateMode.value = true
      editingTemplateId.value = null
      dialogTitle.value = t('collectTask.createTemplate')
      dialogVisible.value = true
      // 等待 DOM 更新，确保表单已渲染
      await nextTick()
      resetForm()
      loadRegionOptions()
    }
    
    // 编辑模版
    const handleEditTemplate = async (row) => {
      isTemplateMode.value = true
      editingTemplateId.value = row.id
      dialogTitle.value = t('collectTask.editTemplate')
      dialogVisible.value = true
      // 等待 DOM 更新，确保表单已渲染
      await nextTick()
      resetForm()
      loadRegionOptions()
      
      // 加载模版数据
      try {
        const res = await request({
          url: `/collect-task-template/${row.id}`,
          method: 'get',
        })
        const template = res.data
        
        // 填充表单数据
        basicForm.name = template.name || ''
        basicForm.description = template.description || ''
        
        // 解析网元ID列表
        if (template.networkElementIds) {
          try {
            networkElementForm.networkElementIds = JSON.parse(template.networkElementIds)
          } catch (e) {
            networkElementForm.networkElementIds = []
          }
        } else {
          networkElementForm.networkElementIds = []
        }
        
        // 设置策略
        strategyForm.strategyId = template.collectStrategyId
        if (template.collectStrategyId) {
          await handleStrategyChange(template.collectStrategyId)
        }
        
        // 设置环境信息
        environmentForm.regionId = template.regionId
        environmentForm.countryId = template.countryId
        environmentForm.provinceId = template.provinceId
        environmentForm.cityId = template.cityId
        environmentForm.network = template.network
        
        // 解析厂商列表
        if (template.manufacturer) {
          try {
            environmentForm.manufacturer = JSON.parse(template.manufacturer)
          } catch (e) {
            environmentForm.manufacturer = []
          }
        } else {
          environmentForm.manufacturer = []
        }
        
        // 解析逻辑环境ID列表
        if (template.logicEnvironmentIds) {
          try {
            selectedEnvironmentIds.value = JSON.parse(template.logicEnvironmentIds)
          } catch (e) {
            selectedEnvironmentIds.value = []
          }
        } else {
          selectedEnvironmentIds.value = []
        }
        
        // 解析任务级别自定义参数
        if (template.taskCustomParams) {
          try {
            editableCustomParams.value = JSON.parse(template.taskCustomParams)
          } catch (e) {
            editableCustomParams.value = []
          }
        } else {
          editableCustomParams.value = []
        }
        
        // 解析用例配置
        if (template.customParams) {
          try {
            const customParams = JSON.parse(template.customParams)
            // 恢复用例配置
            customParams.forEach(config => {
              const testCaseId = config.testCaseId
              taskTestCaseExecutionCounts.value[testCaseId] = config.executionCount || 1
              taskTestCaseCustomParams.value[testCaseId] = config.customParams || []
            })
          } catch (e) {
            console.error('解析用例配置失败:', e)
          }
        }
        
        // 加载地域选项
        if (template.regionId) {
          await loadCountryOptions(template.regionId)
        }
        if (template.countryId) {
          await loadProvinceOptions(template.countryId)
        }
        if (template.provinceId) {
          await loadCityOptions(template.provinceId)
        }
        
        // 加载可用逻辑环境
        if (strategyForm.strategyId && environmentForm.regionId) {
          await loadAvailableEnvironments()
        }
        
        // 初始化用例配置
        if (selectedStrategy.value) {
          await initializeTestCaseConfig()
        }
      } catch (error) {
        console.error('加载模版数据失败:', error)
        ElMessage.error('加载模版数据失败')
      }
    }
    
    // 删除模版
    const handleDeleteTemplate = async (row) => {
      try {
        await ElMessageBox.confirm(t('collectTask.deleteConfirm'), t('common.warning'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/collect-task-template/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('collectTask.templateDeletedSuccess'))
        loadTemplateData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('collectTask.templateDeletedFailed'))
        }
      }
    }
    
    // 加载模版数据
    const loadTemplateData = async () => {
      templateLoading.value = true
      try {
        const res = await request({
          url: '/collect-task-template/page',
          method: 'get',
          params: {
            current: templatePagination.current,
            size: templatePagination.size,
          },
        })
        if (res.data) {
          templateTableData.value = res.data.records || []
          templatePagination.total = res.data.total || 0
        }
      } catch (error) {
        console.error('加载模版数据失败:', error)
        ElMessage.error('加载模版数据失败')
      } finally {
        templateLoading.value = false
      }
    }
    
    // 刷新模版数据
    const refreshTemplateData = () => {
      loadTemplateData()
    }
    
    // 模版分页大小改变
    const handleTemplateSizeChange = (size) => {
      templatePagination.size = size
      templatePagination.current = 1
      loadTemplateData()
    }
    
    // 模版当前页改变
    const handleTemplateCurrentChange = (current) => {
      templatePagination.current = current
      loadTemplateData()
    }

    // 策略选择事件处理
    const handleStrategyChange = async (strategyId) => {
      if (strategyId) {
        const strategy = strategyOptions.value.find(s => s.id === strategyId)
        if (strategy) {
          selectedStrategy.value = strategy
          // 加载完整的策略详情
          await loadStrategyDetail(strategyId)
          // 初始化自定义参数
          initializeCustomParams()
          // 如果从app版本变更或top应用监控页面跳转过来，自动设置app筛选
          await setAppFilterFromRoute()
          await loadAvailableEnvironments()
        }
      } else {
        selectedStrategy.value = null
        availableEnvironments.value = []
        // 清空自定义参数
        editableCustomParams.value = []
        originalCustomParams.value = []
      }
    }
    
    // 根据路由参数自动设置app筛选
    const setAppFilterFromRoute = async () => {
      if (!appInfo.value.appName || !selectedStrategy.value || !selectedStrategy.value.testCaseList) {
        return
      }
      
      // 等待计算属性更新
      await nextTick()
      
      // 在策略用例列表中查找匹配的app
      const matchedApp = selectedStrategy.value.testCaseList.find(
        testCase => testCase.app === appInfo.value.appName
      )
      
      if (matchedApp) {
        // 如果找到匹配的app，设置app筛选
        selectedStrategy.value.app = appInfo.value.appName
        console.log('自动设置app筛选:', appInfo.value.appName)
      } else {
        // 如果没有找到匹配的app，尝试在app选项中查找
        await nextTick() // 再次等待，确保计算属性已更新
        const appOptions = strategyAppOptions.value
        const foundApp = appOptions.find(app => app === appInfo.value.appName)
        if (foundApp) {
          selectedStrategy.value.app = appInfo.value.appName
          console.log('自动设置app筛选:', appInfo.value.appName)
        } else {
          console.warn('未找到匹配的app:', appInfo.value.appName, '可用选项:', appOptions)
        }
      }
    }
    
    // 加载策略详情
    const loadStrategyDetail = async (strategyId) => {
      try {
        const res = await request({
          url: `/collect-strategy/${strategyId}`,
          method: 'get',
        })
        if (res.data) {
          // 更新选中的策略信息
          selectedStrategy.value = res.data
          console.log('loadStrategyDetail - loaded strategy:', res.data)
        }
      } catch (error) {
        console.error('加载策略详情失败:', error)
      }
    }
    
    // 初始化自定义参数
    const initializeCustomParams = () => {
      if (selectedStrategy.value && selectedStrategy.value.customParamList) {
        // 深拷贝原始参数
        originalCustomParams.value = JSON.parse(JSON.stringify(selectedStrategy.value.customParamList))
        // 初始化可编辑参数
        editableCustomParams.value = JSON.parse(JSON.stringify(selectedStrategy.value.customParamList))
        
        // 如果没有参数，添加一个空的参数项
        if (editableCustomParams.value.length === 0) {
          editableCustomParams.value.push({ key: '', value: '' })
        }
      } else {
        editableCustomParams.value = [{ key: '', value: '' }]
        originalCustomParams.value = []
      }
      showCustomParamsEditor.value = false
    }
    
    // 添加自定义参数
    const addCustomParam = () => {
      editableCustomParams.value.push({ key: '', value: '' })
    }
    
    // 删除自定义参数
    const removeCustomParam = (index) => {
      editableCustomParams.value.splice(index, 1)
      // 确保至少有一个参数项
      if (editableCustomParams.value.length === 0) {
        editableCustomParams.value.push({ key: '', value: '' })
      }
    }
    
    // 保存自定义参数
    const saveCustomParams = () => {
      // 过滤掉空的参数项
      const validParams = editableCustomParams.value.filter(param => param.key.trim() !== '' && param.value.trim() !== '')
      
      // 检查是否有重复的key
      const keys = validParams.map(param => param.key.trim())
      const uniqueKeys = [...new Set(keys)]
      if (keys.length !== uniqueKeys.length) {
        ElMessage.error(t('collectTask.paramNameCannotBeEmpty'))
        return
      }
      
      // 更新策略中的自定义参数
      if (selectedStrategy.value) {
        selectedStrategy.value.customParamList = validParams
        // 更新原始参数
        originalCustomParams.value = JSON.parse(JSON.stringify(validParams))
      }
      
      showCustomParamsEditor.value = false
      ElMessage.success(t('collectTask.customParamsSaved'))
    }
    
    // 取消自定义参数编辑
    const cancelCustomParamsEdit = () => {
      // 恢复到原始参数
      editableCustomParams.value = JSON.parse(JSON.stringify(originalCustomParams.value))
      if (editableCustomParams.value.length === 0) {
        editableCustomParams.value.push({ key: '', value: '' })
      }
      showCustomParamsEditor.value = false
    }

    // 环境选择事件处理
    const handleRegionChange = async (regionId) => {
      // 如果清除了区域选择，清空下级选项
      if (!regionId) {
        environmentForm.countryId = null
        environmentForm.provinceId = null
        environmentForm.cityId = null
        countryOptions.value = []
        provinceOptions.value = []
        cityOptions.value = []
      } else {
        // 如果选择了区域，清空下级选项并加载国家选项
        environmentForm.countryId = null
        environmentForm.provinceId = null
        environmentForm.cityId = null
        countryOptions.value = []
        provinceOptions.value = []
        cityOptions.value = []
        await loadCountryOptions(regionId)
      }
      await loadAvailableEnvironments()
    }

    const handleCountryChange = async (countryId) => {
      // 如果清除了国家选择，清空下级选项
      if (!countryId) {
        environmentForm.provinceId = null
        environmentForm.cityId = null
        provinceOptions.value = []
        cityOptions.value = []
      } else {
        // 如果选择了国家，清空下级选项并加载省份选项
        environmentForm.provinceId = null
        environmentForm.cityId = null
        provinceOptions.value = []
        cityOptions.value = []
        await loadProvinceOptions(countryId)
      }
      await loadAvailableEnvironments()
    }

    const handleProvinceChange = async (provinceId) => {
      // 如果清除了省份选择，清空下级选项
      if (!provinceId) {
        environmentForm.cityId = null
        cityOptions.value = []
      } else {
        // 如果选择了省份，清空下级选项并加载城市选项
        environmentForm.cityId = null
        cityOptions.value = []
        await loadCityOptions(provinceId)
      }
      await loadAvailableEnvironments()
    }
    
    const handleCityChange = async () => {
      await loadAvailableEnvironments()
    }
    
    // 监听厂商和网络变化，重新加载可用逻辑环境
    watch(() => [environmentForm.manufacturer, environmentForm.network], () => {
      if (selectedStrategy.value && (environmentForm.regionId || environmentForm.countryId || environmentForm.provinceId || environmentForm.cityId)) {
        loadAvailableEnvironments()
      }
    }, { deep: true })
    
    // 监听APP选择变化，自动更新业务大类选项并自动选择
    watch(() => selectedStrategy.value?.app, (newApp, oldApp) => {
      if (!selectedStrategy.value) {
        return
      }
      
      // 如果选择了APP，更新业务大类选项
      if (newApp) {
        // 等待下一个tick，确保计算属性已更新
        nextTick(() => {
          const categories = strategyBusinessCategoryOptions.value
          // 如果只有一个业务大类选项，自动选择
          if (categories.length === 1) {
            selectedStrategy.value.businessCategory = categories[0]
          } else if (categories.length > 1) {
            // 如果有多个选项，检查当前选择的业务大类是否还在选项中
            if (selectedStrategy.value.businessCategory && !categories.includes(selectedStrategy.value.businessCategory)) {
              // 如果当前选择的业务大类不在新选项中，清空选择
              selectedStrategy.value.businessCategory = ''
            }
          } else {
            // 如果没有选项，清空业务大类选择
            selectedStrategy.value.businessCategory = ''
          }
        })
      }
      // 如果清空了APP选择，不清空业务大类选择，让它恢复为所有选项
    })
    
    // 监听业务大类选择变化，自动更新APP选项并自动选择
    watch(() => selectedStrategy.value?.businessCategory, (newCategory, oldCategory) => {
      if (!selectedStrategy.value) {
        return
      }
      
      // 如果选择了业务大类，更新APP选项
      if (newCategory) {
        // 等待下一个tick，确保计算属性已更新
        nextTick(() => {
          const apps = strategyAppOptions.value
          // 如果只有一个APP选项，自动选择
          if (apps.length === 1) {
            selectedStrategy.value.app = apps[0]
          } else if (apps.length > 1) {
            // 如果有多个选项，检查当前选择的APP是否还在选项中
            if (selectedStrategy.value.app && !apps.includes(selectedStrategy.value.app)) {
              // 如果当前选择的APP不在新选项中，清空选择
              selectedStrategy.value.app = ''
            }
          } else {
            // 如果没有选项，清空APP选择
            selectedStrategy.value.app = ''
          }
        })
      }
      // 如果清空了业务大类选择，不清空APP选择，让它恢复为所有选项
    })
    
    // 切换逻辑环境选择
    const toggleEnvironmentSelection = (environmentId) => {
      // 找到对应的环境
      const env = availableEnvironments.value.find(e => e.id === environmentId)
      // 如果环境不可用或执行机不在线，不允许选择
      if (env && (env.status !== 1 || env.onlineStatus !== true)) {
        return
      }
      
      const index = selectedEnvironmentIds.value.indexOf(environmentId)
      if (index > -1) {
        selectedEnvironmentIds.value.splice(index, 1)
      } else {
        selectedEnvironmentIds.value.push(environmentId)
      }
    }
    
    // 切换环境详情展开/收起
    const toggleEnvironmentDetail = (environmentId) => {
      const index = expandedEnvironmentIds.value.indexOf(environmentId)
      if (index > -1) {
        expandedEnvironmentIds.value.splice(index, 1)
      } else {
        expandedEnvironmentIds.value.push(environmentId)
      }
    }
    
    // 处理逻辑环境选择变化
    const handleEnvironmentSelection = () => {
      // 这里可以添加选择变化时的逻辑
    }

    // 获取策略中勾选的用例ID列表
    const getSelectedTestCaseIds = () => {
      if (!selectedStrategy.value) {
        return []
      }
      
      let selectedTestCaseIds = []
      try {
        if (selectedStrategy.value.selectedTestCaseIds) {
          if (typeof selectedStrategy.value.selectedTestCaseIds === 'string') {
            selectedTestCaseIds = JSON.parse(selectedStrategy.value.selectedTestCaseIds)
          } else if (Array.isArray(selectedStrategy.value.selectedTestCaseIds)) {
            selectedTestCaseIds = selectedStrategy.value.selectedTestCaseIds
          }
        }
        // 如果没有selectedTestCaseIds字段，从testCaseExecutionCounts中获取（兼容旧数据）
        if (selectedTestCaseIds.length === 0 && selectedStrategy.value.testCaseExecutionCounts) {
          let executionCounts = {}
          if (typeof selectedStrategy.value.testCaseExecutionCounts === 'string') {
            executionCounts = JSON.parse(selectedStrategy.value.testCaseExecutionCounts)
          } else if (typeof selectedStrategy.value.testCaseExecutionCounts === 'object') {
            executionCounts = selectedStrategy.value.testCaseExecutionCounts
          }
          selectedTestCaseIds = Object.keys(executionCounts)
            .filter(testCaseId => executionCounts[testCaseId] > 0)
            .map(id => parseInt(id))
        }
        // 确保所有ID都是数字类型
        selectedTestCaseIds = selectedTestCaseIds.map(id => typeof id === 'string' ? parseInt(id) : Number(id)).filter(id => !isNaN(id))
      } catch (error) {
        console.warn('Failed to parse selectedTestCaseIds:', error)
        selectedTestCaseIds = []
      }
      
      return selectedTestCaseIds
    }
    
    // 获取策略中勾选的用例列表
    const selectedTestCases = computed(() => {
      if (!selectedStrategy.value || !selectedStrategy.value.testCaseList) {
        return []
      }
      
      const selectedTestCaseIds = getSelectedTestCaseIds()
      
      if (selectedTestCaseIds.length > 0) {
        return selectedStrategy.value.testCaseList.filter(testCase => {
          const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
          // 首先检查是否在已选择的用例ID列表中
          if (!selectedTestCaseIds.includes(testCaseId)) {
            return false
          }
          
          // 然后根据业务大类筛选
          if (selectedStrategy.value.businessCategory && testCase.businessCategory !== selectedStrategy.value.businessCategory) {
            return false
          }
          
          // 最后根据app筛选
          if (selectedStrategy.value.app && testCase.app !== selectedStrategy.value.app) {
            return false
          }
          
          return true
        })
      }
      
      return []
    })
    
    // 获取筛选后的用例数量
    const getFilteredTestCaseCount = () => {
      return selectedTestCases.value.length
    }

    // 获取筛选后的用例列表（只显示策略中勾选的测试用例）
    const getFilteredTestCases = () => {
      return selectedTestCases.value
    }



    const handleStop = async (row) => {
      try {
        await request({
          url: `/collect-task/${row.id}/stop`,
          method: 'post',
        })
        ElMessage.success(t('collectTask.stopSuccess'))
        loadData()
      } catch (error) {
        ElMessage.error(t('collectTask.stopFailed'))
      }
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('collectTask.deleteConfirm'), t('common.warning'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/collect-task/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('collectTask.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('collectTask.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      submitLoading.value = true
      try {
        // 如果当前在步骤3（用例配置页面），表单ref可能已经被销毁（v-if条件）
        // 此时不需要再次验证表单，因为已经在前面步骤验证过了
        // 只需要验证数据完整性即可
        if (currentStep.value === 2) {
          // 步骤3：直接验证数据完整性，不需要表单ref验证
          if (!basicForm.name || !basicForm.name.trim()) {
            ElMessage.error('请填写任务名称')
            submitLoading.value = false
            return
          }
          if (!strategyForm.strategyId) {
            ElMessage.error('请选择采集策略')
            submitLoading.value = false
            return
          }
          if (!environmentForm.regionId) {
            ElMessage.error('请选择地域')
            submitLoading.value = false
            return
          }
          if (!selectedEnvironmentIds.value || selectedEnvironmentIds.value.length === 0) {
            ElMessage.error('请至少选择一个逻辑环境')
            submitLoading.value = false
            return
          }
        } else {
          // 其他步骤：需要验证表单
          await nextTick()
          
          // 检查 ref 是否存在
          if (!basicFormRef.value || !strategyFormRef.value || !environmentFormRef.value) {
            ElMessage.error('表单未初始化，请稍后再试')
            submitLoading.value = false
            return
          }
          
          // 验证所有表单
          await Promise.all([
            basicFormRef.value.validate(),
            strategyFormRef.value.validate(),
            environmentFormRef.value.validate()
          ])
          
          // 验证逻辑环境选择
          if (!validateEnvironmentSelection()) {
            submitLoading.value = false
            return
          }
        }
        
        // 构建用例配置数据
        const customParams = []
        selectedTestCases.value.forEach(testCase => {
          const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
          const executionCount = taskTestCaseExecutionCounts.value[testCaseId] || 1
          const testCaseCustomParams = taskTestCaseCustomParams.value[testCaseId] || []
          
          // 过滤掉空的参数项
          const validParams = testCaseCustomParams
            .filter(param => param.key && param.key.trim() !== '' && param.value && param.value.length > 0)
            .map(param => ({
              key: param.key.trim(),
              value: Array.isArray(param.value) ? param.value : [param.value],
            }))
          
          customParams.push({
            testCaseId: testCaseId,
            executionCount: executionCount,
            customParams: validParams.length > 0 ? validParams : null,
          })
        })
        
        // 构建提交数据
        // 如果厂商为空，则使用所有厂商
        const manufacturerValues = (environmentForm.manufacturer && environmentForm.manufacturer.length > 0)
          ? environmentForm.manufacturer
          : getAllManufacturerValues()
        
        const submitData = {
          name: basicForm.name,
          description: basicForm.description,
          networkElementIds: networkElementForm.networkElementIds,
          collectStrategyId: strategyForm.strategyId,
          collectCount: selectedStrategy.value ? selectedStrategy.value.collectCount : 1,
          manufacturer: manufacturerValues,
          network: environmentForm.network,
          regionId: environmentForm.regionId,
          countryId: environmentForm.countryId,
          provinceId: environmentForm.provinceId,
          cityId: environmentForm.cityId,
          logicEnvironmentIds: selectedEnvironmentIds.value,
          // 添加任务级别自定义参数（过滤掉空的参数项）
          taskCustomParams: editableCustomParams.value
            .filter(param => param.key.trim() !== '' && param.value.trim() !== '')
            .length > 0 
            ? JSON.stringify(editableCustomParams.value.filter(param => param.key.trim() !== '' && param.value.trim() !== ''))
            : null,
          // 添加用例配置
          customParams: customParams.length > 0 ? JSON.stringify(customParams) : null,
        }
        
        // 如果是模版模式，保存模版
        if (isTemplateMode.value) {
          if (editingTemplateId.value) {
            // 编辑模版
            submitData.id = editingTemplateId.value
            await request({
              url: '/collect-task-template',
              method: 'put',
              data: submitData,
            })
            ElMessage.success(t('collectTask.templateUpdatedSuccess'))
          } else {
            // 新增模版
            await request({
              url: '/collect-task-template',
              method: 'post',
              data: submitData,
            })
            ElMessage.success(t('collectTask.templateCreatedSuccess'))
          }
          dialogVisible.value = false
          loadTemplateData()
        } else {
          // 创建任务
          await request({
            url: '/collect-task/create',
            method: 'post',
            data: submitData,
          })
          ElMessage.success(t('collectTask.taskCreatedSuccess'))
          dialogVisible.value = false
          loadData()
        }
      } catch (error) {
        console.error('提交失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error(t('collectTask.taskCreatedFailed'))
        }
      } finally {
        submitLoading.value = false
      }
    }

    const resetForm = () => {
      // 重置表单数据
      Object.assign(basicForm, {
        name: '',
        description: '',
      })
      
      Object.assign(networkElementForm, {
        networkElementIds: [],
      })
      
      Object.assign(strategyForm, {
        strategyId: null,
      })
      
      Object.assign(environmentForm, {
        manufacturer: [],
        network: null,
        regionId: null,
        countryId: null,
        provinceId: null,
        cityId: null,
      })
      
      // 重置选项数据
      networkElementOptions.value = []
      selectedStrategy.value = null
      countryOptions.value = []
      provinceOptions.value = []
      cityOptions.value = []
      
      // 重置逻辑环境选择
      selectedEnvironmentIds.value = []
      availableEnvironments.value = []
      expandedEnvironmentIds.value = []
      
      // 重置步骤
      currentStep.value = 0
      
      // 重置用例配置
      activeTestCaseConfigItems.value = null
      taskTestCaseExecutionCounts.value = {}
      taskTestCaseCustomParams.value = {}
      testCaseCustomParamList.value = []
      testCaseParamOptions.value = {}
      
      // 重置自定义参数
      editableCustomParams.value = []
      originalCustomParams.value = []
      
      // 重置表单验证
      if (basicFormRef.value) {
        basicFormRef.value.resetFields()
      }
      if (networkElementFormRef.value) {
        networkElementFormRef.value.resetFields()
      }
      if (strategyFormRef.value) {
        strategyFormRef.value.resetFields()
      }
      if (environmentFormRef.value) {
        environmentFormRef.value.resetFields()
      }
    }
    
    // 步骤控制方法
    const handleNextStep = async () => {
      if (currentStep.value === 0) {
        // 验证基本信息、采集策略
        try {
          // 确保 DOM 已更新，表单 ref 已初始化
          await nextTick()
          
          // 检查 ref 是否存在
          if (!basicFormRef.value || !strategyFormRef.value) {
            console.warn('表单 ref 未初始化，请稍后再试')
            return
          }
          
          await Promise.all([
            basicFormRef.value.validate(),
            strategyFormRef.value.validate(),
          ])
          
          currentStep.value = 1
        } catch (error) {
          // 验证失败，不切换步骤
          console.error('表单验证失败:', error)
        }
      } else if (currentStep.value === 1) {
        // 验证环境编排
        try {
          // 确保 DOM 已更新，表单 ref 已初始化
          await nextTick()
          
          // 检查 ref 是否存在
          if (!environmentFormRef.value) {
            console.warn('表单 ref 未初始化，请稍后再试')
            return
          }
          
          await environmentFormRef.value.validate()
          
          // 验证逻辑环境选择
          if (!validateEnvironmentSelection()) {
            return
          }
          
          // 初始化用例配置
          await initializeTestCaseConfig()
          currentStep.value = 2
        } catch (error) {
          // 验证失败，不切换步骤
          console.error('表单验证失败:', error)
        }
      }
    }
    
    const handlePrevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    // 判断是否可以进入下一步
    const canProceedToNextStep = computed(() => {
      if (currentStep.value === 0) {
        // 步骤1：需要基本信息、采集策略都完成
        return basicForm.name.trim() !== '' && 
               strategyForm.strategyId !== null
      } else if (currentStep.value === 1) {
        // 步骤2：需要环境编排都完成
        return environmentForm.regionId !== null && 
               selectedEnvironmentIds.value.length > 0
      }
      return true
    })
    
    // 初始化用例配置
    const initializeTestCaseConfig = async () => {
      if (!selectedStrategy.value) {
        return
      }
      
      const testCases = selectedTestCases.value
      
      // 初始化执行次数（从策略中获取，如果没有则默认为1）
      testCases.forEach(testCase => {
        const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
        
        // 从策略的执行次数配置中获取
        let executionCount = 1
        if (selectedStrategy.value.testCaseExecutionCounts) {
          let executionCounts = {}
          if (typeof selectedStrategy.value.testCaseExecutionCounts === 'string') {
            executionCounts = JSON.parse(selectedStrategy.value.testCaseExecutionCounts)
          } else if (typeof selectedStrategy.value.testCaseExecutionCounts === 'object') {
            executionCounts = selectedStrategy.value.testCaseExecutionCounts
          }
          executionCount = executionCounts[testCaseId] || 1
        }
        taskTestCaseExecutionCounts.value[testCaseId] = executionCount
        
        // 初始化自定义参数（从策略中获取，每个用例独立）
        let customParams = []
        if (selectedStrategy.value.testCaseCustomParams) {
          let testCaseCustomParams = {}
          try {
            if (typeof selectedStrategy.value.testCaseCustomParams === 'string') {
              testCaseCustomParams = JSON.parse(selectedStrategy.value.testCaseCustomParams)
            } else if (typeof selectedStrategy.value.testCaseCustomParams === 'object') {
              testCaseCustomParams = selectedStrategy.value.testCaseCustomParams
            }
          } catch (error) {
            console.warn('Failed to parse testCaseCustomParams:', error)
            testCaseCustomParams = {}
          }
          
          // 尝试多种ID格式匹配（字符串ID、数字ID）
          let matchedParams = null
          if (testCaseCustomParams[testCaseId] && Array.isArray(testCaseCustomParams[testCaseId])) {
            matchedParams = testCaseCustomParams[testCaseId]
          } else if (testCaseCustomParams[String(testCaseId)] && Array.isArray(testCaseCustomParams[String(testCaseId)])) {
            matchedParams = testCaseCustomParams[String(testCaseId)]
          }
          
          if (matchedParams && Array.isArray(matchedParams)) {
            // 深拷贝，确保每个用例的参数完全独立
            customParams = JSON.parse(JSON.stringify(matchedParams))
            
            // 确保参数值的格式正确（value应该是数组）
            customParams = customParams.map(param => {
              let valueArray = []
              if (Array.isArray(param.value)) {
                // 如果已经是数组，直接使用
                valueArray = param.value
              } else if (param.value !== null && param.value !== undefined) {
                // 如果是字符串，尝试解析或转换为数组
                if (typeof param.value === 'string') {
                  try {
                    // 尝试解析JSON数组
                    const parsed = JSON.parse(param.value)
                    if (Array.isArray(parsed)) {
                      valueArray = parsed
                    } else {
                      // 如果不是数组，尝试按逗号分隔
                      valueArray = param.value.split(',').map(v => v.trim()).filter(v => v)
                    }
                  } catch {
                    // 解析失败，按逗号分隔
                    valueArray = param.value.split(',').map(v => v.trim()).filter(v => v)
                  }
                } else {
                  // 其他类型，转换为数组
                  valueArray = [String(param.value)]
                }
              }
              
              return {
                key: param.key || '',
                value: valueArray
              }
            })
          }
        }
        
        // 确保每个用例都有独立的参数数组（即使为空）
        // 如果策略中有参数，自动回填；如果没有，初始化为空数组
        taskTestCaseCustomParams.value[testCaseId] = customParams
      })
      
      // 加载用例自定义参数列表（加载完成后会自动为每个用例组装参数选项）
      await loadTestCaseCustomParamList()
      
      // 确保在加载完参数列表后，重新组装参数选项（以防用例列表变化）
      buildTestCaseParamOptions()
    }
    
    // 加载用例自定义参数列表
    const loadTestCaseCustomParamList = async () => {
      try {
        const res = await request({
          url: '/test-case-custom-param/list',
          method: 'get',
        })
        if (res.data) {
          testCaseCustomParamList.value = res.data || []
        } else {
          testCaseCustomParamList.value = []
        }
        
        // 加载完参数列表后，为每个用例组装参数选项
        buildTestCaseParamOptions()
      } catch (error) {
        console.error('加载用例自定义参数列表失败:', error)
        testCaseCustomParamList.value = []
        testCaseParamOptions.value = {}
      }
    }
    
    // 根据每个用例的业务大类和appEn组装参数选项
    const buildTestCaseParamOptions = () => {
      if (!testCaseCustomParamList.value || testCaseCustomParamList.value.length === 0) {
        testCaseParamOptions.value = {}
        return
      }
      
      const options = {}
      
      // 为每个用例计算可用的参数选项
      selectedTestCases.value.forEach(testCase => {
        const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
        const businessCategory = testCase.businessCategory
        const appEn = testCase.appEn || testCase.app || ''
        
        // 根据业务大类和appEn过滤参数选项
        const matchedParams = testCaseCustomParamList.value.filter(param => {
          // 如果参数没有业务大类限制，则所有用例都可以使用
          if (!param.businessCategory && !param.app) {
            return true
          }
          
          // 匹配业务大类
          const businessCategoryMatch = !param.businessCategory || param.businessCategory === businessCategory
          
          // 匹配appEn（参数中的app字段对应用例的appEn）
          const appMatch = !param.app || param.app === appEn
          
          // 如果参数有业务大类或app限制，需要同时匹配
          if (param.businessCategory || param.app) {
            return businessCategoryMatch && appMatch
          }
          
          return true
        })
        
        // 根据 paramName 去重
        const uniqueParams = []
        const seenParamNames = new Set()
        matchedParams.forEach(param => {
          if (param.paramName && !seenParamNames.has(param.paramName)) {
            seenParamNames.add(param.paramName)
            uniqueParams.push(param)
          }
        })
        
        options[testCaseId] = uniqueParams
      })
      
      testCaseParamOptions.value = options
    }
    
    // 获取用例执行次数
    const getTaskTestCaseExecutionCount = (testCaseId) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      return taskTestCaseExecutionCounts.value[id] || 0
    }
    
    // 获取用例参数数量
    const getTaskTestCaseParamCount = (testCaseId) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      const params = taskTestCaseCustomParams.value[id]
      if (!params || !Array.isArray(params)) {
        return 0
      }
      return params.filter(param => param.key && param.key.trim() !== '').length
    }
    
    // 添加用例参数
    const addTaskTestCaseParam = (testCaseId) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      if (!taskTestCaseCustomParams.value[id]) {
        taskTestCaseCustomParams.value[id] = []
      }
      taskTestCaseCustomParams.value[id].push({ key: '', value: [] })
    }
    
    // 删除用例参数
    const removeTaskTestCaseParam = (testCaseId, paramIndex) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      if (taskTestCaseCustomParams.value[id] && taskTestCaseCustomParams.value[id].length > paramIndex) {
        taskTestCaseCustomParams.value[id].splice(paramIndex, 1)
        // 如果删除后数组为空，确保数组存在但为空数组（不强制添加空项）
        if (!taskTestCaseCustomParams.value[id]) {
          taskTestCaseCustomParams.value[id] = []
        }
      }
    }
    
    // 获取当前展开的用例
    const currentExpandedTestCase = computed(() => {
      if (!activeTestCaseConfigItems.value) {
        return null
      }
      const expandedId = typeof activeTestCaseConfigItems.value === 'string' 
        ? parseInt(activeTestCaseConfigItems.value) 
        : Number(activeTestCaseConfigItems.value)
      return selectedTestCases.value.find(tc => {
        const tcId = typeof tc.id === 'string' ? parseInt(tc.id) : Number(tc.id)
        return tcId === expandedId
      }) || null
    })
    
    // 获取参数键选项（使用预组装的参数选项）
    const getTaskParamKeyOptions = (testCase) => {
      // 如果传入了testCase，使用传入的testCase；否则使用当前展开的用例
      const targetTestCase = testCase || currentExpandedTestCase.value
      
      if (!targetTestCase) {
        return []
      }
      
      const testCaseId = typeof targetTestCase.id === 'string' ? parseInt(targetTestCase.id) : Number(targetTestCase.id)
      
      // 使用预组装的参数选项
      if (testCaseParamOptions.value[testCaseId] && Array.isArray(testCaseParamOptions.value[testCaseId])) {
        return testCaseParamOptions.value[testCaseId]
      }
      
      return []
    }
    
    // 获取参数值选项（根据当前展开用例的业务大类和appEn匹配）
    const getTaskParamValueOptions = (testCaseId, paramIndex) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      const params = taskTestCaseCustomParams.value[id]
      if (!params || !params[paramIndex]) {
        return []
      }
      
      const paramKey = params[paramIndex].key
      if (!paramKey) {
        return []
      }
      
      // 优先使用当前展开的用例，如果没有展开则使用传入的testCaseId对应的用例
      let testCase = currentExpandedTestCase.value
      if (!testCase) {
        testCase = selectedTestCases.value.find(tc => {
          const tcId = typeof tc.id === 'string' ? parseInt(tc.id) : Number(tc.id)
          return tcId === id
        })
      }
      
      if (!testCase) {
        return []
      }
      
      // 从预组装的参数选项中查找对应的参数定义
      const testCaseNumber = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
      const availableParams = testCaseParamOptions.value[testCaseNumber] || []
      
      // 从可用参数中查找匹配的参数名
      const matchedParams = availableParams.filter(p => {
        // 参数名必须匹配
        return p.paramName === paramKey
      })
      
      // 合并所有匹配参数的参数值列表，并去重
      const allParamValues = []
      const seenValues = new Set()
      
      matchedParams.forEach(paramDef => {
        if (paramDef.paramValues && Array.isArray(paramDef.paramValues)) {
          paramDef.paramValues.forEach(value => {
            // 确保值是字符串类型，并去重
            const valueStr = String(value).trim()
            if (valueStr && !seenValues.has(valueStr)) {
              seenValues.add(valueStr)
              allParamValues.push(valueStr)
            }
          })
        }
      })
      
      return allParamValues
    }
    
    // 处理参数键变化
    const handleTaskParamKeyChange = (testCaseId, paramIndex) => {
      const id = typeof testCaseId === 'string' ? parseInt(testCaseId) : Number(testCaseId)
      const params = taskTestCaseCustomParams.value[id]
      if (params && params[paramIndex]) {
        // 清空参数值
        params[paramIndex].value = []
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

    // 任务详情相关方法
    const handleViewDetail = async (row) => {
      // 检查任务是否已经打开
      const existingTask = openedTasks.value.find(task => task.id === row.id)
      if (!existingTask) {
        // 添加新任务到已打开列表
        openedTasks.value.push(row)
      }
      
      // 切换到对应的详情tab
      const tabName = `detail-${row.id}`
      activeTab.value = tabName
      
      // 加载任务数据
      await loadTaskProgress(row.id)
      await loadExecutionInstances(row.id)
    }

    const handleTabClick = (tab) => {
      if (tab.props.name === 'list') {
        // 切换到列表tab时，清空数据
        taskProgress.value = {}
        executionInstances.value = []
      } else if (tab.props.name === 'template') {
        // 切换到模版tab时，加载模版数据
        loadTemplateData()
      } else if (tab.props.name.startsWith('detail-')) {
        // 切换到详情tab时，加载对应任务的数据
        const taskId = parseInt(tab.props.name.replace('detail-', ''))
        loadTaskProgress(taskId)
        loadExecutionInstances(taskId)
      }
    }

    const handleTabRemove = (targetName) => {
      // 从已打开列表中移除任务
      const taskId = parseInt(targetName.replace('detail-', ''))
      const index = openedTasks.value.findIndex(task => task.id === taskId)
      if (index > -1) {
        openedTasks.value.splice(index, 1)
      }
      
      // 如果关闭的是当前激活的tab，切换到列表tab
      if (activeTab.value === targetName) {
        activeTab.value = 'list'
        taskProgress.value = {}
        executionInstances.value = []
      }
    }

    // 获取当前tab对应的任务
    const getCurrentTask = () => {
      if (activeTab.value.startsWith('detail-')) {
        const taskId = parseInt(activeTab.value.replace('detail-', ''))
        return openedTasks.value.find(task => task.id === taskId)
      }
      return null
    }

    const loadTaskProgress = async (taskId) => {
      try {
        const res = await request({
          url: `/collect-task/${taskId}/progress`,
          method: 'get',
        })
        taskProgress.value = res.data
      } catch (error) {
        console.error('加载任务进度失败:', error)
        taskProgress.value = {}
      }
    }

    const loadExecutionInstances = async (taskId) => {
      instancesLoading.value = true
      try {
        const res = await request({
          url: `/collect-task/${taskId}/execution-instances`,
          method: 'get',
        })
        executionInstances.value = res.data
        // 更新质检结果图表（延迟确保 DOM 渲染完成）
        setTimeout(() => {
          updateQcResultChart()
        }, 300)
      } catch (error) {
        console.error('加载执行例次失败:', error)
        executionInstances.value = []
      } finally {
        instancesLoading.value = false
      }
    }
    
    // 解析并汇总质检结果
    const parseQcResults = () => {
      const errorMap = new Map()
      
      executionInstances.value.forEach(instance => {
        if (instance.qcResult) {
          try {
            const qcData = JSON.parse(instance.qcResult)
            // qcData 是一个对象，key是错误名称，value是错误值
            Object.keys(qcData).forEach(key => {
              const value = qcData[key]
              // 如果值是数字字符串，转换为数字；否则作为错误名称的一部分
              const errorName = key
              const count = typeof value === 'string' && !isNaN(value) ? parseInt(value) : 1
              
              if (errorMap.has(errorName)) {
                errorMap.set(errorName, errorMap.get(errorName) + count)
              } else {
                errorMap.set(errorName, count)
              }
            })
          } catch (e) {
            console.warn('解析质检结果失败:', instance.qcResult, e)
          }
        }
      })
      
      // 转换为数组并排序（按数量降序）
      return Array.from(errorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }
    
    // 计算属性：质检结果汇总
    const qcResultSummary = computed(() => {
      return parseQcResults()
    })
    
    // 更新质检结果图表
    const updateQcResultChart = () => {
      // 使用 nextTick 确保 DOM 已经渲染
      nextTick(() => {
        // 再次延迟，确保 Tab 切换后 DOM 完全渲染
        setTimeout(() => {
          // 尝试获取 DOM 元素，支持重试
          let chartDom = null
          
          // 方法1: 尝试从 ref 获取
          if (qcChartRef.value) {
            chartDom = qcChartRef.value
          }
          
          // 方法2: 如果 ref 不可用，尝试通过选择器查找
          if (!chartDom || typeof chartDom !== 'object' || chartDom.nodeType !== 1) {
            // 尝试在当前激活的 Tab 中查找图表容器
            const currentTabName = activeTab.value
            if (currentTabName && currentTabName.startsWith('detail-')) {
              // 查找当前 Tab 面板中的图表容器
              const tabPane = document.querySelector(`[aria-labelledby*="${currentTabName}"]`) || 
                             document.querySelector(`[name="${currentTabName}"]`) ||
                             document.querySelector('.el-tab-pane:not([style*="display: none"]) .qc-chart')
              if (tabPane) {
                const domElement = tabPane.querySelector ? tabPane.querySelector('.qc-chart') : 
                                 (tabPane.classList && tabPane.classList.contains('qc-chart') ? tabPane : null)
                if (domElement && domElement.nodeType === 1) {
                  chartDom = domElement
                  console.log('通过选择器找到图表容器')
                  // 更新 ref 引用
                  qcChartRef.value = domElement
                }
              } else {
                // 如果找不到，尝试直接查找可见的图表容器
                const allCharts = document.querySelectorAll('.qc-chart')
                for (let i = 0; i < allCharts.length; i++) {
                  const el = allCharts[i]
                  // 检查元素是否可见（不在隐藏的 Tab 中）
                  const style = window.getComputedStyle(el)
                  if (style.display !== 'none' && style.visibility !== 'hidden') {
                    chartDom = el
                    console.log('通过选择器找到可见的图表容器')
                    // 更新 ref 引用
                    qcChartRef.value = el
                    break
                  }
                }
              }
            }
          }
          
          // 检查是否是有效的 DOM 元素
          if (!chartDom || typeof chartDom !== 'object' || chartDom.nodeType !== 1) {
            console.warn('图表容器不是有效的 DOM 元素:', {
              refValue: qcChartRef.value,
              chartDom: chartDom,
              type: typeof chartDom,
              nodeType: chartDom?.nodeType,
              activeTab: activeTab.value
            })
            // 如果当前在详情 tab，尝试延迟重试
            if (activeTab.value && activeTab.value.startsWith('detail-')) {
              setTimeout(() => {
                updateQcResultChart()
              }, 1000)
            }
            return
          }
          
          const summary = qcResultSummary.value
          console.log('质检结果汇总:', summary)
          
          if (summary.length === 0) {
            if (qcChart) {
              try {
                qcChart.dispose()
              } catch (e) {
                console.warn('销毁图表时出错:', e)
              }
              qcChart = null
            }
            return
          }
          
          // 如果图表已存在，先销毁
          if (qcChart) {
            try {
              qcChart.dispose()
            } catch (e) {
              console.warn('销毁图表时出错:', e)
            }
            qcChart = null
          }
          
          // 初始化图表
          try {
            // 确保传递的是真正的 DOM 元素
            qcChart = echarts.init(chartDom)
            console.log('图表初始化成功，DOM元素:', chartDom, '元素标签:', chartDom.tagName)
          } catch (e) {
            console.error('初始化图表失败:', e, 'DOM元素:', chartDom, '元素类型:', typeof chartDom, 'nodeType:', chartDom?.nodeType)
            // 如果初始化失败，尝试延迟重试
            if (activeTab.value && activeTab.value.startsWith('detail-')) {
              setTimeout(() => {
                updateQcResultChart()
              }, 1000)
            }
            return
          }
          
          // 准备饼图数据
          const pieData = summary.map(item => ({
            value: item.count,
            name: item.name,
          }))
          
          // 配置选项
          const option = {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)',
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              top: 'middle',
            },
            series: [
              {
                name: t('collectTask.qcError'),
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2,
                },
                label: {
                  show: true,
                  formatter: '{b}: {c}\n({d}%)',
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                  },
                },
                data: pieData,
              },
            ],
          }
          
          qcChart.setOption(option)
          console.log('图表配置已设置')
          
          // 响应式调整（避免重复添加监听器）
          if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler)
          }
          resizeHandler = () => {
            if (qcChart) {
              qcChart.resize()
            }
          }
          window.addEventListener('resize', resizeHandler)
        }, 200)
      })
    }
    
    // 监听 qcResultSummary 变化，自动更新图表
    watch(qcResultSummary, () => {
      if (activeTab.value && activeTab.value.startsWith('detail-')) {
        // 延迟一下确保 DOM 渲染完成
        setTimeout(() => {
          updateQcResultChart()
        }, 800)
      }
    }, { deep: true })
    
    // 监听 activeTab 变化，切换 tab 时更新图表
    watch(activeTab, (newTab) => {
      if (newTab && newTab.startsWith('detail-')) {
        // 切换 tab 时，延迟更新图表以确保 DOM 已渲染
        // 使用多次 nextTick 和延迟确保 Tab 内容完全渲染
        nextTick(() => {
          nextTick(() => {
            setTimeout(() => {
              updateQcResultChart()
            }, 1000)
          })
        })
      } else {
        // 切换到列表 tab 时，销毁图表
        if (qcChart) {
          try {
            qcChart.dispose()
          } catch (e) {
            console.warn('销毁图表时出错:', e)
          }
          qcChart = null
        }
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler)
          resizeHandler = null
        }
      }
    })

    const refreshTaskProgress = async () => {
      const currentTask = getCurrentTask()
      if (currentTask) {
        // 重新加载执行例次数据来更新进度计算
        await loadExecutionInstances(currentTask.id)
      }
    }

    const refreshExecutionInstances = async () => {
      const currentTask = getCurrentTask()
      if (currentTask) {
        await loadExecutionInstances(currentTask.id)
      }
    }

    // 基于执行例次数据重新计算进度
    const getProgressPercentage = () => {
      const instances = executionInstances.value || []
      if (instances.length === 0) {
        return 0
      }
      
      const total = instances.length
      const completed = instances.filter(instance => instance.status === 'COMPLETED').length
      return total > 0 ? Math.round((completed / total) * 100) : 0
    }

    const getProgressStatus = () => {
      const percentage = getProgressPercentage()
      if (percentage === 100) {
        return 'success'
      }
      return ''
    }

    // 计算属性：实时重新计算任务进度统计
    const calculatedProgress = computed(() => {
      const instances = executionInstances.value || []
      if (instances.length === 0) {
        return {
          totalCount: 0,
          completedCount: 0,
          successCount: 0,
          failedCount: 0,
          blockedCount: 0,
          runningCount: 0,
          pendingCount: 0
        }
      }
      
      const totalCount = instances.length
      const completedCount = instances.filter(instance => instance.status === 'COMPLETED').length
      const successCount = instances.filter(instance => instance.result === 'SUCCESS').length
      
      // 将所有非SUCCESS的完成状态归类
      const failedCount = instances.filter(instance => 
        instance.status === 'COMPLETED' && 
        instance.result && 
        instance.result !== 'SUCCESS' && 
        !['BLOCKED', 'TIMEOUT', 'PARTIAL_FAILURE'].includes(instance.result)
      ).length
      
      // 将BLOCKED、TIMEOUT、PARTIAL_FAILURE等状态归类为阻塞
      const blockedCount = instances.filter(instance => 
        instance.status === 'COMPLETED' && 
        instance.result && 
        ['BLOCKED', 'TIMEOUT', 'PARTIAL_FAILURE'].includes(instance.result)
      ).length
      
      const runningCount = instances.filter(instance => instance.status === 'RUNNING').length
      const pendingCount = instances.filter(instance => instance.status === 'PENDING').length
      
      return {
        totalCount,
        completedCount,
        successCount,
        failedCount,
        blockedCount,
        runningCount,
        pendingCount
      }
    })

    // 重新计算任务进度统计（保持向后兼容）
    const getCalculatedProgress = () => {
      return calculatedProgress.value
    }

    // 计算属性：基于执行例次重新计算任务状态
    const calculatedTaskStatus = computed(() => {
      const progress = calculatedProgress.value
      
      if (progress.totalCount === 0) {
        return 'PENDING'
      }
      
      if (progress.runningCount > 0) {
        return 'RUNNING'
      }
      
      if (progress.completedCount === progress.totalCount) {
        // 所有用例都已完成
        if (progress.failedCount > 0 || progress.blockedCount > 0) {
          return 'FAILED'
        } else {
          return 'COMPLETED'
        }
      }
      
      if (progress.pendingCount === progress.totalCount) {
        return 'PENDING'
      }
      
      return 'RUNNING'
    })

    const getInstanceStatusType = (status) => {
      const typeMap = {
        'PENDING': 'info',
        'RUNNING': 'warning',
        'COMPLETED': 'success',
        'FAILED': 'danger',
        'STOPPED': 'info',
        'BLOCKED': 'warning',
      }
      return typeMap[status] || 'info'
    }

    const getInstanceStatusText = (status) => {
      const textMap = {
        'PENDING': t('collectTask.statusPending'),
        'RUNNING': t('collectTask.statusRunningInstance'),
        'COMPLETED': t('collectTask.statusCompletedInstance'),
        'FAILED': t('collectTask.statusFailedInstance'),
        'STOPPED': t('collectTask.statusStoppedInstance'),
        'BLOCKED': t('collectTask.statusBlockedInstance'),
      }
      return textMap[status] || t('collectTask.statusBlockedInstance')
    }

    const getInstanceResultType = (result) => {
      const typeMap = {
        'SUCCESS': 'success',
        'FAILED': 'danger',
        'BLOCKED': 'warning',
      }
      return typeMap[result] || 'info'
    }

    const getInstanceResultText = (result) => {
      const textMap = {
        'SUCCESS': t('collectTask.resultSuccess'),
        'FAILED': t('collectTask.resultFailed'),
        'BLOCKED': t('collectTask.resultBlocked'),
      }
      return textMap[result] || t('collectTask.resultBlocked')
    }

    const viewInstanceResult = (instance) => {
      // 这里可以打开一个新的对话框显示执行结果详情
      ElMessage.info(`查看用例 ${instance.testCaseNumber} 第 ${instance.round} 轮执行详情，执行任务ID: ${instance.executionTaskId}`)
    }

    // 打开Windows远程桌面连接
    const openRemoteDesktop = (ipAddress) => {
      if (!ipAddress || ipAddress.trim() === '') {
        ElMessage.warning(t('collectTask.executorIpEmpty'))
        return
      }
      
      try {
        // 生成RDP文件内容
        const rdpContent = generateRdpFileContent(ipAddress.trim())
        
        // 创建Blob对象
        const blob = new Blob([rdpContent], { type: 'application/rdp' })
        const url = window.URL.createObjectURL(blob)
        
        // 创建下载链接并触发下载
        const link = document.createElement('a')
        link.href = url
        link.download = `rdp_${ipAddress.trim()}.rdp`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 释放URL对象
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 100)
        
        ElMessage.success(t('collectTask.remoteDesktopOpening').replace('{ip}', ipAddress))
      } catch (error) {
        console.error('打开远程桌面连接失败:', error)
        ElMessage.error(t('collectTask.remoteDesktopOpenFailed'))
      }
    }

    // 打开归档路径
    const openCollectPath = (path) => {
      if (!path || path.trim() === '') {
        ElMessage.warning(t('collectTask.collectPathEmpty'))
        return
      }
      
      try {
        let processedPath = path.trim()
        
        // 如果路径以 "screenshot" 结尾，去除这个后缀
        if (processedPath.toLowerCase().endsWith('/screenshot') || processedPath.toLowerCase().endsWith('\\screenshot')) {
          processedPath = processedPath.substring(0, processedPath.length - 10).trim()
          // 去除末尾的斜杠
          if (processedPath.endsWith('/') || processedPath.endsWith('\\')) {
            processedPath = processedPath.substring(0, processedPath.length - 1)
          }
        }
        
        // 如果是HTTP/HTTPS链接，直接打开
        if (processedPath.startsWith('http://') || processedPath.startsWith('https://')) {
          window.open(processedPath, '_blank')
          ElMessage.success(t('collectTask.collectPathOpening'))
          return
        }
        
        // 如果是Windows本地路径（如 Z:\ 或 C:\ 开头），复制路径并提示用户手动打开
        if (processedPath.match(/^[A-Za-z]:[\\/]/)) {
          // 由于浏览器安全限制，无法直接打开本地文件路径
          // 复制路径到剪贴板，提示用户在文件资源管理器中打开
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(processedPath).then(() => {
              ElMessage.success({
                message: t('collectTask.collectPathCopiedAndOpenHint', { path: processedPath }),
                duration: 5000,
                showClose: true,
              })
            }).catch(() => {
              // 如果复制失败，显示路径信息
              ElMessage.info({
                message: t('collectTask.collectPathInfo', { path: processedPath }),
                duration: 5000,
                showClose: true,
              })
            })
          } else {
            // 不支持剪贴板API，显示路径信息
            ElMessage.info({
              message: t('collectTask.collectPathInfo', { path: processedPath }),
              duration: 5000,
              showClose: true,
            })
          }
          return
        }
        
        // 其他文件路径，尝试复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(processedPath).then(() => {
            ElMessage.success(t('collectTask.collectPathCopied'))
          }).catch(() => {
            // 如果复制失败，显示路径
            ElMessage.info(t('collectTask.collectPathInfo', { path: processedPath }))
          })
        } else {
          // 不支持剪贴板API，显示路径
          ElMessage.info(t('collectTask.collectPathInfo', { path: processedPath }))
        }
      } catch (error) {
        console.error('打开归档路径失败:', error)
        ElMessage.error(t('collectTask.collectPathOpenFailed'))
      }
    }

    // 生成RDP文件内容
    const generateRdpFileContent = (ipAddress) => {
      const rdpLines = [
        'screen mode id:i:2',
        'use multimon:i:0',
        'desktopwidth:i:1920',
        'desktopheight:i:1080',
        'session bpp:i:32',
        'winposstr:s:0,1,0,0,1920,1080',
        'compression:i:1',
        'keyboardhook:i:2',
        'audiocapturemode:i:0',
        'videoplaybackmode:i:1',
        'connection type:i:7',
        'networkautodetect:i:1',
        'bandwidthautodetect:i:1',
        'enableworkspacereconnect:i:0',
        'disable wallpaper:i:0',
        'allow font smoothing:i:0',
        'allow desktop composition:i:0',
        'disable full window drag:i:1',
        'disable menu anims:i:1',
        'disable themes:i:0',
        'disable cursor setting:i:0',
        'bitmapcachepersistenable:i:1',
        `full address:s:${ipAddress}`,
        'audiomode:i:0',
        'redirectprinters:i:1',
        'redirectcomports:i:0',
        'redirectsmartcards:i:1',
        'redirectclipboard:i:1',
        'redirectposdevices:i:0',
        'autoreconnection enabled:i:1',
        'authentication level:i:2',
        'prompt for credentials:i:0',
        'negotiate security layer:i:1',
        'remoteapplicationmode:i:0',
        'alternate shell:s:',
        'shell working directory:s:',
        'gatewayhostname:s:',
        'gatewayusagemethod:i:4',
        'gatewaycredentialssource:i:4',
        'gatewayprofileusagemethod:i:0',
        'promptcredentialonce:i:0',
        'gatewaybrokeringtype:i:0',
        'use redirection server name:i:0',
        'rdgiskdcproxy:i:0',
        'kdcproxyname:s:',
      ]
      
      return rdpLines.join('\n')
    }

    // 远程登录相关方法
    const openRemoteLoginDialog = (instance) => {
      // 填充执行机信息
      remoteLoginForm.executorIp = instance.executorIp
      remoteLoginForm.logicEnvironmentName = instance.logicEnvironmentName
      
      // 重置表单
      remoteLoginForm.osType = 'linux'
      remoteLoginForm.connectionType = 'ssh'
      remoteLoginForm.username = ''
      remoteLoginForm.password = ''
      remoteLoginForm.port = 22
      remoteLoginForm.operationNote = ''
      
      remoteLoginDialogVisible.value = true
    }

    const closeRemoteLoginDialog = () => {
      remoteLoginDialogVisible.value = false
      // 重置表单
      if (remoteLoginFormRef.value) {
        remoteLoginFormRef.value.resetFields()
      }
    }

    const connectRemoteMachine = async () => {
      if (!remoteLoginFormRef.value) return
      
      try {
        await remoteLoginFormRef.value.validate()
        connecting.value = true
        
        // 调用后端API记录操作日志
        const response = await request({
          url: '/remote-login/log',
          method: 'post',
          data: {
            executorIp: remoteLoginForm.executorIp,
            logicEnvironmentName: remoteLoginForm.logicEnvironmentName,
            osType: remoteLoginForm.osType,
            connectionType: remoteLoginForm.connectionType,
            username: remoteLoginForm.username,
            port: remoteLoginForm.port,
            operationNote: remoteLoginForm.operationNote
          }
        })
        
        if (response.code === 200) {
          const connectionInfo = response.data
          
          // 根据连接类型执行不同的连接逻辑
          if (remoteLoginForm.connectionType === 'ssh') {
            await connectSSH(connectionInfo)
          } else if (remoteLoginForm.connectionType === 'rdp') {
            await connectRDP(connectionInfo)
          } else if (remoteLoginForm.connectionType === 'vnc') {
            await connectVNC(connectionInfo)
          }
          
          ElMessage.success(t('collectTask.connectionSuccess'))
          closeRemoteLoginDialog()
        } else {
          throw new Error(response.message || t('collectTask.connectionFailed'))
        }
        
      } catch (error) {
        console.error('远程连接失败:', error)
        ElMessage.error(t('collectTask.connectionFailed') + '：' + error.message)
      } finally {
        connecting.value = false
      }
    }

    const connectSSH = async (connectionInfo) => {
      // SSH连接逻辑
      const sshCommand = connectionInfo.command
      console.log('SSH连接命令:', sshCommand)
      
      // 复制命令到剪贴板
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(sshCommand)
          ElMessage.success(t('collectTask.sshCommandCopied'))
        } catch (err) {
          console.error('复制到剪贴板失败:', err)
        }
      }
      
      // 显示连接信息
      ElMessageBox.alert(
        `${t('collectTask.sshCommand')}: ${sshCommand}\n\n请使用终端执行此命令进行连接。`,
        t('collectTask.sshConnectionInfo'),
        {
          confirmButtonText: t('common.confirm'),
          type: 'info',
        }
      )
    }

    const connectRDP = async (connectionInfo) => {
      // RDP连接逻辑
      const rdpUrl = connectionInfo.url
      const rdpFileContent = connectionInfo.rdpFileContent
      console.log('RDP连接URL:', rdpUrl)
      console.log('RDP文件内容:', rdpFileContent)
      
      try {
        // 首先尝试直接打开RDP URL
        const rdpWindow = window.open(rdpUrl, '_blank')
        
        if (rdpWindow) {
          ElMessage.success(t('collectTask.rdpConnectionStarted'))
          
          // 同时提供下载RDP文件的功能
          setTimeout(() => {
            downloadRdpFile(connectionInfo)
          }, 1000)
        } else {
          throw new Error('无法打开RDP连接窗口')
        }
      } catch (error) {
        console.error('RDP连接失败:', error)
        
        // 如果直接连接失败，提供RDP文件下载
        ElMessageBox.confirm(
          `直接RDP连接失败，是否下载RDP连接文件？\n\n连接信息：\n服务器: ${connectionInfo.executorIp}:${connectionInfo.port}\n用户名: ${connectionInfo.username}`,
          t('collectTask.rdpConnection'),
          {
            confirmButtonText: t('collectTask.rdpFileDownload'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        ).then(() => {
          downloadRdpFile(connectionInfo)
        }).catch(() => {
          ElMessage.info(t('collectTask.rdpConnectionCancelled'))
        })
      }
    }

    const downloadRdpFile = (connectionInfo) => {
      try {
        const rdpFileContent = connectionInfo.rdpFileContent
        const blob = new Blob([rdpFileContent], { type: 'application/rdp' })
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `rdp_${connectionInfo.executorIp}_${connectionInfo.port}.rdp`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        ElMessage.success(t('collectTask.rdpFileDownloaded'))
      } catch (error) {
        console.error('下载RDP文件失败:', error)
        ElMessage.error(t('collectTask.rdpFileDownloadFailed') + ': ' + error.message)
      }
    }

    const connectVNC = async (connectionInfo) => {
      // VNC连接逻辑
      const vncUrl = connectionInfo.url
      console.log('VNC连接URL:', vncUrl)
      
      // 尝试打开VNC连接
      try {
        window.open(vncUrl, '_blank')
        ElMessage.success(t('collectTask.vncConnectionStarted'))
      } catch (error) {
        ElMessageBox.alert(
          `${t('collectTask.vncConnectionUrl')}: ${vncUrl}\n\n${t('collectTask.vncClientTip')}`,
          t('collectTask.vncConnectionInfo'),
          {
            confirmButtonText: t('common.confirm'),
            type: 'info',
          }
        )
      }
    }

    // 自动刷新定时器
    let autoRefreshTimer = null

    // 启动自动刷新
    const startAutoRefresh = () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer)
      }
      
      // 每30秒自动刷新一次执行状态
      autoRefreshTimer = setInterval(async () => {
        const hasRunningTask = tableData.value.some(task => task.status === 'RUNNING')
        if (hasRunningTask) {
          await loadTaskExecutionStatus()
        }
      }, 30000)
    }

    // 停止自动刷新
    const stopAutoRefresh = () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer)
        autoRefreshTimer = null
      }
    }

    // 检查路由参数，如果来自 app 版本变更页面或top应用监控页面，自动打开新建任务对话框
    const checkRouteParams = () => {
      if (route.query.fromAppVersion === 'true' || route.query.fromAppMarketMonitor === 'true') {
        fromAppVersion.value = route.query.fromAppVersion === 'true'
        appInfo.value = {
          appName: route.query.appName || '',
          appVersion: route.query.appVersion || '',
          appCategory: route.query.appCategory || '',
          appDescription: route.query.appDescription || '',
        }
        
        // 打开新建任务对话框
        handleAdd()
        
        // 填充基本信息
        if (appInfo.value.appName) {
          basicForm.name = `${appInfo.value.appName}${appInfo.value.appVersion ? `-${appInfo.value.appVersion}` : ''}拨测任务`
        }
        if (appInfo.value.appDescription || appInfo.value.appCategory) {
          let desc = `应用：${appInfo.value.appName}`
          if (appInfo.value.appVersion) {
            desc += `，版本：${appInfo.value.appVersion}`
          }
          if (appInfo.value.appCategory) {
            desc += `，类别：${appInfo.value.appCategory}`
          }
          if (appInfo.value.appDescription) {
            desc += `\n描述：${appInfo.value.appDescription}`
          }
          basicForm.description = desc
        }
        
        // 清除路由参数，避免刷新时重复触发
        router.replace({ name: 'CollectTask', query: {} })
      }
    }

    onMounted(() => {
      loadData()
      loadStrategyOptions()
      startAutoRefresh()
      // 延迟检查路由参数，确保数据已加载
      setTimeout(() => {
        checkRouteParams()
      }, 500)
    })

    // 组件卸载时清理定时器和图表
    onUnmounted(() => {
      stopAutoRefresh()
      if (qcChart) {
        qcChart.dispose()
        qcChart = null
      }
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
        resizeHandler = null
      }
    })

    // 获取替换后的URL（根据当前页面IP替换）
    const getReplacedUrl = (url) => {
      return replaceUrlHost(url)
    }

    return {
      loading,
      tableData,
      pagination,
      dialogVisible,
      dialogTitle,
      submitLoading,
      basicFormRef,
      networkElementFormRef,
      strategyFormRef,
      environmentFormRef,
      basicForm,
      basicRules,
      networkElementForm,
      networkElementRules,
      networkElementOptions,
      networkElementLoading,
      selectedNetworkElements,
      loadNetworkElementList,
      handleNetworkElementVisibleChange,
      strategyForm,
      strategyRules,
      environmentForm,
      environmentRules,

      strategyOptions,
      regionOptions,
      countryOptions,
      provinceOptions,
      cityOptions,
      manufacturerOptions,
      networkOptions,
      selectedStrategy,
      selectedStrategyAppEn,
      selectedStrategyAppLabel,
      strategyBusinessCategoryOptions,
      strategyAppOptions,
      availableEnvironments,
      environmentsLoading,
      selectedEnvironmentIds,
      expandedEnvironmentIds,
      toggleEnvironmentDetail,
      showFilteredTestCases,
      
      // 步骤控制
      currentStep,
      handleNextStep,
      handlePrevStep,
      canProceedToNextStep,
      
      // 用例配置相关
      selectedTestCases,
      activeTestCaseConfigItems,
      currentExpandedTestCase,
      taskTestCaseExecutionCounts,
      taskTestCaseCustomParams,
      getTaskTestCaseExecutionCount,
      getTaskTestCaseParamCount,
      addTaskTestCaseParam,
      removeTaskTestCaseParam,
      getTaskParamKeyOptions,
      getTaskParamValueOptions,
      handleTaskParamKeyChange,
      
      // 自定义参数相关
      showCustomParamsEditor,
      editableCustomParams,
      addCustomParam,
      removeCustomParam,
      saveCustomParams,
      cancelCustomParamsEdit,
      environmentSummary,
      getStatusType,
      getStatusText,
      getTableProgressText,
      getTableProgressPercentage,
      getTableProgressStatus,
      getProgressColor,
      loadData,
      loadStrategyOptions,
      loadRegionOptions,
      loadCountryOptions,
      loadProvinceOptions,
      loadCityOptions,
      handleAdd,
      handleAddTemplate,
      handleEditTemplate,
      handleDeleteTemplate,
      handleStop,
      handleDelete,
      handleSubmit,
      resetForm,
      handleStrategyChange,
      handleRefreshStrategy,
      handleAddStrategy,
      strategyLoading,
      fromAppVersion,
      handleRegionChange,
      handleCountryChange,
      handleProvinceChange,
      handleCityChange,
      loadAvailableEnvironments,
      toggleEnvironmentSelection,
      handleEnvironmentSelection,
      getFilteredTestCaseCount,
      getFilteredTestCases,
      handleSizeChange,
      handleCurrentChange,
      refreshAllData,
      
      // Tab相关
      activeTab,
      openedTasks,
      
      // 任务详情相关
      taskProgress,
      executionInstances,
      instancesLoading,
      calculatedProgress,
      calculatedTaskStatus,
      handleViewDetail,
      handleTabClick,
      handleTabRemove,
      getCurrentTask,
      getCalculatedProgress,
      refreshTaskProgress,
      refreshExecutionInstances,
      qcChartRef,
      qcChartLoading,
      qcResultSummary,
      updateQcResultChart,
      getProgressPercentage,
      getProgressStatus,
      getInstanceStatusType,
      getInstanceStatusText,
      getInstanceResultType,
      getInstanceResultText,
      viewInstanceResult,
      openRemoteDesktop,
      openCollectPath,
      getReplacedUrl,
      
      // 模版相关
      templateLoading,
      templateTableData,
      templatePagination,
      isTemplateMode,
      loadTemplateData,
      refreshTemplateData,
      handleTemplateSizeChange,
      handleTemplateCurrentChange,
      
      // 远程登录相关
      remoteLoginDialogVisible,
      connecting,
      remoteLoginFormRef,
      remoteLoginForm,
      remoteLoginRules,
      openRemoteLoginDialog,
      closeRemoteLoginDialog,
      connectRemoteMachine,
    }
  },
}
</script>

<style scoped>
.collect-task-page {
  padding: 20px;
}

/* 主内容区域布局 */
.main-content {
  width: 100%;
}

/* Tab样式 */
.el-tabs {
  height: 100%;
}

.el-tab-pane {
  padding: 20px 0;
}

/* 详情卡片样式 */
.task-detail .detail-card {
  margin-bottom: 20px;
}

.task-detail .detail-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 无任务选择时的样式 */
.no-task-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.table-operations {
  margin-bottom: 16px;
}

.table-operations .el-button {
  margin-right: 8px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 步骤内容样式 */
.step-navigation {
  margin-bottom: 30px;
  padding: 20px 0;
}

/* 用例配置样式 */
.test-case-config-container {
  margin-top: 20px;
}

.test-case-config-item-title {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.test-case-config-item-content {
  padding: 16px;
}

.config-section {
  margin-bottom: 24px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.config-section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.empty-params-inline {
  padding: 12px;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.params-list-inline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.param-index-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.no-test-cases {
  padding: 40px 0;
  text-align: center;
}

.step-content {
  min-height: 600px;
}

.step-panel {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.step-panel:last-child {
  border-bottom: none;
}

.step-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.sub-step-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.sub-step-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 策略信息样式 */
.strategy-info {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.strategy-info h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

/* 环境配置摘要样式 */
.environment-summary {
  margin-top: 20px;
}

.environment-summary h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

/* 可用逻辑环境列表样式 */
.available-environments {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.available-environments h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.environments-content {
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.no-environments {
  text-align: center;
  padding: 40px 0;
}

.environments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.environment-card {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.environment-card:hover:not(.disabled) {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.environment-card.selected {
  border-color: #67c23a;
  background-color: #f0f9ff;
  box-shadow: 0 2px 12px 0 rgba(103, 194, 58, 0.2);
}

.environment-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.environment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
  min-width: 0;
}

.environment-actions {
  margin-top: 8px;
  margin-bottom: 0;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.environment-actions .el-button {
  color: #409eff;
  font-size: 13px;
}

.environment-actions .el-button:hover {
  color: #66b1ff;
}

.environment-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.environment-status {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
  gap: 4px;
  white-space: nowrap;
}

.environment-name {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
}

.environment-info {
  margin-bottom: 12px;
}

.environment-info p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.environment-ue,
.environment-networks {
  margin-top: 12px;
}

.environment-ue p,
.environment-networks p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.ue-list,
.network-list {
  display: flex;
  flex-wrap: wrap;
}

.selection-tip {
  margin-top: 16px;
}

/* 任务详情样式 */
.task-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #303133;
}

/* 进度部分样式 */
.progress-section {
  padding: 20px 0;
}

.progress-overview {
  margin-bottom: 30px;
}

.progress-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.progress-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.progress-number.success {
  color: #67c23a;
}

.progress-number.warning {
  color: #e6a23c;
}

.progress-number.info {
  color: #409eff;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.progress-bar-section {
  margin-top: 20px;
}

.progress-bar-label {
  margin-bottom: 10px;
  font-weight: 500;
  color: #303133;
}

/* 统计卡片样式 */
.statistics-section {
  padding: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.stat-card.success {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.stat-card.danger {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.stat-card.info {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.stat-icon {
  font-size: 24px;
  margin-right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #fff;
}

.stat-card.success .stat-icon {
  color: #67c23a;
}

.stat-card.danger .stat-icon {
  color: #f56c6c;
}

.stat-card.info .stat-icon {
  color: #409eff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 质检结果样式 */
.qc-result-section {
  padding: 20px 0;
}

.qc-result-list {
  min-height: 300px;
}

.no-qc-data {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}

.qc-result-items {
  max-height: 400px;
  overflow-y: auto;
}

.qc-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.qc-error-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  word-break: break-word;
}

.qc-error-count {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  min-width: 60px;
  text-align: right;
}

.qc-chart-container {
  height: 400px;
  padding: 20px;
}

.qc-chart {
  width: 100%;
  height: 100%;
}

/* 执行例次表格样式 */
.instances-section {
  padding: 20px 0;
}

.instances-section .el-table {
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-overview .el-col {
    margin-bottom: 16px;
  }
  
  .statistics-section .el-col {
    margin-bottom: 16px;
  }
  
  .progress-item,
  .stat-card {
    padding: 16px;
  }
  
  .progress-number {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

/* 表格进度显示样式 */
.progress-display {
  width: 100%;
  padding: 4px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  flex: 1;
  line-height: 1.2;
}

.progress-percentage {
  font-size: 12px;
  color: #409eff;
  font-weight: 600;
  margin-left: 8px;
  min-width: 40px;
  text-align: right;
}

/* 进度条容器样式 */
.progress-display .el-progress {
  margin-top: 2px;
}

.progress-display .el-progress__text {
  font-size: 11px;
}

/* 失败原因文本样式 */
.failure-reason-text {
  color: #f56c6c;
  font-size: 12px;
  cursor: pointer;
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 日志文件路径样式 */
.log-file-path {
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

/* 筛选后的用例列表样式 */
.filtered-test-cases {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.filtered-test-cases h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.test-cases-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.test-cases-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

/* 自定义参数相关样式 */
.custom-params-section {
  width: 100%;
}

.custom-params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.custom-params-header span {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.custom-params-editor {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-actions {
  display: flex;
  gap: 8px;
}

/* 远程登录相关样式 */
.remote-login-content {
  padding: 20px 0;
}

.executor-info {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.executor-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.executor-info p:last-child {
  margin-bottom: 0;
}

.executor-info strong {
  color: #303133;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons .el-button {
  margin: 0;
}

/* 远程登录弹窗样式 */
.remote-login-content .el-form-item {
  margin-bottom: 20px;
}

.connection-tip {
  margin-top: 10px;
}

.connection-tip .el-alert {
  margin-top: 8px;
}

.connection-tip p {
  margin: 4px 0;
  font-size: 13px;
}

.remote-login-content .el-radio-group {
  display: flex;
  gap: 16px;
}

.remote-login-content .el-input-number {
  width: 100%;
}

.remote-login-content .el-textarea {
  width: 100%;
}

</style>
