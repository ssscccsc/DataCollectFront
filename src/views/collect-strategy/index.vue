<template>
  <div class="collect-strategy-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.collectStrategy') }}</h2>
      <p class="page-description">{{ $t('collectStrategy.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('collectStrategy.addStrategy') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('collectStrategy.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" :label="$t('collectStrategy.strategyId')" width="80" />
        <el-table-column prop="name" :label="$t('collectStrategy.strategyName')" min-width="150" />
        <el-table-column :label="$t('collectStrategy.collectIntent')" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.intentName" size="small" type="warning">
              {{ scope.row.intentName }}
            </el-tag>
            <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="collectCount" :label="$t('collectStrategy.collectCount')" width="100" />
        <el-table-column :label="$t('collectStrategy.testCaseSet')" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.testCaseSetName" class="test-case-set-info">
              <div class="set-name">
                <strong>{{ scope.row.testCaseSetName }} ({{ scope.row.testCaseSetVersion }})</strong>
              </div>
              <div class="set-description" v-if="scope.row.testCaseSetDescription">
                <span class="label">{{ $t('collectStrategy.testCaseSetDescription') }}：</span>
                <span>{{ scope.row.testCaseSetDescription }}</span>
              </div>
              <div class="set-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewTestCaseSetDetail(scope.row.testCaseSetId)"
                >
                  <el-icon><View /></el-icon>
                  {{ $t('collectStrategy.viewTestCaseSetDetail') }}
                </el-button>
                <el-link 
                  v-if="scope.row.testCaseSetGohttpserverUrl"
                  type="primary" 
                  :href="scope.row.testCaseSetGohttpserverUrl" 
                  target="_blank"
                  :underline="false"
                  style="margin-left: 8px;"
                >
                  <el-icon><Link /></el-icon>
                  {{ $t('collectStrategy.viewFile') }}
                </el-link>
              </div>
            </div>
            <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('collectStrategy.filterConditions')" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.businessCategory || scope.row.app">
              <div v-if="scope.row.businessCategory" class="filter-tag">
                <el-tag size="small" type="info">{{ $t('collectStrategy.businessCategory') }}: {{ scope.row.businessCategory }}</el-tag>
              </div>
              <div v-if="scope.row.app" class="filter-tag">
                <el-tag size="small" type="success">{{ $t('collectStrategy.app') }}: {{ scope.row.app }}</el-tag>
              </div>
            </div>
            <span v-else style="color: #909399;">{{ $t('collectStrategy.noFilter') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('collectStrategy.customParams')" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.customParamList && scope.row.customParamList.length > 0">
              <div v-for="param in scope.row.customParamList" :key="param.key" class="param-tag">
                <el-tag size="small" type="info">
                  {{ param.key }}: {{ param.value }}
                </el-tag>
              </div>
            </div>
            <span v-else style="color: #909399;">{{ $t('collectStrategy.noParams') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="$t('collectStrategy.description')" />
        <el-table-column prop="status" :label="$t('collectStrategy.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('collectStrategy.enabled') : $t('collectStrategy.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('collectStrategy.createTime')" />
        <el-table-column :label="$t('collectStrategy.operations')" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">{{ $t('collectStrategy.edit') }}</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('collectStrategy.delete') }}</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      top="8vh"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <!-- 步骤导航 -->
      <div class="step-navigation">
        <el-steps :active="currentStep" align-center>
          <el-step :title="$t('collectStrategy.step1Title')" :description="$t('collectStrategy.step1Desc')" />
          <el-step :title="$t('collectStrategy.step2Title')" :description="$t('collectStrategy.step2Desc')" />
          <el-step :title="$t('collectStrategy.step3Title')" :description="$t('collectStrategy.step3Desc')" />
        </el-steps>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="strategy-form"
      >
        <!-- 第一步：基本信息配置 -->
        <div v-if="currentStep === 0" class="step-content">
          <el-form-item :label="$t('collectStrategy.strategyNameLabel')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('collectStrategy.strategyNamePlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('collectStrategy.collectIntentLabel')" prop="intent">
            <el-select 
              v-model="form.intent" 
              :placeholder="$t('collectStrategy.collectIntentPlaceholder')" 
              style="width: 100%"
            >
              <el-option
                v-for="intent in intentOptions"
                :key="intent.code"
                :label="intent.name"
                :value="intent.code"
              />
            </el-select>
          </el-form-item>
          
          <!-- 自定义参数列表 -->
          <el-form-item :label="$t('collectStrategy.customParamsLabel')">
            <div class="custom-params-container">
              <div class="custom-params-header">
                <span class="params-title">{{ $t('collectStrategy.paramList') }}</span>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="addCustomParam"
                  :icon="Plus"
                >
                  {{ $t('collectStrategy.addParam') }}
                </el-button>
              </div>
              
              <div v-if="form.customParams.length === 0" class="empty-params">
                <el-empty :description="$t('collectStrategy.noCustomParams')" :image-size="60" />
              </div>
              
              <div v-else class="custom-params-list">
                <div 
                  v-for="(param, index) in form.customParams" 
                  :key="index" 
                  class="param-item"
                >
                  <div class="param-index">{{ index + 1 }}</div>
                  <el-form-item 
                    :prop="`customParams.${index}.key`" 
                    :rules="customParamRules.key"
                    style="margin-bottom: 0; flex: 1;"
                  >
                    <el-input 
                      v-model="param.key" 
                      :placeholder="$t('collectStrategy.paramKey')" 
                    />
                  </el-form-item>
                  <el-form-item 
                    :prop="`customParams.${index}.value`" 
                    :rules="customParamRules.value"
                    style="margin-bottom: 0; flex: 1;"
                  >
                    <el-input 
                      v-model="param.value" 
                      :placeholder="$t('collectStrategy.paramValue')" 
                    />
                  </el-form-item>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeCustomParam(index)"
                    :icon="Delete"
                  >
                    {{ $t('collectStrategy.delete') }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('collectStrategy.collectCountLabel')" prop="collectCount">
            <el-input-number
              v-model="form.collectCount"
              :min="1"
              :max="1000"
              :placeholder="$t('collectStrategy.collectCountPlaceholder')"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item :label="$t('collectStrategy.testCaseSetLabel')" prop="testCaseSetId">
            <el-select v-model="form.testCaseSetId" :placeholder="$t('collectStrategy.testCaseSetPlaceholder')" style="width: 100%" @change="handleTestCaseSetChange">
              <el-option
                v-for="item in testCaseSetOptions"
                :key="item.id"
                :label="`${item.name} (${item.version})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 第二步：用例处理配置 -->
        <div v-if="currentStep === 1" class="step-content">
          <!-- 筛选条件配置 -->
          <el-form-item :label="$t('collectStrategy.businessCategoryFilter')" v-if="selectedTestCaseSet">
            <el-select 
              v-model="form.businessCategory" 
              :placeholder="$t('collectStrategy.businessCategoryPlaceholder')" 
              clearable 
              style="width: 100%"
              @change="handleBusinessCategoryChange"
            >
              <el-option
                v-for="category in businessCategoryOptions"
                :key="category"
                :label="category"
                :value="category"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span style="flex: 1;">{{ category }}</span>
                  <el-button 
                    v-if="form.businessCategory === category"
                    type="danger" 
                    size="small" 
                    text
                    :icon="Delete"
                    @click.stop.prevent="clearBusinessCategory"
                    style="margin-left: 8px; padding: 0 4px;"
                  >
                  </el-button>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item :label="$t('collectStrategy.appFilter')" v-if="selectedTestCaseSet">
            <div class="app-filter-row">
              <el-select 
                v-model="form.app" 
                :placeholder="$t('collectStrategy.appPlaceholder')" 
                clearable 
                style="flex: 1; margin-right: 12px;"
                @change="handleAppChange"
              >
                <el-option
                  v-for="app in appOptions"
                  :key="app.app"
                  :label="app.app"
                  :value="app.app"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="flex: 1;">{{ app.app }}</span>
                    <el-button 
                      v-if="form.app === app.app"
                      type="danger" 
                      size="small" 
                      text
                      :icon="Delete"
                      @click.stop.prevent="clearApp"
                      style="margin-left: 8px; padding: 0 4px;"
                    >
                    </el-button>
                  </div>
                </el-option>
              </el-select>
              <el-input 
                v-if="form.app"
                v-model="selectedAppEn" 
                :placeholder="$t('collectStrategy.appEnPlaceholder')" 
                readonly
                style="flex: 1;"
              >
                <template #prepend>
                  <el-icon><InfoFilled /></el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>
          
          <!-- 用例列表显示 -->
          <el-form-item :label="$t('collectStrategy.includedTestCases')" v-if="selectedTestCaseSet">
            <div class="test-case-list-container">
              <div class="test-case-summary">
                <span class="summary-text">
                  {{ $t('collectStrategy.totalTestCases', { count: filteredTestCaseList.length }) }}
                  <span v-if="selectedTestCaseIds.length > 0" style="color: #409eff; margin-left: 8px;">
                    （已选择 {{ selectedTestCaseIds.length }} 个用例）
                  </span>
                </span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="showTestCaseList = !showTestCaseList"
                >
                  {{ showTestCaseList ? $t('collectStrategy.collapse') : $t('collectStrategy.expand') }}
                </el-button>
              </div>
              
              <div v-if="showTestCaseList" class="test-case-table">
                <el-table 
                  ref="testCaseTableRef"
                  :data="filteredTestCaseList" 
                  size="small" 
                  max-height="300"
                  row-key="id"
                  @selection-change="handleTestCaseSelectionChange"
                >
                  <el-table-column type="selection" width="55" :reserve-selection="true" />
                  <el-table-column prop="name" :label="$t('collectStrategy.testCaseName')" min-width="150" />
                  <el-table-column prop="number" :label="$t('collectStrategy.testCaseNumber')" width="100" />
                  <el-table-column prop="businessCategory" :label="$t('collectStrategy.businessCategory')" width="120">
                    <template #default="scope">
                      <span v-if="scope.row.businessCategory">{{ scope.row.businessCategory }}</span>
                      <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="app" :label="$t('collectStrategy.app')" width="100">
                    <template #default="scope">
                      <span v-if="scope.row.app">{{ scope.row.app }}</span>
                      <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="logicNetwork" :label="$t('collectStrategy.logicNetwork')" min-width="150">
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
                      <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('collectStrategy.executionCount')" width="100" align="center">
                    <template #default="scope">
                      <el-tag v-if="getTestCaseExecutionCount(scope.row.id) > 0" type="warning" size="small">
                        {{ getTestCaseExecutionCount(scope.row.id) }} 次
                      </el-tag>
                      <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('collectStrategy.testCaseCustomParams')" width="120" align="center">
                    <template #default="scope">
                      <el-tooltip 
                        v-if="getTestCaseParamCount(scope.row.id) > 0" 
                        :content="$t('collectStrategy.configuredParams', { count: getTestCaseParamCount(scope.row.id) })"
                        placement="top"
                      >
                        <el-badge :value="getTestCaseParamCount(scope.row.id)" type="success">
                          <el-icon style="font-size: 18px; color: #67c23a;"><Setting /></el-icon>
                        </el-badge>
                      </el-tooltip>
                      <span v-else style="color: #909399;">{{ $t('collectStrategy.notConfigured') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('collectStrategy.operations')" width="100" align="center" fixed="right">
                    <template #default="scope">
                      <el-button 
                        type="primary" 
                        size="small" 
                        text
                        @click="handleConfigTestCaseParams(scope.row)"
                      >
                        {{ $t('collectStrategy.configParams') }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
              </div>
            </div>
          </el-form-item>
        </div>
        
        <!-- 第三步：用例参数配置 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="batch-config-container">
            <el-alert
              :title="$t('collectStrategy.batchConfigTip')"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 16px;"
            >
              <template #default>
                {{ $t('collectStrategy.batchConfigDescription', { count: selectedTestCases.length }) }}
              </template>
            </el-alert>

            <el-collapse v-model="activeBatchConfigItems">
              <el-collapse-item 
                v-for="(testCase, index) in selectedTestCases" 
                :key="testCase.id"
                :name="testCase.id"
              >
                <template #title>
                  <div class="batch-config-item-title">
                    <el-tag type="primary" size="small" style="margin-right: 8px;">{{ index + 1 }}</el-tag>
                    <strong style="margin-right: 12px;">{{ testCase.name }}</strong>
                    <el-tag size="small" type="info">{{ testCase.number }}</el-tag>
                    <span style="margin-left: auto; margin-right: 12px; font-size: 12px; color: #909399;">
                      <el-icon v-if="getTestCaseExecutionCount(testCase.id) > 0" style="color: #e6a23c;"><Clock /></el-icon>
                      {{ getTestCaseExecutionCount(testCase.id) > 0 ? `${getTestCaseExecutionCount(testCase.id)} 次` : $t('collectStrategy.notConfigured') }}
                      <el-divider direction="vertical" />
                      <el-icon v-if="getTestCaseParamCount(testCase.id) > 0" style="color: #67c23a;"><Setting /></el-icon>
                      {{ getTestCaseParamCount(testCase.id) > 0 ? `${getTestCaseParamCount(testCase.id)} 个参数` : $t('collectStrategy.noParams') }}
                    </span>
                  </div>
                </template>
                
                <div class="batch-config-item-content">
                  <!-- 用例基本信息（默认隐藏） -->
                  <el-collapse v-model="testCaseInfoCollapse" style="margin-bottom: 16px;">
                    <el-collapse-item :name="testCase.id">
                      <template #title>
                        <span style="font-size: 14px; color: #606266;">
                          <el-icon><InfoFilled /></el-icon>
                          {{ $t('collectStrategy.testCaseInfo') }}
                        </span>
                      </template>
                      <el-descriptions :column="3" border size="small">
                        <el-descriptions-item :label="$t('collectStrategy.businessCategory')">
                          {{ testCase.businessCategory || $t('collectStrategy.notConfigured') }}
                        </el-descriptions-item>
                        <el-descriptions-item :label="$t('collectStrategy.app')">
                          {{ testCase.app || $t('collectStrategy.notConfigured') }}
                        </el-descriptions-item>
                        <el-descriptions-item :label="$t('collectStrategy.logicNetwork')">
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
                          <span v-else>{{ $t('collectStrategy.notConfigured') }}</span>
                        </el-descriptions-item>
                      </el-descriptions>
                    </el-collapse-item>
                  </el-collapse>

                  <!-- 执行次数配置 -->
                  <div class="config-section">
                    <div class="config-section-title">
                      <el-icon><Clock /></el-icon>
                      <span>{{ $t('collectStrategy.executionConfig') }}</span>
                    </div>
                    <el-input-number
                      v-model="form.testCaseExecutionCounts[testCase.id]"
                      :min="1"
                      :max="100"
                      :placeholder="$t('collectStrategy.executionCountPlaceholder')"
                      style="width: 200px;"
                    />
                    <span style="margin-left: 12px; color: #909399; font-size: 12px;">
                      {{ $t('collectStrategy.executionCountTip') }}
                    </span>
                  </div>

                  <!-- 自定义参数配置 -->
                  <div class="config-section">
                    <div class="config-section-title">
                      <el-icon><Setting /></el-icon>
                      <span>{{ $t('collectStrategy.testCaseParamsLabel') }}</span>
                      <el-button 
                        type="primary" 
                        size="small" 
                        @click="addBatchTestCaseParam(testCase.id)"
                        :icon="Plus"
                        style="margin-left: auto;"
                      >
                        {{ $t('collectStrategy.addParam') }}
                      </el-button>
                    </div>
                    
                    <div v-if="!form.testCaseCustomParams[testCase.id] || form.testCaseCustomParams[testCase.id].length === 0" class="empty-params-inline">
                      <span style="color: #909399; font-size: 12px;">{{ $t('collectStrategy.noTestCaseParams') }}</span>
                    </div>
                    
                    <div v-else class="params-list-inline">
                      <div 
                        v-for="(param, paramIndex) in form.testCaseCustomParams[testCase.id]" 
                        :key="paramIndex" 
                        class="param-item-inline"
                      >
                        <div class="param-index-small">{{ paramIndex + 1 }}</div>
                        <el-select 
                          v-model="param.key" 
                          :placeholder="$t('collectStrategy.paramKey')" 
                          size="small"
                          filterable
                          clearable
                          style="flex: 1;"
                          @change="handleBatchParamKeyChange(testCase.id, paramIndex)"
                        >
                          <el-option
                            v-for="paramOption in getBatchParamKeyOptions(testCase)"
                            :key="paramOption.paramName"
                            :label="paramOption.paramName"
                            :value="paramOption.paramName"
                          />
                        </el-select>
                        <el-select 
                          v-model="param.value" 
                          :placeholder="$t('collectStrategy.paramValue')" 
                          size="small"
                          multiple
                          filterable
                          clearable
                          style="flex: 1;"
                        >
                          <el-option
                            v-for="valueOption in getBatchParamValueOptions(testCase.id, paramIndex)"
                            :key="valueOption"
                            :label="valueOption"
                            :value="valueOption"
                          />
                        </el-select>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeBatchTestCaseParam(testCase.id, paramIndex)"
                          :icon="Delete"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
        
        <!-- 描述和状态字段（仅在编辑时显示） -->
        <div v-if="form.id" class="step-content">
          <el-form-item :label="$t('collectStrategy.descriptionLabel')" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              :placeholder="$t('collectStrategy.descriptionPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('collectStrategy.statusLabel')" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">{{ $t('collectStrategy.enabled') }}</el-radio>
              <el-radio :label="0">{{ $t('collectStrategy.disabled') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <!-- 步骤导航按钮 -->
          <el-button v-if="currentStep === 0" type="primary" @click="handleNextStep" :disabled="!canProceedToNextStep">
            {{ $t('collectStrategy.nextStep') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-if="currentStep === 1" @click="handlePrevStep">
            <el-icon><ArrowLeft /></el-icon>
            {{ $t('collectStrategy.prevStep') }}
          </el-button>
          <el-button v-if="currentStep === 1" type="primary" @click="handleNextStep" :disabled="selectedTestCaseIds.length === 0">
            {{ $t('collectStrategy.nextStep') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-if="currentStep === 2" @click="handlePrevStep">
            <el-icon><ArrowLeft /></el-icon>
            {{ $t('collectStrategy.prevStep') }}
          </el-button>
          <el-button v-if="currentStep === 2" type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量配置用例对话框 -->
    <el-dialog
      v-model="batchConfigDialogVisible"
      :title="$t('collectStrategy.batchConfigTitle')"
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div class="batch-config-container">
        <el-alert
          :title="$t('collectStrategy.batchConfigTip')"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        >
          <template #default>
            {{ $t('collectStrategy.batchConfigDescription', { count: selectedTestCases.length }) }}
          </template>
        </el-alert>

        <el-collapse v-model="activeBatchConfigItems" accordion>
          <el-collapse-item 
            v-for="(testCase, index) in selectedTestCases" 
            :key="testCase.id"
            :name="testCase.id"
          >
            <template #title>
              <div class="batch-config-item-title">
                <el-tag type="primary" size="small" style="margin-right: 8px;">{{ index + 1 }}</el-tag>
                <strong style="margin-right: 12px;">{{ testCase.name }}</strong>
                <el-tag size="small" type="info">{{ testCase.number }}</el-tag>
                <span style="margin-left: auto; margin-right: 12px; font-size: 12px; color: #909399;">
                  <el-icon v-if="getTestCaseExecutionCount(testCase.id) > 0" style="color: #e6a23c;"><Clock /></el-icon>
                  {{ getTestCaseExecutionCount(testCase.id) > 0 ? `${getTestCaseExecutionCount(testCase.id)} 次` : $t('collectStrategy.notConfigured') }}
                  <el-divider direction="vertical" />
                  <el-icon v-if="getTestCaseParamCount(testCase.id) > 0" style="color: #67c23a;"><Setting /></el-icon>
                  {{ getTestCaseParamCount(testCase.id) > 0 ? `${getTestCaseParamCount(testCase.id)} 个参数` : $t('collectStrategy.noParams') }}
                </span>
              </div>
            </template>
            
            <div class="batch-config-item-content">
              <!-- 用例基本信息 -->
              <el-descriptions :column="3" border size="small" style="margin-bottom: 16px;">
                <el-descriptions-item :label="$t('collectStrategy.businessCategory')">
                  {{ testCase.businessCategory || $t('collectStrategy.notConfigured') }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectStrategy.app')">
                  {{ testCase.app || $t('collectStrategy.notConfigured') }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('collectStrategy.logicNetwork')">
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
                  <span v-else>{{ $t('collectStrategy.notConfigured') }}</span>
                </el-descriptions-item>
              </el-descriptions>

              <!-- 执行次数配置 -->
              <div class="config-section">
                <div class="config-section-title">
                  <el-icon><Clock /></el-icon>
                  <span>{{ $t('collectStrategy.executionConfig') }}</span>
                </div>
                <el-input-number
                  v-model="form.testCaseExecutionCounts[testCase.id]"
                  :min="1"
                  :max="100"
                  :placeholder="$t('collectStrategy.executionCountPlaceholder')"
                  style="width: 200px;"
                />
                <span style="margin-left: 12px; color: #909399; font-size: 12px;">
                  {{ $t('collectStrategy.executionCountTip') }}
                </span>
              </div>

              <!-- 自定义参数配置 -->
              <div class="config-section">
                <div class="config-section-title">
                  <el-icon><Setting /></el-icon>
                  <span>{{ $t('collectStrategy.testCaseParamsLabel') }}</span>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addBatchTestCaseParam(testCase.id)"
                    :icon="Plus"
                    style="margin-left: auto;"
                  >
                    {{ $t('collectStrategy.addParam') }}
                  </el-button>
                </div>
                
                <div v-if="!form.testCaseCustomParams[testCase.id] || form.testCaseCustomParams[testCase.id].length === 0" class="empty-params-inline">
                  <span style="color: #909399; font-size: 12px;">{{ $t('collectStrategy.noTestCaseParams') }}</span>
                </div>
                
                <div v-else class="params-list-inline">
                  <div 
                    v-for="(param, paramIndex) in form.testCaseCustomParams[testCase.id]" 
                    :key="paramIndex" 
                    class="param-item-inline"
                  >
                    <div class="param-index-small">{{ paramIndex + 1 }}</div>
                    <el-select 
                      v-model="param.key" 
                      :placeholder="$t('collectStrategy.paramKey')" 
                      size="small"
                      filterable
                      clearable
                      style="flex: 1;"
                      @change="handleBatchParamKeyChange(testCase.id, paramIndex)"
                    >
                      <el-option
                        v-for="paramOption in getBatchParamKeyOptions(testCase)"
                        :key="paramOption.paramName"
                        :label="paramOption.paramName"
                        :value="paramOption.paramName"
                      />
                    </el-select>
                    <el-select 
                      v-model="param.value" 
                      :placeholder="$t('collectStrategy.paramValue')" 
                      size="small"
                      multiple
                      filterable
                      clearable
                      style="flex: 1;"
                    >
                      <el-option
                        v-for="valueOption in getBatchParamValueOptions(testCase.id, paramIndex)"
                        :key="valueOption"
                        :label="valueOption"
                        :value="valueOption"
                      />
                    </el-select>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeBatchTestCaseParam(testCase.id, paramIndex)"
                      :icon="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchConfigDialogVisible = false">{{ $t('common.back') }}</el-button>
          <el-button type="primary" @click="saveBatchConfig">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用例自定义参数配置对话框 -->
    <el-dialog
      v-model="testCaseParamsDialogVisible"
      :title="$t('collectStrategy.configTestCaseParams')"
      width="700px"
      @close="resetTestCaseParamsDialog"
    >
      <div v-if="currentTestCase" class="test-case-params-dialog">
        <div class="test-case-info-header">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item :label="$t('collectStrategy.testCaseName')">
              <strong>{{ currentTestCase.name }}</strong>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('collectStrategy.testCaseNumber')">
              <el-tag type="info" size="small">{{ currentTestCase.number }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('collectStrategy.businessCategory')">
              {{ currentTestCase.businessCategory || $t('collectStrategy.notConfigured') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('collectStrategy.app')">
              {{ currentTestCase.app || $t('collectStrategy.notConfigured') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 执行次数配置 -->
        <el-divider>{{ $t('collectStrategy.executionConfig') }}</el-divider>
        
        <div class="execution-config-section">
          <el-form label-width="120px">
            <el-form-item :label="$t('collectStrategy.executionCount')">
              <el-input-number
                v-model="currentTestCaseExecutionCount"
                :min="1"
                :max="100"
                :placeholder="$t('collectStrategy.executionCountPlaceholder')"
                style="width: 200px;"
              />
              <span style="margin-left: 12px; color: #909399; font-size: 12px;">
                {{ $t('collectStrategy.executionCountTip') }}
              </span>
            </el-form-item>
          </el-form>
        </div>

        <el-divider>{{ $t('collectStrategy.testCaseCustomParams') }}</el-divider>

        <div class="custom-params-section">
          <div class="params-header">
            <span class="section-title">{{ $t('collectStrategy.testCaseParamList') }}</span>
            <el-button 
              type="primary" 
              size="small" 
              @click="addTestCaseParam"
              :icon="Plus"
            >
              {{ $t('collectStrategy.addParam') }}
            </el-button>
          </div>
          
          <div v-if="currentTestCaseParams.length === 0" class="empty-params">
            <el-empty :description="$t('collectStrategy.noTestCaseParams')" :image-size="80" />
          </div>
          
          <div v-else class="params-list">
            <div 
              v-for="(param, index) in currentTestCaseParams" 
              :key="index" 
              class="param-item-row"
            >
              <div class="param-index">{{ index + 1 }}</div>
              <el-select 
                v-model="param.key" 
                :placeholder="$t('collectStrategy.paramKey')" 
                class="param-input"
                filterable
                clearable
                @change="handleParamKeyChange(index)"
              >
                <el-option
                  v-for="paramOption in filteredParamKeyOptions"
                  :key="paramOption.paramName"
                  :label="paramOption.paramName"
                  :value="paramOption.paramName"
                />
              </el-select>
              <el-select 
                v-model="param.value" 
                :placeholder="$t('collectStrategy.paramValue')" 
                class="param-input"
                multiple
                filterable
                clearable
              >
                <el-option
                  v-for="valueOption in getParamValueOptions(index)"
                  :key="valueOption"
                  :label="valueOption"
                  :value="valueOption"
                />
              </el-select>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeTestCaseParam(index)"
                :icon="Delete"
              >
                {{ $t('common.delete') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="testCaseParamsDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveTestCaseParams">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Link, Plus, Delete, Setting, ArrowRight, Clock, View, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

export default {
  name: 'CollectStrategy',
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()
    const testCaseTableRef = ref()
    const testCaseSetOptions = ref([])
    const selectedTestCaseSet = ref(null)
    const testCaseList = ref([])
    const showTestCaseList = ref(false)
    const selectedTestCaseIds = ref([]) // 选中的用例ID列表
    const businessCategoryOptions = ref([])
    const appOptions = ref([])
    const intentOptions = ref([])
    const selectedAppEn = ref('')
    
    // 步骤控制
    const currentStep = ref(0)
    
    // 保存 watch 监听器引用，用于清除
    const testCaseListWatchStop = ref(null)
    
    // 批量配置对话框
    const batchConfigDialogVisible = ref(false)
    const activeBatchConfigItems = ref([])
    const testCaseInfoCollapse = ref([]) // 用例信息折叠状态（默认隐藏，空数组表示全部折叠）
    
    // 用例自定义参数配置
    const testCaseParamsDialogVisible = ref(false)
    const currentTestCase = ref(null)
    const currentTestCaseParams = ref([])
    const currentTestCaseExecutionCount = ref(1)
    const testCaseCustomParamList = ref([]) // 用例自定义参数列表
    const customParamRules = reactive({
      key: [
        { required: true, message: t('collectStrategy.paramKeyRequired'), trigger: 'blur' },
      ],
      value: [
        { required: true, message: t('collectStrategy.paramValueRequired'), trigger: 'blur' },
      ],
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      collectCount: 1,
      testCaseSetId: null,
      businessCategory: '',
      app: '',
      intent: '',
      customParams: [],
      testCaseCustomParams: {}, // 用例级别的自定义参数 { testCaseId: [{ key: '', value: '' }] }
      testCaseExecutionCounts: {}, // 用例级别的执行次数 { testCaseId: count }
      description: '',
      status: 1,
    })

    const rules = {
      name: [
        { required: true, message: t('collectStrategy.strategyNameRequired'), trigger: 'blur' },
      ],
      collectCount: [
        { required: true, message: t('collectStrategy.collectCountRequired'), trigger: 'blur' },
      ],
      testCaseSetId: [
        { required: true, message: t('collectStrategy.testCaseSetRequired'), trigger: 'change' },
      ],
      intent: [
        { required: true, message: t('collectStrategy.collectIntentRequired'), trigger: 'change' },
      ],
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        const res = await request({
          url: '/collect-strategy/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadTestCaseSetOptions = async () => {
      try {
        const res = await request({
          url: '/test-case-set/list',
          method: 'get',
        })
        testCaseSetOptions.value = res.data
      } catch (error) {
        console.error('加载用例集数据失败:', error)
      }
    }

    const loadIntentOptions = async () => {
      try {
        const res = await request({
          url: '/collect-strategy/intents',
          method: 'get',
        })
        intentOptions.value = res.data
      } catch (error) {
        console.error('加载采集意图选项失败:', error)
      }
    }

    const handleTestCaseSetChange = async (testCaseSetId) => {
      if (testCaseSetId) {
        // 获取选中的用例集信息
        const testCaseSet = testCaseSetOptions.value.find(item => item.id === testCaseSetId)
        selectedTestCaseSet.value = testCaseSet
        
        // 加载用例列表
        try {
          const res = await request({
            url: `/test-case-set/${testCaseSetId}/test-cases`,
            method: 'get',
          })
          testCaseList.value = res.data
          showTestCaseList.value = true // 自动展开用例列表
          
          // 提取业务大类和App选项（用于策略配置）
          extractFilterOptions()
          
          // 返回 Promise 以便调用者可以等待
          return Promise.resolve()
        } catch (error) {
          console.error('加载用例列表失败:', error)
          testCaseList.value = []
          return Promise.reject(error)
        }
      } else {
        selectedTestCaseSet.value = null
        testCaseList.value = []
        showTestCaseList.value = false
        clearFilterOptions()
        return Promise.resolve()
      }
    }

    // 提取筛选选项（用于策略配置）
    const extractFilterOptions = () => {
      const categories = new Set()
      const apps = new Set()
      
      testCaseList.value.forEach(testCase => {
        if (testCase.businessCategory) {
          categories.add(testCase.businessCategory)
        }
        if (testCase.app) {
          apps.add(testCase.app)
        }
      })
      
      businessCategoryOptions.value = Array.from(categories).sort()
      appOptions.value = Array.from(apps).sort().map(app => ({ app: app, }))
    }
    
    // 根据业务大类筛选APP选项
    const updateAppOptionsByCategory = (selectedCategory) => {
      if (!selectedCategory) {
        // 如果没有选择业务大类，显示所有APP
        extractFilterOptions()
        return
      }
      
      const apps = new Set()
      testCaseList.value.forEach(testCase => {
        if (testCase.businessCategory === selectedCategory && testCase.app) {
          apps.add(testCase.app)
        }
      })
      
      appOptions.value = Array.from(apps).sort().map(app => ({ app: app, }))
    }
    
    // 业务大类变化处理
    const handleBusinessCategoryChange = (category) => {
      // 清空APP选择
      form.app = ''
      selectedAppEn.value = ''
      // 更新APP选项
      updateAppOptionsByCategory(category)
    }
    
    // 清除业务大类筛选
    const clearBusinessCategory = () => {
      form.businessCategory = ''
      handleBusinessCategoryChange('')
    }
    
    // APP选择变化处理
    const handleAppChange = (selectedApp) => {
      if (selectedApp) {
        // 查找对应的appEn
        const testCase = testCaseList.value.find(tc => tc.app === selectedApp)
        selectedAppEn.value = testCase ? testCase.appEn || '' : ''
      } else {
        selectedAppEn.value = ''
      }
    }
    
    // 清除App筛选
    const clearApp = () => {
      form.app = ''
      selectedAppEn.value = ''
      handleAppChange('')
    }

    // 清除筛选选项
    const clearFilterOptions = () => {
      businessCategoryOptions.value = []
      appOptions.value = []
      selectedAppEn.value = ''
    }

    // 添加自定义参数
    const addCustomParam = () => {
      form.customParams.push({ key: '', value: '' })
    }

    // 删除自定义参数
    const removeCustomParam = (index) => {
      form.customParams.splice(index, 1)
    }
    
    // 获取用例的自定义参数数量
    const getTestCaseParamCount = (testCaseId) => {
      const params = form.testCaseCustomParams[testCaseId]
      return params ? params.length : 0
    }
    
    // 获取用例的执行次数
    const getTestCaseExecutionCount = (testCaseId) => {
      return form.testCaseExecutionCounts[testCaseId] || 0
    }
    
    // 处理用例选择变化
    const handleTestCaseSelectionChange = (selection) => {
      selectedTestCaseIds.value = selection.map(item => item.id)
      
      // 勾选后默认使用（设置默认执行次数为1）
      selection.forEach(testCase => {
        if (!form.testCaseExecutionCounts[testCase.id] || form.testCaseExecutionCounts[testCase.id] === 0) {
          form.testCaseExecutionCounts[testCase.id] = 1
        }
      })
      
      // 取消勾选时，如果执行次数为默认值1，可以选择是否清除（这里保留，用户可能想保留配置）
    }
    
    // 获取勾选的用例列表（基于所有用例列表，不受筛选条件影响）
    const selectedTestCases = computed(() => {
      return testCaseList.value.filter(
        testCase => selectedTestCaseIds.value.includes(testCase.id)
      )
    })
    
    // 步骤控制方法
    const handleNextStep = async () => {
      if (currentStep.value === 0) {
        // 从第一步到第二步
        currentStep.value = 1
        // 自动展开用例列表
        showTestCaseList.value = true
      } else if (currentStep.value === 1) {
        // 从第二步到第三步（用例参数配置）
        // 检查是否有勾选的用例
        if (selectedTestCaseIds.value.length === 0) {
          ElMessage.warning(t('collectStrategy.selectTestCasesFirst'))
          return
        }
        
        // 只处理勾选的用例
        // 初始化执行次数（如果未设置，默认为1）
        selectedTestCases.value.forEach(testCase => {
          if (!form.testCaseExecutionCounts[testCase.id]) {
            form.testCaseExecutionCounts[testCase.id] = 1
          }
          // 初始化参数数组（如果未设置）
          if (!form.testCaseCustomParams[testCase.id]) {
            form.testCaseCustomParams[testCase.id] = []
          }
        })
        
        // 加载用例自定义参数列表
        await loadTestCaseCustomParams()
        
        // 进入第三步
        currentStep.value = 2
        // 默认展开第一个勾选的用例
        if (selectedTestCases.value.length > 0) {
          activeBatchConfigItems.value = [selectedTestCases.value[0].id]
        }
      }
    }
    
    // 上一步
    const handlePrevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    // 判断是否可以进入下一步
    const canProceedToNextStep = computed(() => {
      if (currentStep.value === 0) {
        return form.name && form.intent && form.testCaseSetId
      }
      return true
    })
    
    // 根据用例的业务大类和appEn筛选批量配置的参数键选项
    // 匹配规则：用例的业务大类 === 用例自定义参数的业务大类 且 用例的appEn === 用例自定义参数的app
    const getBatchParamKeyOptions = (testCase) => {
      if (!testCase) {
        return []
      }
      
      const testCaseBusinessCategory = testCase.businessCategory
      const testCaseAppEn = testCase.appEn
      
      if (!testCaseBusinessCategory || !testCaseAppEn) {
        return []
      }
      
      return testCaseCustomParamList.value.filter(item => {
        // 匹配业务大类：用例的业务大类 === 用例自定义参数的业务大类
        if (item.businessCategory && item.businessCategory !== testCaseBusinessCategory) {
          return false
        }
        // 匹配APP：用例的appEn === 用例自定义参数的app
        if (item.app && item.app !== testCaseAppEn) {
          return false
        }
        return true
      })
    }

    // 根据选中的参数键获取批量配置的参数值选项
    const getBatchParamValueOptions = (testCaseId, paramIndex) => {
      const testCase = filteredTestCaseList.value.find(tc => tc.id === testCaseId)
      if (!testCase) {
        return []
      }
      
      const paramKeyOptions = getBatchParamKeyOptions(testCase)
      const param = form.testCaseCustomParams[testCaseId]?.[paramIndex]
      const selectedKey = param?.key
      
      if (!selectedKey) {
        return []
      }
      
      const paramOption = paramKeyOptions.find(
        item => item.paramName === selectedKey
      )
      
      if (paramOption && paramOption.paramValues && Array.isArray(paramOption.paramValues)) {
        return paramOption.paramValues
      }
      
      return []
    }

    // 处理批量配置参数键变化
    const handleBatchParamKeyChange = (testCaseId, paramIndex) => {
      // 当参数键变化时，清空参数值
      if (form.testCaseCustomParams[testCaseId] && form.testCaseCustomParams[testCaseId][paramIndex]) {
        form.testCaseCustomParams[testCaseId][paramIndex].value = []
      }
    }

    // 为批量配置的用例添加参数
    const addBatchTestCaseParam = (testCaseId) => {
      if (!form.testCaseCustomParams[testCaseId]) {
        form.testCaseCustomParams[testCaseId] = []
      }
      form.testCaseCustomParams[testCaseId].push({ key: '', value: [] })
    }
    
    // 删除批量配置的用例参数
    const removeBatchTestCaseParam = (testCaseId, paramIndex) => {
      if (form.testCaseCustomParams[testCaseId]) {
        form.testCaseCustomParams[testCaseId].splice(paramIndex, 1)
      }
    }
    
    // 保存批量配置（已废弃，现在作为第三步的一部分）
    const saveBatchConfig = () => {
      // 清理空的参数（value是数组，需要检查数组长度）
      Object.keys(form.testCaseCustomParams).forEach(testCaseId => {
        const params = form.testCaseCustomParams[testCaseId]
        if (params && Array.isArray(params)) {
          form.testCaseCustomParams[testCaseId] = params.filter(param => {
            return param.key && 
                   param.value && 
                   (Array.isArray(param.value) ? param.value.length > 0 : param.value)
          })
          // 如果过滤后为空，删除该key
          if (form.testCaseCustomParams[testCaseId].length === 0) {
            delete form.testCaseCustomParams[testCaseId]
          }
        }
      })
      
      ElMessage.success(t('collectStrategy.batchConfigSuccess'))
      batchConfigDialogVisible.value = false
    }
    
    // 加载用例自定义参数列表
    const loadTestCaseCustomParams = async () => {
      try {
        const res = await request({
          url: '/test-case-custom-param/list',
          method: 'get',
        })
        testCaseCustomParamList.value = res.data || []
      } catch (error) {
        console.error('加载用例自定义参数失败:', error)
        ElMessage.error(t('testCaseSet.loadCustomParamsFailed'))
      }
    }

    // 根据业务大类和app筛选参数键选项
    // 匹配规则：用例的业务大类 === 用例自定义参数的业务大类 且 用例的appEn === 用例自定义参数的app
    const filteredParamKeyOptions = computed(() => {
      if (!currentTestCase.value) {
        return []
      }
      
      const testCaseBusinessCategory = currentTestCase.value.businessCategory
      const testCaseAppEn = currentTestCase.value.appEn
      
      if (!testCaseBusinessCategory || !testCaseAppEn) {
        return []
      }
      
      return testCaseCustomParamList.value.filter(item => {
        // 匹配业务大类：用例的业务大类 === 用例自定义参数的业务大类
        if (item.businessCategory && item.businessCategory !== testCaseBusinessCategory) {
          return false
        }
        // 匹配APP：用例的appEn === 用例自定义参数的app
        if (item.app && item.app !== testCaseAppEn) {
          return false
        }
        return true
      })
    })

    // 根据选中的参数键获取参数值选项
    const getParamValueOptions = (index) => {
      const selectedKey = currentTestCaseParams.value[index]?.key
      if (!selectedKey) {
        return []
      }
      
      const paramOption = filteredParamKeyOptions.value.find(
        item => item.paramName === selectedKey
      )
      
      if (paramOption && paramOption.paramValues && Array.isArray(paramOption.paramValues)) {
        return paramOption.paramValues
      }
      
      return []
    }

    // 处理参数键变化
    const handleParamKeyChange = (index) => {
      // 当参数键变化时，清空参数值
      if (currentTestCaseParams.value[index]) {
        currentTestCaseParams.value[index].value = []
      }
    }

    // 打开用例自定义参数配置对话框
    const handleConfigTestCaseParams = async (testCase) => {
      currentTestCase.value = testCase
      // 加载用例自定义参数列表
      await loadTestCaseCustomParams()
      // 深拷贝当前用例的参数
      const existingParams = form.testCaseCustomParams[testCase.id] || []
      // 转换value为数组格式（如果是字符串则转换为数组，支持逗号分隔）
      currentTestCaseParams.value = existingParams.map(param => {
        let valueArray = []
        if (Array.isArray(param.value)) {
          valueArray = param.value
        } else if (param.value) {
          const valueStr = String(param.value).trim()
          if (valueStr.includes(',')) {
            valueArray = valueStr.split(',').map(v => v.trim()).filter(v => v)
          } else if (valueStr) {
            valueArray = [valueStr]
          }
        }
        return {
          key: param.key || '',
          value: valueArray,
        }
      })
      // 获取当前用例的执行次数
      currentTestCaseExecutionCount.value = form.testCaseExecutionCounts[testCase.id] || 1
      testCaseParamsDialogVisible.value = true
    }
    
    // 添加用例参数
    const addTestCaseParam = () => {
      currentTestCaseParams.value.push({ key: '', value: [] })
    }
    
    // 删除用例参数
    const removeTestCaseParam = (index) => {
      currentTestCaseParams.value.splice(index, 1)
    }
    
    // 保存用例自定义参数
    const saveTestCaseParams = () => {
      // 过滤掉空的参数（value是数组，需要检查数组长度）
      const validParams = currentTestCaseParams.value.filter(param => {
        return param.key && 
               param.value && 
               Array.isArray(param.value) && 
               param.value.length > 0
      })
      
      if (validParams.length > 0) {
        form.testCaseCustomParams[currentTestCase.value.id] = validParams
      } else {
        // 如果没有有效参数，删除该用例的参数配置
        delete form.testCaseCustomParams[currentTestCase.value.id]
      }
      
      // 保存执行次数
      if (currentTestCaseExecutionCount.value > 0) {
        form.testCaseExecutionCounts[currentTestCase.value.id] = currentTestCaseExecutionCount.value
      } else {
        delete form.testCaseExecutionCounts[currentTestCase.value.id]
      }
      
      ElMessage.success(t('collectStrategy.saveParamsSuccess'))
      testCaseParamsDialogVisible.value = false
    }
    
    // 重置用例参数对话框
    const resetTestCaseParamsDialog = () => {
      currentTestCase.value = null
      currentTestCaseParams.value = []
      currentTestCaseExecutionCount.value = 1
    }

    // 筛选后的用例列表（根据策略配置的筛选条件）
    const filteredTestCaseList = computed(() => {
      if (!testCaseList.value.length) {
        return []
      }

      return testCaseList.value.filter(testCase => {
        // 业务大类筛选
        if (form.businessCategory && testCase.businessCategory !== form.businessCategory) {
          return false
        }

        // App筛选（按 app 值匹配）
        if (form.app) {
          if (testCase.app !== form.app) {
            return false
          }
        }

        return true
      })
    })



    const handleAdd = () => {
      dialogTitle.value = t('collectStrategy.addStrategy')
      dialogVisible.value = true
      resetForm()
    }

    const handleEdit = (row) => {
      dialogTitle.value = t('collectStrategy.editStrategy')
      
      // 解析JSON字符串格式的字段
      let testCaseCustomParams = {}
      let testCaseExecutionCounts = {}
      let selectedIds = []
      
      try {
        if (row.testCaseCustomParams && typeof row.testCaseCustomParams === 'string') {
          testCaseCustomParams = JSON.parse(row.testCaseCustomParams)
        } else if (row.testCaseCustomParams && typeof row.testCaseCustomParams === 'object') {
          testCaseCustomParams = row.testCaseCustomParams
        }
      } catch (error) {
        console.warn('Failed to parse testCaseCustomParams:', error)
        testCaseCustomParams = {}
      }
      
      try {
        if (row.testCaseExecutionCounts && typeof row.testCaseExecutionCounts === 'string') {
          testCaseExecutionCounts = JSON.parse(row.testCaseExecutionCounts)
        } else if (row.testCaseExecutionCounts && typeof row.testCaseExecutionCounts === 'object') {
          testCaseExecutionCounts = row.testCaseExecutionCounts
        }
      } catch (error) {
        console.warn('Failed to parse testCaseExecutionCounts:', error)
        testCaseExecutionCounts = {}
      }
      
      // 解析选中的用例ID列表
      try {
        if (row.selectedTestCaseIds && typeof row.selectedTestCaseIds === 'string') {
          selectedIds = JSON.parse(row.selectedTestCaseIds)
        } else if (Array.isArray(row.selectedTestCaseIds)) {
          selectedIds = row.selectedTestCaseIds
        }
        // 确保所有ID都是数字类型
        selectedIds = selectedIds.map(id => typeof id === 'string' ? parseInt(id) : Number(id)).filter(id => !isNaN(id))
      } catch (error) {
        console.warn('Failed to parse selectedTestCaseIds:', error)
        selectedIds = []
      }
      
      // 如果没有selectedTestCaseIds字段，从testCaseExecutionCounts中获取（兼容旧数据）
      if (selectedIds.length === 0 && Object.keys(testCaseExecutionCounts).length > 0) {
        selectedIds = Object.keys(testCaseExecutionCounts)
          .filter(testCaseId => testCaseExecutionCounts[testCaseId] > 0)
          .map(id => parseInt(id))
      }
      
      console.log('解析后的选中用例ID:', selectedIds)
      
      // 转换testCaseCustomParams，确保value是数组格式
      const convertedTestCaseCustomParams = {}
      Object.keys(testCaseCustomParams).forEach(testCaseId => {
        const params = testCaseCustomParams[testCaseId]
        if (Array.isArray(params)) {
          convertedTestCaseCustomParams[testCaseId] = params.map(param => {
            let valueArray = []
            if (Array.isArray(param.value)) {
              // 如果已经是数组，直接使用
              valueArray = param.value
            } else if (param.value) {
              // 如果是字符串，尝试按逗号分隔，如果没有逗号则作为单个值
              const valueStr = String(param.value).trim()
              if (valueStr.includes(',')) {
                valueArray = valueStr.split(',').map(v => v.trim()).filter(v => v)
              } else if (valueStr) {
                valueArray = [valueStr]
              }
            }
            return {
              key: param.key || '',
              value: valueArray,
            }
          })
        }
      })

      // 只复制必要的字段，避免传递额外字段
      Object.assign(form, {
        id: row.id,
        name: row.name,
        collectCount: row.collectCount,
        testCaseSetId: row.testCaseSetId,
        businessCategory: row.businessCategory || '',
        app: row.app || '',
        intent: row.intent || '',
        customParams: row.customParamList || [],
        testCaseCustomParams: convertedTestCaseCustomParams,
        testCaseExecutionCounts: testCaseExecutionCounts,
        description: row.description,
        status: row.status,
      })
      
      // 设置选中的用例ID列表
      selectedTestCaseIds.value = selectedIds
      
      // 编辑策略时从第一步开始
      currentStep.value = 0
      
      // 如果选择了用例集，加载用例列表
      if (row.testCaseSetId) {
        handleTestCaseSetChange(row.testCaseSetId).then(() => {
          // 用例列表加载完成后，设置对应的appEn（需要在进入第二步之前设置，以便筛选条件生效）
          if (row.app) {
            handleAppChange(row.app)
          }
          
          // 设置已选中的用例ID列表（优先使用selectedTestCaseIds字段）
          selectedTestCaseIds.value = selectedIds
          
          // 自动进入第二步，显示用例列表
          // 使用 nextTick 确保筛选条件已应用
          nextTick(() => {
            // 如果有选中的用例，直接进入第三步
            if (selectedIds.length > 0) {
              // 先进入第二步，然后自动进入第三步
              currentStep.value = 1
              showTestCaseList.value = true
              // 加载用例自定义参数列表
              loadTestCaseCustomParams().then(() => {
                // 等待用例列表加载完成后再进入第三步
                setTimeout(() => {
                  currentStep.value = 2
                  if (selectedTestCases.value.length > 0) {
                    activeBatchConfigItems.value = [selectedTestCases.value[0].id]
                  }
                }, 500)
              })
            } else {
              currentStep.value = 1
              showTestCaseList.value = true
            }
            
            // 使用 watch 监听 filteredTestCaseList 的变化，确保筛选完成后再勾选
            // 先清除之前的 watch 监听器（如果存在）
            if (testCaseListWatchStop.value) {
              testCaseListWatchStop.value()
              testCaseListWatchStop.value = null
            }
            
            let stopWatchFn = null
            const stopWatch = watch(
              () => filteredTestCaseList.value,
              (newList) => {
                // 确保用例列表已加载且不为空
                if (newList.length > 0 && selectedIds.length > 0) {
                  // 等待 DOM 更新和表格渲染
                  nextTick(async () => {
                    setTimeout(async () => {
                      if (testCaseTableRef.value) {
                        console.log('准备勾选用例，selectedIds:', selectedIds)
                        console.log('用例列表总数:', newList.length)
                        console.log('用例列表:', newList.map(tc => ({ id: tc.id, name: tc.name })))
                        
                        // 先清除所有选中状态
                        testCaseTableRef.value.clearSelection()
                        
                        // 确保 selectedIds 中的元素都是数字类型
                        const numericSelectedIds = selectedIds.map(id => typeof id === 'string' ? parseInt(id) : Number(id))
                        
                        // 然后选中对应的用例（使用严格比较，确保类型一致）
                        const rowsToSelect = newList.filter(
                          testCase => {
                            const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
                            return numericSelectedIds.includes(testCaseId)
                          }
                        )
                        
                        console.log('需要勾选的用例数量:', rowsToSelect.length)
                        console.log('需要勾选的用例:', rowsToSelect.map(tc => ({ id: tc.id, name: tc.name })))
                        
                        if (rowsToSelect.length > 0) {
                          // 等待一下确保清除完成
                          await new Promise(resolve => setTimeout(resolve, 100))
                          
                          // 从当前表格数据中重新获取行对象，确保引用正确
                          const currentRowsToSelect = newList.filter(
                            testCase => {
                              const testCaseId = typeof testCase.id === 'string' ? parseInt(testCase.id) : Number(testCase.id)
                              return numericSelectedIds.includes(testCaseId)
                            }
                          )
                          
                          // 然后选中对应的用例
                          currentRowsToSelect.forEach(testCaseRow => {
                            testCaseTableRef.value.toggleRowSelection(testCaseRow, true)
                          })
                          
                          console.log('用例勾选完成，共勾选', currentRowsToSelect.length, '个用例')
                          
                          // 等待 DOM 更新完成后再调用 handleTestCaseSelectionChange
                          await nextTick()
                          // 再次等待确保表格选中状态已更新
                          await new Promise(resolve => setTimeout(resolve, 200))
                          
                          // 调用 handleTestCaseSelectionChange 方法，触发选择变化事件
                          handleTestCaseSelectionChange(currentRowsToSelect)
                          // 停止监听，避免重复触发（使用 nextTick 确保 stopWatchFn 已被赋值）
                          await nextTick()
                          if (stopWatchFn) {
                            stopWatchFn()
                          }
                        } else {
                          console.warn('没有找到需要勾选的用例，可能ID不匹配或已被筛选条件过滤')
                          console.warn('筛选后的用例ID列表:', newList.map(tc => tc.id))
                          console.warn('需要勾选的用例ID列表:', numericSelectedIds)
                          // 即使没有找到用例，也停止监听
                          await nextTick()
                          if (stopWatchFn) {
                            stopWatchFn()
                          }
                        }
                      }
                    }, 500)
                  })
                } else if (newList.length === 0) {
                  console.warn('用例列表为空，可能是筛选条件导致')
                  // 停止监听
                  nextTick(() => {
                    if (stopWatchFn) {
                      stopWatchFn()
                    }
                  })
                } else if (selectedIds.length === 0) {
                  console.log('没有需要勾选的用例')
                  // 停止监听
                  nextTick(() => {
                    if (stopWatchFn) {
                      stopWatchFn()
                    }
                  })
                }
              },
              { immediate: true }
            )
            // 保存 stopWatch 函数引用
            stopWatchFn = stopWatch
            // 保存到组件级别的引用，以便在 resetForm 中清除
            testCaseListWatchStop.value = stopWatch
          })
        }).catch(error => {
          console.error('加载用例列表失败:', error)
          ElMessage.error(t('collectStrategy.loadTestCaseListFailed') || '加载用例列表失败')
        })
      } else {
        // 如果没有用例集，也要设置已选中的用例ID列表
        selectedTestCaseIds.value = selectedIds
      }
      
      dialogVisible.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('collectStrategy.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/collect-strategy/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('collectStrategy.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('collectStrategy.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        // 验证是否至少选中一个用例
        if (selectedTestCaseIds.value.length === 0) {
          ElMessage.error(t('collectStrategy.atLeastOneTestCaseRequired'))
          return
        }
        
        // 只保存勾选的用例信息
        // 转换testCaseCustomParams，将数组格式的value转换为字符串（逗号分隔）
        const convertedTestCaseCustomParams = {}
        selectedTestCaseIds.value.forEach(testCaseId => {
          const params = form.testCaseCustomParams[testCaseId]
          if (params && Array.isArray(params) && params.length > 0) {
            convertedTestCaseCustomParams[testCaseId] = params.map(param => {
              // 如果value是数组，转换为逗号分隔的字符串
              let valueStr = ''
              if (Array.isArray(param.value)) {
                valueStr = param.value.filter(v => v && v.trim()).join(',')
              } else if (param.value) {
                valueStr = String(param.value)
              }
              return {
                key: param.key || '',
                value: valueStr
              }
            }).filter(param => param.key && param.value) // 过滤掉空的参数
          }
        })
        
        // 只保存勾选用例的执行次数
        const selectedTestCaseExecutionCounts = {}
        selectedTestCaseIds.value.forEach(testCaseId => {
          if (form.testCaseExecutionCounts[testCaseId] && form.testCaseExecutionCounts[testCaseId] > 0) {
            selectedTestCaseExecutionCounts[testCaseId] = form.testCaseExecutionCounts[testCaseId]
          }
        })
        
        // 发送所有字段到后端
        const submitData = {
          name: form.name,
          collectCount: form.collectCount,
          testCaseSetId: form.testCaseSetId,
          businessCategory: form.businessCategory || null,
          app: form.app || null,
          intent: form.intent || null,
          customParams: form.customParams.length > 0 ? JSON.stringify(form.customParams) : null,
          testCaseCustomParams: Object.keys(convertedTestCaseCustomParams).length > 0 ? JSON.stringify(convertedTestCaseCustomParams) : null,
          testCaseExecutionCounts: Object.keys(selectedTestCaseExecutionCounts).length > 0 ? JSON.stringify(selectedTestCaseExecutionCounts) : null,
          selectedTestCaseIds: JSON.stringify(selectedTestCaseIds.value),
          description: form.description,
          status: form.status,
        }
        
        if (form.id) {
          await request({
            url: `/collect-strategy/${form.id}`,
            method: 'put',
            data: submitData,
          })
          ElMessage.success(t('collectStrategy.updateSuccess'))
        } else {
          await request({
            url: '/collect-strategy',
            method: 'post',
            data: submitData,
          })
          ElMessage.success(t('collectStrategy.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('collectStrategy.submitFailed'), error)
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        collectCount: 1,
        testCaseSetId: null,
        businessCategory: '',
        app: '',
        intent: '',
        customParams: [],
        testCaseCustomParams: {},
        testCaseExecutionCounts: {},
        description: '',
        status: 1,
      })
      selectedTestCaseSet.value = null
      testCaseList.value = []
      showTestCaseList.value = false
      selectedTestCaseIds.value = []
      selectedAppEn.value = ''
      currentStep.value = 0 // 重置步骤
      activeBatchConfigItems.value = [] // 重置批量配置展开项
      testCaseInfoCollapse.value = [] // 重置用例信息折叠状态
      clearFilterOptions()
      
      // 清除 watch 监听器
      if (testCaseListWatchStop.value) {
        testCaseListWatchStop.value()
        testCaseListWatchStop.value = null
      }
      
      // 清除表格选中状态
      if (testCaseTableRef.value) {
        testCaseTableRef.value.clearSelection()
      }
      
      if (formRef.value) {
        formRef.value.resetFields()
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
    
    // 查看用例集详情
    const viewTestCaseSetDetail = (testCaseSetId) => {
      if (testCaseSetId) {
        // 跳转到用例集详情页面
        window.open(`/test-case-set/detail/${testCaseSetId}`, '_blank')
      }
    }

    // 检查路由参数，如果 action=add，自动打开新增对话框
    const checkRouteParams = () => {
      if (route.query.action === 'add') {
        handleAdd()
        
        // 如果从app版本变更页面跳转过来，填充app信息
        if (route.query.fromAppVersion === 'true') {
          const appName = route.query.appName || ''
          const appVersion = route.query.appVersion || ''
          const appCategory = route.query.appCategory || ''
          const appDescription = route.query.appDescription || ''
          
          // 根据app信息自动生成策略名称
          if (appName) {
            let strategyName = appName
            if (appVersion) {
              strategyName += `-${appVersion}`
            }
            strategyName += '采集策略'
            form.name = strategyName
          }
          
          // 填充app字段（应用名称）
          if (appName) {
            form.app = appName
          }
          
          // 业务大类不赋值（保持为空）
          
          // 如果有描述，填充到策略描述中
          if (appDescription) {
            let desc = `应用：${appName}`
            if (appVersion) {
              desc += `，版本：${appVersion}`
            }
            if (appCategory) {
              desc += `，类别：${appCategory}`
            }
            desc += `\n${appDescription}`
            form.description = desc
          }
        }
        
        // 清除路由参数，避免刷新时重复触发
        router.replace({ name: 'CollectStrategy', query: {} })
      }
    }

    onMounted(() => {
      loadData()
      loadTestCaseSetOptions()
      loadIntentOptions()
      // 延迟检查路由参数，确保数据已加载
      setTimeout(() => {
        checkRouteParams()
      }, 500)
    })

    return {
      loading,
      tableData,
      pagination,
      dialogVisible,
      dialogTitle,
      formRef,
      form,
      rules,
      testCaseSetOptions,
      selectedTestCaseSet,
      testCaseList,
      showTestCaseList,
      businessCategoryOptions,
      appOptions,
      intentOptions,
      selectedAppEn,
      customParamRules,
      filteredTestCaseList,
      batchConfigDialogVisible,
      activeBatchConfigItems,
      testCaseParamsDialogVisible,
      currentTestCase,
      currentTestCaseParams,
      currentTestCaseExecutionCount,
      getTestCaseParamCount,
      getTestCaseExecutionCount,
      handleNextStep,
      handlePrevStep,
      canProceedToNextStep,
      currentStep,
      addBatchTestCaseParam,
      removeBatchTestCaseParam,
      saveBatchConfig,
      getBatchParamKeyOptions,
      getBatchParamValueOptions,
      handleBatchParamKeyChange,
      handleConfigTestCaseParams,
      addTestCaseParam,
      removeTestCaseParam,
      saveTestCaseParams,
      resetTestCaseParamsDialog,
      filteredParamKeyOptions,
      getParamValueOptions,
      handleParamKeyChange,
      loadData,
      loadTestCaseSetOptions,
      loadIntentOptions,
      handleTestCaseSetChange,
      extractFilterOptions,
      updateAppOptionsByCategory,
      handleBusinessCategoryChange,
      clearBusinessCategory,
      handleAppChange,
      clearApp,
      clearFilterOptions,
      addCustomParam,
      removeCustomParam,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
      viewTestCaseSetDetail,
      handleTestCaseSelectionChange,
      selectedTestCaseIds,
      selectedTestCases,
    }
  },
}
</script>

<style scoped>
.collect-strategy-page {
  padding: 20px;
}

/* 步骤导航样式 */
.step-navigation {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.step-content {
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 表单紧凑样式 */
.strategy-form .el-form-item {
  margin-bottom: 16px;
}

.strategy-form .el-form-item:last-child {
  margin-bottom: 0;
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

/* 用例集信息样式 */
.test-case-set-info {
  font-size: 12px;
  line-height: 1.4;
}

.test-case-set-info .set-name {
  margin-bottom: 8px;
  color: #303133;
  font-size: 14px;
}

.test-case-set-info .set-description {
  margin-bottom: 8px;
  color: #606266;
}

.test-case-set-info .set-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.test-case-set-info .label {
  font-weight: 500;
  color: #909399;
}

.test-case-set-info .el-link {
  font-size: 11px;
}

/* 用例列表样式 */
.test-case-list-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
  width: 100%;
  max-width: 100%;
}

.test-case-summary {
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

.test-case-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

/* 自定义参数样式 */
.custom-params-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.custom-params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.params-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.empty-params {
  text-align: center;
  padding: 20px 0;
}

.custom-params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.param-item .param-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.param-tag {
  margin-bottom: 4px;
}

.param-tag:last-child {
  margin-bottom: 0;
}

.test-case-table .el-table {
  background-color: white;
}

/* 用例自定义参数配置对话框样式 */
.test-case-params-dialog {
  padding: 0;
}

.test-case-info-header {
  margin-bottom: 16px;
}

/* 执行次数配置样式 */
.execution-config-section {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.custom-params-section {
  margin-top: 16px;
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.param-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.param-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.param-input {
  flex: 1;
}

.test-case-table .el-table th {
  background-color: #f5f7fa;
}

/* 下一步按钮容器 */
.next-step-container {
  margin-top: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

/* 批量配置对话框样式 */
.batch-config-container {
  padding: 8px;
}

.batch-config-item-title {
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 16px;
}

.batch-config-item-content {
  padding: 16px;
  background-color: #fafafa;
}

.config-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.config-section-title .el-icon {
  font-size: 16px;
  color: #409eff;
}

.empty-params-inline {
  padding: 20px;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.params-list-inline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
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
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

/* 筛选项行布局样式 */
.filter-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.filter-item-row .el-select {
  flex: 1;
}

/* App筛选行布局样式 */
.app-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.app-filter-row .el-select {
  flex: 1;
}

.app-filter-row .el-input {
  flex: 1;
}


</style>
