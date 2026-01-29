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
              v-model="searchForm.nation"
              :placeholder="$t('experienceTest.clientData.searchNation')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.operator"
              :placeholder="$t('experienceTest.clientData.searchOperator')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.prb"
              :placeholder="$t('experienceTest.clientData.searchPrb')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.rsrp"
              :placeholder="$t('experienceTest.clientData.searchRsrp')"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-input
              v-model="searchForm.userCategory"
              :placeholder="$t('experienceTest.clientData.searchUserCategory')"
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
            <el-table-column prop="nation" :label="$t('experienceTest.clientData.nation')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="operator" :label="$t('experienceTest.clientData.operator')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="prb" :label="$t('experienceTest.clientData.prb')" min-width="100" show-overflow-tooltip />
            <el-table-column prop="rsrp" :label="$t('experienceTest.clientData.rsrp')" min-width="100" show-overflow-tooltip />
            <el-table-column prop="userCategory" :label="$t('experienceTest.clientData.userCategory')" min-width="120" show-overflow-tooltip />
            <el-table-column prop="service" :label="$t('experienceTest.clientData.service')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="app" :label="$t('experienceTest.clientData.app')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="startTime" :label="$t('experienceTest.clientData.startTime')" min-width="180" show-overflow-tooltip />
            <el-table-column prop="endTime" :label="$t('experienceTest.clientData.endTime')" min-width="180" show-overflow-tooltip />
            <el-table-column :label="$t('common.operations')" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
                  {{ $t('common.view') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                  {{ $t('common.delete') }}
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
          <div class="info-right" v-if="summaryData">
          <div class="detail-container" v-loading="detailLoading">
          <!-- 对比按钮 -->
            <div class="comparison-button-container" v-if="taskDetail.taskInfo">
              <el-button type="primary" @click="handleGoToComparison">
                <el-icon><DataAnalysis /></el-icon>
                {{ $t('experienceTest.clientData.goToComparison') }}
              </el-button>
            </div>
          <!-- 基础信息和Summary信息 -->
            <div class="info-section-header" v-if="taskDetail.taskInfo">
              <h3 class="section-title">{{ $t('experienceTest.clientData.basicInfo') }}</h3>
              <div style="display: flex; gap: 10px;">
                <el-button 
                  v-if="!editingBasicInfo"
                  type="primary"
                  size="small"
                  @click="handleEditBasicInfo"
                >
                  {{ $t('common.edit') }}
                </el-button>
                <template v-else>
                  <el-button 
                    type="primary"
                    size="small"
                    @click="handleSaveBasicInfo"
                    :loading="basicInfoSaving"
                  >
                    {{ $t('common.save') }}
                  </el-button>
                  <el-button 
                    size="small"
                    @click="handleCancelBasicInfoEdit"
                  >
                    {{ $t('common.cancel') }}
                  </el-button>
                </template>
                <el-button 
                  type="text" 
                  @click="showBasicInfo = !showBasicInfo"
                >
                  <el-icon v-if="showBasicInfo"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  <span style="margin-left: 4px;">{{ showBasicInfo ? $t('common.collapse') : $t('common.expand') }}</span>
                </el-button>
              </div>
            </div>
            <div class="info-section" v-if="taskDetail.taskInfo && showBasicInfo">
              <div class="info-container">
                <!-- 左侧：基础信息 -->
                <div class="info-left">
                  <h3 class="section-title">{{ $t('experienceTest.clientData.basicInfo') }}</h3>
                  <el-descriptions :column="1" border>
                    <el-descriptions-item :label="$t('experienceTest.clientData.taskId')">
                      {{ taskDetail.taskInfo.taskId }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.service')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.service"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.service || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.app')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.app"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.app || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.nation')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.nation"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.nation || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.operator')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.operator"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.operator || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.deviceId')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.deviceId"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.deviceId || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.startTime')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.startTime"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.startTime || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.endTime')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.endTime"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.endTime || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.prb')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.prb"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.prb || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.rsrp')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.rsrp"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.rsrp || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.userCategory')">
                      <el-input
                        v-if="editingBasicInfo"
                        v-model="editingBasicInfoData.userCategory"
                        size="small"
                        style="width: 100%;"
                      />
                      <span v-else>{{ taskDetail.taskInfo.userCategory || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('common.createTime')">
                      {{ taskDetail.taskInfo.createTime }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 右侧：Summary 数据统计 -->
                  <h3 class="section-title">{{ $t('experienceTest.clientData.summary') }}</h3>
                  <el-descriptions :column="1" border>
                    <el-descriptions-item :label="$t('experienceTest.clientData.stunNumber')">
                      {{ summaryData.stunNumber || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.stunRate')">
                      {{ summaryData.stunRate || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgUplinkRtt')">
                      {{ summaryData.avgUplinkRtt || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgDownlinkRtt')">
                      {{ summaryData.avgDownlinkRtt || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgUplinkSpeed')">
                      {{ summaryData.avgUplinkSpeed || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgDownlinkSpeed')">
                      {{ summaryData.avgDownlinkSpeed || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgUplinkLost')">
                      {{ summaryData.avgUplinkLost || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgDownlinkLost')">
                      {{ summaryData.avgDownlinkLost || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('experienceTest.clientData.avgLost')">
                      {{ summaryData.avgLost || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </div>
            <el-empty v-if="!taskDetail.taskInfo && !detailLoading" :description="$t('common.noData')" />

            <!-- 数据统计子tab -->
            <div class="data-tabs-wrapper">
            <el-tabs v-model="activeDetailTab" type="border-card" class="data-tabs">
          <!-- vMOS数据 -->
          <el-tab-pane :label="$t('experienceTest.clientData.vmos')" name="vmos">
            <el-table :data="taskDetail.vmosDataList" border stripe style="width: 100%">
              <el-table-column prop="sequenceNumber" :label="$t('experienceTest.clientData.sequenceNumber')" width="100" />
              <el-table-column :label="$t('experienceTest.clientData.speedKbps')" width="100">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id"
                    v-model="scope.row.speed"
                    size="small"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.speed || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.resolution')" width="120">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id && (taskDetail.taskInfo?.service === 'voip')"
                    v-model="scope.row.resolution"
                    size="small"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.resolution || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.rttMs')" width="100">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id"
                    v-model="scope.row.rtt"
                    size="small"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.rtt || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.packetLossRatePercent')" width="120">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id"
                    v-model="scope.row.packetLossRate"
                    size="small"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.packetLossRate || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.stutterRatioPercent')" width="120">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id"
                    v-model="scope.row.stutterRatio"
                    size="small"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.stutterRatio || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sBitrate')" width="100">
                <template #default="scope">
                  <el-input
                    v-if="editingVmosRowId === scope.row.id && (taskDetail.taskInfo?.service === 'voip')"
                    v-model="scope.row.bitrate"
                    size="small"
                    placeholder="bitrate"
                    @keyup.enter="handleSaveVmosRow(scope.row)"
                    @input="handleVmosFieldChange(scope.row)"
                  />
                  <span v-else>{{ scope.row.bitrate || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sRtt')" width="120">
                <template #default="scope">
                  {{ scope.row.calculateResolution || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sQuality')" width="100">
                <template #default="scope">
                  {{ scope.row.videoExperience || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sInteraction')" width="120">
                <template #default="scope">
                  {{ scope.row.interactionExperience || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sView')" width="120">
                <template #default="scope">
                  {{ scope.row.presentationExperience || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sLostPacketRate')" width="140">
                <template #default="scope">
                  {{ scope.row.sLostPacketRate || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sStallRate')" width="140">
                <template #default="scope">
                  {{ scope.row.sStallRate || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.alpha')" width="80">
                <template #default="scope">
                  {{ scope.row.alpha || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.beta')" width="80">
                <template #default="scope">
                  {{ scope.row.beta || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.vmos')" width="80">
                <template #default="scope">
                  {{ scope.row.vmos || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.avgQoe')" width="100">
                <template #default="scope">
                  {{ scope.row.avgQoe || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.operations')" width="150" fixed="right">
                <template #default="scope">
                  <template v-if="editingVmosRowId === scope.row.id">
                    <el-button type="primary" size="small" @click="handleSaveVmosRow(scope.row)" :loading="vmosSaving">
                      {{ $t('common.save') }}
                    </el-button>
                    <el-button size="small" @click="handleCancelVmosEdit(scope.row)">
                      {{ $t('common.cancel') }}
                    </el-button>
                  </template>
                  <el-button v-else type="primary" size="small" @click="handleEditVmosRow(scope.row)" :disabled="editingVmosRowId !== null">
                    {{ $t('common.edit') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!taskDetail.vmosDataList || taskDetail.vmosDataList.length === 0" :description="$t('common.noData')" />
          </el-tab-pane>

          <!-- 上下行速率统计 -->
          <el-tab-pane 
            v-if="taskDetail.speedDataList && taskDetail.speedDataList.length > 0"
            :label="$t('experienceTest.clientData.speedStatistics')" 
            name="speed"
          >
            <el-table :data="taskDetail.speedDataList" border stripe style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="dlSpeed" :label="$t('experienceTest.clientData.dlSpeed')" width="150" />
              <el-table-column prop="ulSpeed" :label="$t('experienceTest.clientData.ulSpeed')" width="150" />
              <el-table-column prop="total" :label="$t('experienceTest.clientData.total')" width="150" />
            </el-table>
          </el-tab-pane>

          <!-- 上下行RTT统计 -->
          <el-tab-pane 
            v-if="taskDetail.rttDataList && taskDetail.rttDataList.length > 0"
            :label="$t('experienceTest.clientData.rttStatistics')" 
            name="rtt"
          >
            <el-table :data="taskDetail.rttDataList" border stripe style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="indexTime" :label="$t('experienceTest.clientData.indexTime')" width="180" />
              <el-table-column prop="dlDelay" :label="$t('experienceTest.clientData.dlDelay')" width="150" />
              <el-table-column prop="ulDelay" :label="$t('experienceTest.clientData.ulDelay')" width="150" />
            </el-table>
          </el-tab-pane>

          <!-- 上下行丢包率统计 -->
          <el-tab-pane 
            v-if="taskDetail.lostDataList && taskDetail.lostDataList.length > 0"
            :label="$t('experienceTest.clientData.lostStatistics')" 
            name="lost"
          >
            <el-table :data="taskDetail.lostDataList" border stripe style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="indexTime" :label="$t('experienceTest.clientData.indexTime')" width="180" />
              <el-table-column prop="dlLoss" :label="$t('experienceTest.clientData.dlLoss')" width="150" />
              <el-table-column prop="ulLoss" :label="$t('experienceTest.clientData.ulLoss')" width="150" />
              <el-table-column prop="totalLoss" :label="$t('experienceTest.clientData.totalLoss')" width="150" />
            </el-table>
          </el-tab-pane>

          <!-- 视频卡顿统计 -->
          <el-tab-pane 
            v-if="taskDetail.videoDataList && taskDetail.videoDataList.length > 0"
            :label="$t('experienceTest.clientData.videoStatistics')" 
            name="video"
          >
            <el-table :data="taskDetail.videoDataList" border stripe style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="time" :label="$t('experienceTest.clientData.time')" width="180" />
              <el-table-column prop="catonTime" :label="$t('experienceTest.clientData.catonTime')" width="150" />
            </el-table>
          </el-tab-pane>

          <!-- 游戏延时统计 -->
          <el-tab-pane 
            v-if="taskDetail.gameDelayDataList && taskDetail.gameDelayDataList.length > 0"
            :label="$t('experienceTest.clientData.gameDelayStatistics')" 
            name="gameDelay"
          >
            <el-table :data="taskDetail.gameDelayDataList" border stripe style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="indexValue" :label="$t('experienceTest.clientData.sequenceNumber')" width="120" />
              <el-table-column prop="delay" :label="$t('experienceTest.clientData.delayMs')" width="150" />
            </el-table>
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
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Plus, Refresh, UploadFilled, Search, ArrowUp, ArrowDown, DataAnalysis } from '@element-plus/icons-vue'
import { uploadClientDataFile, getClientDataPage, getClientDataDetail, updateVmosData, updateTaskInfo, deleteTaskInfo } from '@/api/test-settings'

export default {
  name: 'ClientData',
  components: {
    Plus,
    Refresh,
    UploadFilled,
    Search,
    ArrowUp,
    ArrowDown,
    DataAnalysis,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const loading = ref(false)
    const tableData = ref([])
    const uploadDialogVisible = ref(false)
    const uploading = ref(false)
    const selectedFile = ref(null)
    const uploadRef = ref(null)
    // 初始化主tab，默认显示任务列表
    const activeMainTab = ref('taskList')
    const detailLoading = ref(false)
    const activeDetailTab = ref('vmos')
    const showBasicInfo = ref(true)
    const taskDetail = ref({
      taskInfo: null,
      vmosDataList: [],
      speedDataList: [],
      rttDataList: [],
      lostDataList: [],
      videoDataList: [],
      gameDelayDataList: [],
    })
    // vMOS编辑相关
    const editingVmosRowId = ref(null)
    const vmosSaving = ref(false)
    const vmosEditBackup = ref({})
    
    // 基础信息编辑相关
    const editingBasicInfo = ref(false)
    const basicInfoSaving = ref(false)
    const editingBasicInfoData = ref({
      service: '',
      app: '',
      nation: '',
      operator: '',
      deviceId: '',
      startTime: '',
      endTime: '',
      prb: '',
      rsrp: '',
      userCategory: '',
    })

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

    // 解析 summary JSON 字符串
    const summaryData = computed(() => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.taskInfo.summary) {
        return null
      }
      try {
        const summaryStr = taskDetail.value.taskInfo.summary
        if (typeof summaryStr === 'string') {
          return JSON.parse(summaryStr)
        }
        return summaryStr
      } catch (error) {
        console.error('解析 summary 失败:', error)
        return null
      }
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

    // 跳转到端网数据对比页面
    const handleGoToComparison = () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.taskInfo.taskId) {
        ElMessage.warning('任务ID不存在')
        return
      }
      
      // 跳转到对比页面，并传递taskId参数，自动打开详情页
      router.push({
        path: '/experience-test/data-comparison/index',
        query: {
          taskId: taskDetail.value.taskInfo.taskId,
          autoOpenDetail: 'true',
        },
      })
    }

    const handleViewDetail = async (row) => {
      if (!row || !row.taskId) {
        ElMessage.warning('无效的数据')
        return
      }
      
      try {
        // 切换到详情tab
        activeMainTab.value = 'detail'
        activeDetailTab.value = 'vmos'
        detailLoading.value = true
        
        // 重置编辑状态
        editingVmosRowId.value = null
        vmosEditBackup.value = {}
        editingBasicInfo.value = false
        editingBasicInfoData.value = {
          service: '',
          app: '',
          nation: '',
          operator: '',
          deviceId: '',
          startTime: '',
          endTime: '',
          prb: '',
          rsrp: '',
          userCategory: '',
        }
        
        // 重置数据
        taskDetail.value = {
          taskInfo: null,
          vmosDataList: [],
          speedDataList: [],
          rttDataList: [],
          lostDataList: [],
          videoDataList: [],
          gameDelayDataList: [],
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
            gameDelayDataList: response.data.gameDelayDataList || [],
          }
          // 根据数据是否存在设置默认显示的tab
          if (taskDetail.value.vmosDataList && taskDetail.value.vmosDataList.length > 0) {
            activeDetailTab.value = 'vmos'
          } else if (taskDetail.value.speedDataList && taskDetail.value.speedDataList.length > 0) {
            activeDetailTab.value = 'speed'
          } else if (taskDetail.value.rttDataList && taskDetail.value.rttDataList.length > 0) {
            activeDetailTab.value = 'rtt'
          } else if (taskDetail.value.lostDataList && taskDetail.value.lostDataList.length > 0) {
            activeDetailTab.value = 'lost'
          } else if (taskDetail.value.videoDataList && taskDetail.value.videoDataList.length > 0) {
            activeDetailTab.value = 'video'
          } else if (taskDetail.value.gameDelayDataList && taskDetail.value.gameDelayDataList.length > 0) {
            activeDetailTab.value = 'gameDelay'
          } else {
            activeDetailTab.value = 'vmos'
          }
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
          if (result.gameDelayDataCount) {
            message += `\n${t('experienceTest.clientData.gameDelayDataCount')}: ${result.gameDelayDataCount}`
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

    const handleEditVmosRow = (row) => {
      if (!row || !row.id) {
        ElMessage.warning('无效的数据')
        return
      }
      
      // 如果已经有正在编辑的行，先提示
      if (editingVmosRowId.value !== null && editingVmosRowId.value !== row.id) {
        ElMessage.warning('请先完成当前行的编辑')
        return
      }
      
      // 保存原始数据用于取消时恢复（包括计算字段）
      vmosEditBackup.value = {
        speed: row.speed || '',
        rtt: row.rtt || '',
        packetLossRate: row.packetLossRate || '',
        stutterRatio: row.stutterRatio || '',
        bitrate: row.bitrate || '',
        resolution: row.resolution || '',
        videoExperience: row.videoExperience || '',
        interactionExperience: row.interactionExperience || '',
        calculateResolution: row.calculateResolution || '',
        presentationExperience: row.presentationExperience || '',
        sLostPacketRate: row.sLostPacketRate || '',
        sStallRate: row.sStallRate || '',
        alpha: row.alpha || '',
        beta: row.beta || '',
        vmos: row.vmos || '',
      }
      
      editingVmosRowId.value = row.id
    }

    // 处理vMOS字段变化，实时计算（根据业务大类）
    const handleVmosFieldChange = (row) => {
      const service = taskDetail.value.taskInfo?.service
      
      // 如果业务大类为shortvideo，则实时计算相关字段
      if (service === 'shortvideo') {
        const calculated = calculateShortvideoVmos(
          row.speed || '0',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.calculateResolution = calculated.calculateResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'voip') {
        // 如果业务大类为voip，则实时计算相关字段
        const calculated = calculateVoipVmos(
          row.bitrate || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.calculateResolution = calculated.calculateResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      }
    }

    // 分辨率映射函数（voip使用）
    const getResolutionValue = (resolution) => {
      const resolutionMap = {
        144: 36864,
        270: 129600,
        360: 230400,
        480: 409920,
        720: 921600,
        1080: 2073600,
        1556: 3186688,
        2160: 8294400,
        2880: 14745600,
        4320: 33004800,
      }
      const resNum = parseFloat(resolution) || 0
      return resolutionMap[resNum] || resNum
    }

    // 计算voip业务大类的vMOS数据
    const calculateVoipVmos = (bitrate, resolution, rtt, packetLossRate, stutterRatio) => {
      // 转换为数字，如果为空或无效则使用0
      const bitrateNum = parseFloat(bitrate) || 0
      const resolutionNum = getResolutionValue(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 常量定义
      const v1 = 4.1192
      const v2 = 0.0975
      const v3 = 1.2667
      const v4 = 0.3177
      const v5 = 2.1276
      const fr = 30
      const v12 = -0.6571
      const v13 = 232000
      const v14 = -1.295
      const v60 = 3.615
      const v61 = 396.6
      const v62 = 0.256
      const v63 = -2.016
      const v58 = 5
      const v59 = 1.382
      const a1 = 5
      const g1 = 0.15
      const g2 = 0.15

      // s_bitrate = 1+ v1 - v1/(1+ powf(bitrate / (v2 * powf(Fr, v3) * prof(resolution, v4)), v5))
      // prof函数应该是pow函数
      let sBitrate = 1
      const denominator = v2 * Math.pow(fr, v3) * Math.pow(resolutionNum, v4)
      if (denominator !== 0) {
        sBitrate = 1 + v1 - v1 / (1 + Math.pow(bitrateNum / denominator, v5))
      }

      // s_resolution = 1+v12 - v12 / (1 + powf(resolution / v13, v14))
      let sResolution = 1
      if (v13 !== 0) {
        sResolution = 1 + v12 - v12 / (1 + Math.pow(resolutionNum / v13, v14))
      }

      // sQuality = max(min((s_bitrate * s_resolution), 5), 1)
      const sQuality = Math.max(Math.min(sBitrate * sResolution, 5), 1)

      // s_RTT = max(min(1 + v60 - v60 / (1+ powf(RTT / v61 + v62, v63)), 5), 1)
      let sRtt = 1
      const rttDenominator = rttNum / v61 + v62
      if (rttDenominator > 0) {
        sRtt = Math.max(Math.min(1 + v60 - v60 / (1 + Math.pow(rttDenominator, v63)), 5), 1)
      }

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = max(min( v58 * exp(-PLR / v59), 5), 1), PLR = 100 * lost_packet_rate
      const plr = 100 * packetLossRateNum
      const sLostPacketRate = Math.max(Math.min(v58 * Math.exp(-plr / v59), 5), 1)

      // s_stall_rate = -a1 * stall_rate + 5
      const sStallRate = -a1 * stutterRatioNum + 5

      // sView = max(min(4* (1- g1 * (5-s_lost_packet_rate) - g2 * (5-s_stall_rate)) + 1, 5), 1)
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp( -sInteraction /2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1+ 2 * exp(-sView /2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = max(min((sQuality - 1) * (1- α(5 - sInteraction) - β(5-sView)) + 1, 5), 1)
      const vmosValue = (sQuality - 1) * (1 - alpha * (5 - sInteraction) - beta * (5 - sView)) + 1
      const vmos = Math.max(Math.min(vmosValue, 5), 1)

      return {
        bitrate: sBitrate.toFixed(4),
        videoExperience: sQuality.toFixed(4),
        interactionExperience: sInteraction.toFixed(4),
        calculateResolution: sRtt.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算shortvideo业务大类的vMOS数据
    const calculateShortvideoVmos = (speed, rtt, packetLossRate, stutterRatio) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // s_bitrate = 5/(1+exp(-速率/928.9840))
      const sBitrate = 5 / (1 + Math.exp(-speedNum / 928.9840))

      // sQuality = s_bitrate
      const sQuality = sBitrate

      // s_RTT = 4/exp(0.0035 * Rtt) + 1
      const sRtt = 4 / Math.exp(0.0035 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4/exp(180.94 * 丢包率) + 1
      const sLostPacketRate = 4 / Math.exp(180.94 * packetLossRateNum) + 1

      // s_stall_rate = -4*卡顿率+5
      const sStallRate = -4 * stutterRatioNum + 5

      // sView = max(min(4*(1-0.04*(5-s_lost_packet_rate)-0.25*(5-s_stall_rate)) + 1, 5), 1)
      const sViewValue = 4 * ( 1 - 0.04 * (5 - sLostPacketRate) - 0.25 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1*(1+2*exp(-sInteraction/2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1*(1+2*exp(-sView/2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS数据 = (sQuality-1) * ((α*(sInteraction -1) + β*(sView-1))/(4*(α+β))) +1
      const denominator = 4 * (alpha + beta)
      let vmos = 1
      if (denominator !== 0) {
        const numerator = alpha * (sInteraction - 1) + beta * (sView - 1)
        vmos = (sQuality - 1) * (numerator / denominator) + 1
      }

      return {
        bitrate: sBitrate.toFixed(4),
        videoExperience: sQuality.toFixed(4),
        interactionExperience: sInteraction.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    const handleSaveVmosRow = async (row) => {
      if (!row || !row.id) {
        ElMessage.warning('无效的数据')
        return
      }

      vmosSaving.value = true
      try {
        // 准备要保存的数据
        const dataToSave = {
          speed: row.speed || '',
          rtt: row.rtt || '',
          packetLossRate: row.packetLossRate || '',
          stutterRatio: row.stutterRatio || '',
        }

        const service = taskDetail.value.taskInfo?.service

        // 如果业务大类为shortvideo，则计算vMOS相关字段
        if (service === 'shortvideo') {
          const calculated = calculateShortvideoVmos(
            row.speed || '0',
            row.rtt || '0',
            row.packetLossRate || '0',
            row.stutterRatio || '0',
          )
          
          // 将计算后的字段添加到保存数据中
          dataToSave.bitrate = calculated.bitrate
          dataToSave.videoExperience = calculated.videoExperience
          dataToSave.interactionExperience = calculated.interactionExperience
          dataToSave.calculateResolution = calculated.calculateResolution
          dataToSave.presentationExperience = calculated.presentationExperience
          dataToSave.sLostPacketRate = calculated.sLostPacketRate
          dataToSave.sStallRate = calculated.sStallRate
          dataToSave.alpha = calculated.alpha
          dataToSave.beta = calculated.beta
          dataToSave.vmos = calculated.vmos
        } else if (service === 'voip') {
          // 如果业务大类为voip，则计算vMOS相关字段
          // 保存原始输入值
          dataToSave.resolution = row.resolution || ''
          
          const calculated = calculateVoipVmos(
            row.bitrate || '0',
            row.resolution || '',
            row.rtt || '0',
            row.packetLossRate || '0',
            row.stutterRatio || '0',
          )
          
          // 将计算后的字段添加到保存数据中
          // bitrate字段存储s_bitrate计算结果（用于显示在sBitrate列）
          dataToSave.bitrate = calculated.bitrate
          dataToSave.videoExperience = calculated.videoExperience
          dataToSave.interactionExperience = calculated.interactionExperience
          dataToSave.calculateResolution = calculated.calculateResolution
          dataToSave.presentationExperience = calculated.presentationExperience
          dataToSave.sLostPacketRate = calculated.sLostPacketRate
          dataToSave.sStallRate = calculated.sStallRate
          dataToSave.alpha = calculated.alpha
          dataToSave.beta = calculated.beta
          dataToSave.vmos = calculated.vmos
        }

        const response = await updateVmosData(row.id, dataToSave)

        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          editingVmosRowId.value = null
          vmosEditBackup.value = {}
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Update vmos data error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        vmosSaving.value = false
      }
    }

    const handleCancelVmosEdit = (row) => {
      if (!row || !row.id) {
        return
      }
      
      // 恢复原始数据（包括计算字段）
      if (vmosEditBackup.value) {
        row.speed = vmosEditBackup.value.speed
        row.rtt = vmosEditBackup.value.rtt
        row.packetLossRate = vmosEditBackup.value.packetLossRate
        row.stutterRatio = vmosEditBackup.value.stutterRatio
        row.bitrate = vmosEditBackup.value.bitrate
        row.resolution = vmosEditBackup.value.resolution
        row.videoExperience = vmosEditBackup.value.videoExperience
        row.interactionExperience = vmosEditBackup.value.interactionExperience
        row.calculateResolution = vmosEditBackup.value.calculateResolution
        row.presentationExperience = vmosEditBackup.value.presentationExperience
        row.sLostPacketRate = vmosEditBackup.value.sLostPacketRate
        row.sStallRate = vmosEditBackup.value.sStallRate
        row.alpha = vmosEditBackup.value.alpha
        row.beta = vmosEditBackup.value.beta
        row.vmos = vmosEditBackup.value.vmos
      }
      
      editingVmosRowId.value = null
      vmosEditBackup.value = {}
    }

    // 编辑基础信息
    const handleEditBasicInfo = () => {
      if (!taskDetail.value.taskInfo) {
        return
      }
      
      // 保存原始数据
      editingBasicInfoData.value = {
        service: taskDetail.value.taskInfo.service || '',
        app: taskDetail.value.taskInfo.app || '',
        nation: taskDetail.value.taskInfo.nation || '',
        operator: taskDetail.value.taskInfo.operator || '',
        deviceId: taskDetail.value.taskInfo.deviceId || '',
        startTime: taskDetail.value.taskInfo.startTime || '',
        endTime: taskDetail.value.taskInfo.endTime || '',
        prb: taskDetail.value.taskInfo.prb || '',
        rsrp: taskDetail.value.taskInfo.rsrp || '',
        userCategory: taskDetail.value.taskInfo.userCategory || '',
      }
      
      editingBasicInfo.value = true
    }

    // 保存基础信息
    const handleSaveBasicInfo = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.taskInfo.taskId) {
        ElMessage.warning('任务信息不存在')
        return
      }

      basicInfoSaving.value = true
      try {
        const response = await updateTaskInfo(taskDetail.value.taskInfo.taskId, editingBasicInfoData.value)
        
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          editingBasicInfo.value = false
          // 刷新任务详情
          await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        console.error('Update basic info error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        basicInfoSaving.value = false
      }
    }

    // 取消编辑基础信息
    const handleCancelBasicInfoEdit = () => {
      editingBasicInfo.value = false
      editingBasicInfoData.value = {
        service: '',
        app: '',
        nation: '',
        operator: '',
        deviceId: '',
        startTime: '',
        endTime: '',
        prb: '',
        rsrp: '',
        userCategory: '',
      }
    }

    // 删除任务
    const handleDelete = async (row) => {
      if (!row || !row.taskId) {
        ElMessage.warning('无效的数据')
        return
      }

      try {
        await ElMessageBox.confirm(
          t('experienceTest.clientData.deleteConfirm'),
          t('common.warning'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        )

        const response = await deleteTaskInfo(row.taskId)
        
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          // 刷新列表
          loadData()
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete task error:', error)
          ElMessage.error(error.message || t('common.error'))
        }
      }
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
      summaryData,
      showBasicInfo,
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
      editingVmosRowId,
      vmosSaving,
      handleEditVmosRow,
      handleSaveVmosRow,
      handleCancelVmosEdit,
      handleVmosFieldChange,
      handleGoToComparison,
      editingBasicInfo,
      basicInfoSaving,
      editingBasicInfoData,
      handleEditBasicInfo,
      handleSaveBasicInfo,
      handleCancelBasicInfoEdit,
      handleDelete,
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

.comparison-button-container {
  margin-bottom: 20px;
  text-align: right;
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
  min-height: 800px;
  padding: 20px;
}

.info-section {
  margin-bottom: 20px;
}

.info-container {
  display: flex;
  gap: 20px;
}

.info-left,
.info-right {
  flex: 1;
  min-width: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 1200px) {
  .info-container {
    flex-direction: column;
  }
}

.info-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.info-section-header .section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.data-tabs-wrapper {
  margin-top: 20px;
  height: 1000px;
  overflow-y: auto;
}

.data-tabs {
  height: 100%;
}

.empty-container {
  text-align: center;
  padding: 40px;
}
</style>




















