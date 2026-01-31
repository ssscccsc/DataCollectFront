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
            <!-- 替换/回退下行速率按钮（仅在voip和meeting时显示） -->
            <div v-if="taskDetail.taskInfo && (taskDetail.taskInfo.service === 'voip' || taskDetail.taskInfo.service === 'meeting')" style="margin-bottom: 16px;">
              <el-button type="primary" @click="handleReplaceDownlinkSpeed" :disabled="isReplacingSpeed || !hasSpeedData">
                {{ $t('experienceTest.clientData.replaceDownlinkSpeed') }}
              </el-button>
              <el-button type="warning" @click="handleRevertDownlinkSpeed" :disabled="isReplacingSpeed || !hasOriginalSpeedData">
                {{ $t('experienceTest.clientData.revertDownlinkSpeed') }}
              </el-button>
            </div>
            <!-- 替换/回退游戏内RTT按钮（仅在mobile_game和mobile_game_cloud时显示） -->
            <div v-if="taskDetail.taskInfo && (taskDetail.taskInfo.service === 'mobile_game' || taskDetail.taskInfo.service === 'mobile_game_cloud')" style="margin-bottom: 16px;">
              <el-button type="primary" @click="handleReplaceGameRtt" :disabled="isReplacingRtt || !hasGameDelayData">
                {{ $t('experienceTest.clientData.replaceGameRtt') }}
              </el-button>
              <el-button type="warning" @click="handleRevertGameRtt" :disabled="isReplacingRtt || !hasOriginalRttData">
                {{ $t('experienceTest.clientData.revertGameRtt') }}
              </el-button>
            </div>
            <!-- 替换/回退网络侧RTT按钮（所有业务大类都显示） -->
            <div v-if="taskDetail.taskInfo" style="margin-bottom: 16px;">
              <el-button type="primary" @click="handleReplaceNetworkRtt" :disabled="isReplacingNetworkRtt || !hasNetworkRttData">
                {{ $t('experienceTest.clientData.replaceNetworkRtt') }}
              </el-button>
              <el-button type="warning" @click="handleRevertNetworkRtt" :disabled="isReplacingNetworkRtt || !hasOriginalNetworkRttData">
                {{ $t('experienceTest.clientData.revertNetworkRtt') }}
              </el-button>
            </div>
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
                    v-if="editingVmosRowId === scope.row.id"
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
                  {{ scope.row.bitrate || '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('experienceTest.clientData.sResoulution')" width="120">
                <template #default="scope">
                  {{ scope.row.calculatedResolution || '-' }}
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
import { uploadClientDataFile, getClientDataPage, getClientDataDetail, updateVmosData, updateTaskInfo, deleteTaskInfo, getVmosParamsConfigByService, getRttComparison } from '@/api/test-settings'

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
    
    // vMOS参数配置缓存（按业务大类）
    const vmosParamsCache = ref({})
    
    // 替换下行速率相关
    const isReplacingSpeed = ref(false)
    const originalSpeedDataBackup = ref({}) // 保存原始速率数据，格式：{ rowId: originalSpeed }
    const hasOriginalSpeedData = computed(() => {
      return Object.keys(originalSpeedDataBackup.value).length > 0
    })
    const hasSpeedData = computed(() => {
      return taskDetail.value.speedDataList && taskDetail.value.speedDataList.length > 0
    })
    
    // 替换游戏内RTT相关
    const isReplacingRtt = ref(false)
    const originalRttDataBackup = ref({}) // 保存原始RTT数据，格式：{ rowId: originalRtt }
    const hasOriginalRttData = computed(() => {
      return Object.keys(originalRttDataBackup.value).length > 0
    })
    const hasGameDelayData = computed(() => {
      return taskDetail.value.gameDelayDataList && taskDetail.value.gameDelayDataList.length > 0
    })
    
    // 替换网络侧RTT相关
    const isReplacingNetworkRtt = ref(false)
    const originalNetworkRttDataBackup = ref({}) // 保存原始RTT数据，格式：{ rowId: originalRtt }
    const networkRttComparisonData = ref(null) // 保存网络侧RTT对比数据
    const hasOriginalNetworkRttData = computed(() => {
      return Object.keys(originalNetworkRttDataBackup.value).length > 0
    })
    const hasNetworkRttData = computed(() => {
      return networkRttComparisonData.value && networkRttComparisonData.value.networkRttList && networkRttComparisonData.value.networkRttList.length > 0
    })
    
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
        
        // 重置替换下行速率相关状态
        originalSpeedDataBackup.value = {}
        isReplacingSpeed.value = false
        
        // 重置替换游戏内RTT相关状态
        originalRttDataBackup.value = {}
        isReplacingRtt.value = false
        
        // 重置替换网络侧RTT相关状态
        originalNetworkRttDataBackup.value = {}
        isReplacingNetworkRtt.value = false
        networkRttComparisonData.value = null
        
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
        resolution: row.resolution || '',
        rtt: row.rtt || '',
        packetLossRate: row.packetLossRate || '',
        stutterRatio: row.stutterRatio || '',
        bitrate: row.bitrate || '',
        videoExperience: row.videoExperience || '',
        interactionExperience: row.interactionExperience || '',
        initialBufferingDelay: row.initialBufferingDelay || '',
        calculatedResolution: row.calculatedResolution || '',
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
    const handleVmosFieldChange = async (row) => {
      if (!taskDetail.value.taskInfo) {
        return
      }
      
      const service = taskDetail.value.taskInfo.service
      
      // 获取配置参数
      const params = await getVmosParams(service)
      
      // 如果业务大类为shortvideo，则实时计算相关字段
      if (service === 'shortvideo') {
        const calculated = calculateShortvideoVmos(
          row.speed || '0',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'voip') {
        // 如果业务大类为voip，则实时计算相关字段
        const calculated = calculateVoipVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'watch_live') {
        // 如果业务大类为watch_live，则实时计算相关字段
        const calculated = calculateWatchLiveVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'live_streaming') {
        // 如果业务大类为live_streaming，则实时计算相关字段
        const calculated = calculateLiveStreamingVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'vod_streaming') {
        // 如果业务大类为vod_streaming，则实时计算相关字段
        const calculated = calculateVodStreamingVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'meeting') {
        // 如果业务大类为meeting，则实时计算相关字段
        const calculated = calculateMeetingVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'mobile_game') {
        // 如果业务大类为mobile_game，则实时计算相关字段
        const calculated = calculateMobileGameVmos(
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'mobile_game_cloud') {
        // 如果业务大类为mobile_game_cloud，则实时计算相关字段
        const calculated = calculateMobileGameCloudVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        
        // 实时更新计算后的字段到row对象中
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      }
    }

    // 计算shortvideo业务大类的vMOS数据
    const calculateShortvideoVmos = (speed, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.04
      const g2 = params?.g2 ?? 0.25

      // s_bitrate = 5/(1+exp(-速率/a1))
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // sQuality = s_bitrate
      const sQuality = sBitrate

      // s_RTT = 4/exp(0.0035 * Rtt) + 1
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4/exp(180.94 * 丢包率) + 1
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -4*卡顿率+5
      const sStallRate = -a5 * stutterRatioNum + 5

      // sView = max(min(4*(1-0.04*(5-s_lost_packet_rate)-0.25*(5-s_stall_rate)) + 1, 5), 1)
      const sViewValue = 4 * ( 1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
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
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: '-',
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 获取vMOS参数配置（带缓存）
    const getVmosParams = async (service) => {
      // 如果缓存中有，直接返回
      if (vmosParamsCache.value[service]) {
        return vmosParamsCache.value[service]
      }
      
      // 默认参数值（根据业务大类不同）
      let defaultParams = {}
      
      if (service === 'voip') {
        // voip特有的默认值
        defaultParams = {
          v1: 4.1192,
          v2: 0.0975,
          v3: 1.2667,
          v4: 0.3177,
          v5: 2.1276,
          fr: 30,
          v12: -0.6571,
          v13: 232000,
          v14: -1.295,
          v58: 5,
          v59: 1.382,
          v60: 3.615,
          v61: 396.6,
          v62: 0.256,
          v63: -2.016,
          a1: 5,
          g1: 0.15,
          g2: 0.15,
        }
      } else {
        // 其他业务大类的默认值
        defaultParams = {
          a1: 928.9840,
          a2: 410,
          w1: 0.25,
          w2: 0.05,
          a3: 0.0035,
          a4: 180.94,
          a5: 4,
          g1: 0.25,
          g2: 0.1,
        }
      }
      
      try {
        const response = await getVmosParamsConfigByService(service)
        if (response.code === 200 && response.data) {
          const config = response.data
          const params = {}
          
          if (service === 'voip') {
            // voip特有的参数
            params.v1 = config.v1 ?? defaultParams.v1
            params.v2 = config.v2 ?? defaultParams.v2
            params.v3 = config.v3 ?? defaultParams.v3
            params.v4 = config.v4 ?? defaultParams.v4
            params.v5 = config.v5 ?? defaultParams.v5
            params.fr = config.fr ?? defaultParams.fr
            params.v12 = config.v12 ?? defaultParams.v12
            params.v13 = config.v13 ?? defaultParams.v13
            params.v14 = config.v14 ?? defaultParams.v14
            params.v58 = config.v58 ?? defaultParams.v58
            params.v59 = config.v59 ?? defaultParams.v59
            params.v60 = config.v60 ?? defaultParams.v60
            params.v61 = config.v61 ?? defaultParams.v61
            params.v62 = config.v62 ?? defaultParams.v62
            params.v63 = config.v63 ?? defaultParams.v63
            params.a1 = config.a1 ?? defaultParams.a1
            params.g1 = config.g1 ?? defaultParams.g1
            params.g2 = config.g2 ?? defaultParams.g2
          } else {
            // 其他业务大类的参数
            params.a1 = config.a1 ?? defaultParams.a1
            params.a2 = config.a2 ?? defaultParams.a2
            params.w1 = config.w1 ?? defaultParams.w1
            params.w2 = config.w2 ?? defaultParams.w2
            params.a3 = config.a3 ?? defaultParams.a3
            params.a4 = config.a4 ?? defaultParams.a4
            params.a5 = config.a5 ?? defaultParams.a5
            params.g1 = config.g1 ?? defaultParams.g1
            params.g2 = config.g2 ?? defaultParams.g2
          }
          
          // 缓存配置
          vmosParamsCache.value[service] = params
          return params
        }
      } catch (error) {
        console.warn(`获取${service}的vMOS参数配置失败，使用默认值:`, error)
      }
      
      // 使用默认值并缓存
      vmosParamsCache.value[service] = defaultParams
      return defaultParams
    }

    // 分辨率映射函数：将分辨率值转换为对应的像素数
    const getResolutionPixels = (resolution) => {
      const resolutionMap = {
        '144': 36864,
        '270': 129600,
        '360': 230400,
        '480': 409920,
        '720': 921600,
        '1080': 2073600,
        '1556': 3186688,
        '2160': 8294400,
        '2880': 14745600,
        '4320': 33004800,
      }
      return resolutionMap[String(resolution)] || parseFloat(resolution) || 0
    }

    // 计算voip业务大类的vMOS数据
    const calculateVoipVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取voip特有的常量参数，如果没有则使用默认值
      const v1 = params?.v1 ?? 4.1192
      const v2 = params?.v2 ?? 0.0975
      const v3 = params?.v3 ?? 1.2667
      const v4 = params?.v4 ?? 0.3177
      const v5 = params?.v5 ?? 2.1276
      const fr = params?.fr ?? 30
      const v12 = params?.v12 ?? -0.6571
      const v13 = params?.v13 ?? 232000
      const v14 = params?.v14 ?? -1.295
      const v58 = params?.v58 ?? 5
      const v59 = params?.v59 ?? 1.382
      const v60 = params?.v60 ?? 3.615
      const v61 = params?.v61 ?? 396.6
      const v62 = params?.v62 ?? 0.256
      const v63 = params?.v63 ?? -2.016
      
      // 从配置中获取参数，如果没有则使用默认值（voip中a1用于stall_rate，g1和g2用于sView）
      const a1 = params?.a1 ?? 5
      const g1 = params?.g1 ?? 0.15
      const g2 = params?.g2 ?? 0.15

      // s_bitrate = 1 + v1 - v1/(1 + pow(bitrate / (v2 * pow(fr, v3) * pow(resolution, v4)), v5))
      // bitrate在这里应该是speed（速率）
      const bitrateDivisor = v2 * Math.pow(fr, v3) * Math.pow(resolutionPixels, v4)
      const sBitrate = 1 + v1 - v1 / (1 + Math.pow(speedNum / bitrateDivisor, v5))

      // s_resolution = 1 + v12 - v12 / (1 + pow(resolution / v13, v14))
      const sResolution = 1 + v12 - v12 / (1 + Math.pow(resolutionPixels / v13, v14))

      // sQuality = max(min((s_bitrate * s_resolution), 5), 1)
      const sQuality = Math.max(Math.min(sBitrate * sResolution, 5), 1)

      // s_RTT = max(min(1 + v60 - v60 / (1 + pow(RTT / v61 + v62, v63)), 5), 1)
      const sRtt = Math.max(Math.min(1 + v60 - v60 / (1 + Math.pow(rttNum / v61 + v62, v63)), 5), 1)

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = max(min(v58 * exp(-PLR / v59), 5), 1)
      // PLR = 100 * lost_packet_rate
      const plr = 100 * packetLossRateNum
      const sLostPacketRate = Math.max(Math.min(v58 * Math.exp(-plr / v59), 5), 1)

      // s_stall_rate = -a1 * stall_rate + 5
      const sStallRate = Math.max(Math.min(-a1 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * (1 - g1 * (5 - s_lost_packet_rate) - g2 * (5 - s_stall_rate)) + 1, 5), 1)
      const sView = Math.max(Math.min(4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction / 2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = max(min((sQuality - 1) * (1 - α(5 - sInteraction) - β(5 - sView)) + 1, 5), 1)
      const vmos = Math.max(Math.min((sQuality - 1) * (1 - alpha * (5 - sInteraction) - beta * (5 - sView)) + 1, 5), 1)

      return {
        bitrate: sBitrate.toFixed(4),
        videoExperience: sQuality.toFixed(4),
        interactionExperience: sInteraction.toFixed(4),
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算watch_live业务大类的vMOS数据
    const calculateWatchLiveVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a2 = params?.a2 ?? 410
      const w1 = params?.w1 ?? 0.25
      const w2 = params?.w2 ?? 0.05
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.25
      const g2 = params?.g2 ?? 0.1

      // s_bitrate = 5/ (1 + exp(-bitrate / a1)), a1 = 928.9840
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // s_resolution = 5/ (1 + exp(-resolution / a2)), a2 = 410
      const sResolution = 5 / (1 + Math.exp(-resolutionPixels / a2))

      // sQuality = max(min(4 * (1 - w1 * (5 - s_bitrate) - w2 * (5 - s_resolution)) + 1, 5), 1), w1 = 0.25, w2 = 0.05
      const sQualityValue = 4 * (1 - w1 * (5 - sBitrate) - w2 * (5 - sResolution)) + 1
      const sQuality = Math.max(Math.min(sQualityValue, 5), 1)

      // S_RTT = 4/exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 / exp(a4 * lost_packet_rate) + 1, a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate + 5, a5 = 4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * (1 - g1 * (5 - s_lost_packet_rate) - g2 * (5 - s_stall_rate)) +1, 5), 1), g1 = 0.25, g2 = 0.1
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction / 2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = (sQuality -1) * (( α * (sInteraction - 1) + β * (sView - 1))/ (4 * (α + β))) +1
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
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算live_streaming业务大类的vMOS数据
    const calculateLiveStreamingVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a2 = params?.a2 ?? 410
      const w1 = params?.w1 ?? 0.25
      const w2 = params?.w2 ?? 0.05
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.25
      const g2 = params?.g2 ?? 0.1

      // s_bitrate = 5 / (1 + exp(-bitrate / a1)), a1 = 928.9840
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // s_resolution = 5 / (1 + exp( -resolution / a2)), a2 = 410
      const sResolution = 5 / (1 + Math.exp(-resolutionPixels / a2))

      // sQuality = max(min( 4 * (1 - w1 * (5 - s_bitrate) - w2 * (5 - s_resolution)) +1, 5), 1), w1 = 0.25, w2 = 0.05
      const sQualityValue = 4 * (1 - w1 * (5 - sBitrate) - w2 * (5 - sResolution)) + 1
      const sQuality = Math.max(Math.min(sQualityValue, 5), 1)

      // s_RTT = 4 / exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 /exp( a4 * lost_packet_rate) + 1, a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate + 5, a5 =4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * 1 - g1 * (5 -s_lost_packet_rate) - g2 * (5 - s_stall_rate)) +1, 5), 1), g1=0.25, g2 =0.1
      // 注意：根据用户提供的公式，这里是 4 * 1 - g1 * ...，但根据上下文应该是 4 * (1 - g1 * ...)
      // 按照用户提供的公式实现：4 * 1 - g1 * (5 - s_lost_packet_rate) - g2 * (5 - s_stall_rate) + 1
      const sViewValue = 4 * 1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction /2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = (sQuality - 1) * ((α * (sInteraction - 1) + β * (sView - 1)) / (4 *  (α + β))) + 1
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
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算vod_streaming业务大类的vMOS数据
    const calculateVodStreamingVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a2 = params?.a2 ?? 410
      const w1 = params?.w1 ?? 0.04
      const w2 = params?.w2 ?? 0.25
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.04
      const g2 = params?.g2 ?? 0.25

      // s_bitrate = 5/(1 + exp(-bitrate / a1)), a1 = 928.9840
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // s_resolution = 5/(1 + exp(-resolution / a2)), a2 = 410
      const sResolution = 5 / (1 + Math.exp(-resolutionPixels / a2))

      // sQuality = max(min(4 * (1 - w1 * (5 - s_bitrate) - w2 * (5 - s_resolution)) + 1, 5), 1), w1 = 0.04, w2 = 0.25
      const sQualityValue = 4 * (1 - w1 * (5 - sBitrate) - w2 * (5 - sResolution)) + 1
      const sQuality = Math.max(Math.min(sQualityValue, 5), 1)

      // s_RTT = 4/exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 / exp(a4 * lost_packet_rate) + 1, a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate + 5, a5 = 4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * (1 - g1 * (5 - s_lost_packet_rate) - g2 * (5 - s_stall_rate)) + 1, 5), 1), g1 = 0.04, g2 = 0.25
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction / 2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = (sQuality - 1) * ((α * (sInteraction - 1) + β * (sView - 1)) / (4 * (α + β))) + 1
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
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算meeting业务大类的vMOS数据
    const calculateMeetingVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a2 = params?.a2 ?? 410
      const w1 = params?.w1 ?? 0.25
      const w2 = params?.w2 ?? 0.05
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.05
      const g2 = params?.g2 ?? 0.25

      // s_bitrate = 5/ (1 + exp(-bitrate / a1)), a1 = 928.9840
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // s_resolution = 5/(1 + exp(-resolution / a2)), a2 = 410
      const sResolution = 5 / (1 + Math.exp(-resolutionPixels / a2))

      // sQuality = max(min(4 * (1- w1 * (5-s_bitrate) - w2 * (5 - s_resolution)) + 1, 5), 1), w1 =0.25, w2 = 0.05
      const sQualityValue = 4 * (1 - w1 * (5 - sBitrate) - w2 * (5 - sResolution)) + 1
      const sQuality = Math.max(Math.min(sQualityValue, 5), 1)

      // s_RTT = 4/ exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 /exp(a4 * lost_packet_rate) + 1,a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate+5, a5 = 4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4*(1- g1 * (5-s_lost_packet_rate) - g2* (5 - s_stall_rate)) + 1, 5), 1), g1 = 0.05, g2 = 0.25
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2* exp(-sInteraction /2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView /2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = (sQuality - 1) * ((α * (sInteraction - 1) + β * (sView - 1)) / (4 * (α + β))) +1
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
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算mobile_game业务大类的vMOS数据
    const calculateMobileGameVmos = (rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.25
      const g2 = params?.g2 ?? 0.04

      // sQuality = 4.5（固定值）
      const sQuality = 4.5

      // s_RTT = 4 / exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 / exp(a4 * lost_packet_rate) + 1, a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate + 5, a5 = 4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * (1 - g1 * (5 - s_lost_packet_rate) - g2 * (5 - s_stall_rate)) + 1, 5), 1), g1 = 0.25, g2 = 0.04
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction / 2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = min(max((sQuality - 1) * (1 - α(5 - sInteraction) - β*(5 - sView)) + 1, 1), 5)
      const vmosValue = (sQuality - 1) * (1 - alpha * (5 - sInteraction) - beta * (5 - sView)) + 1
      const vmos = Math.min(Math.max(vmosValue, 1), 5)

      // mobile_game 不需要 bitrate 和 resolution，但为了保持数据结构一致性，返回空值或固定值
      return {
        bitrate: '-',
        videoExperience: sQuality.toFixed(4),
        interactionExperience: sInteraction.toFixed(4),
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: '-',
        presentationExperience: sView.toFixed(4),
        sLostPacketRate: sLostPacketRate.toFixed(4),
        sStallRate: sStallRate.toFixed(4),
        alpha: alpha.toFixed(4),
        beta: beta.toFixed(4),
        vmos: vmos.toFixed(4),
      }
    }

    // 计算mobile_game_cloud业务大类的vMOS数据
    const calculateMobileGameCloudVmos = (speed, resolution, rtt, packetLossRate, stutterRatio, params) => {
      // 转换为数字，如果为空或无效则使用0
      const speedNum = parseFloat(speed) || 0
      const resolutionPixels = getResolutionPixels(resolution)
      const rttNum = parseFloat(rtt) || 0
      const packetLossRateNum = parseFloat(packetLossRate) || 0
      const stutterRatioNum = parseFloat(stutterRatio) || 0

      // 从配置中获取参数，如果没有则使用默认值
      const a1 = params?.a1 ?? 928.9840
      const a2 = params?.a2 ?? 410
      const w1 = params?.w1 ?? 0.25
      const w2 = params?.w2 ?? 0.05
      const a3 = params?.a3 ?? 0.0035
      const a4 = params?.a4 ?? 180.94
      const a5 = params?.a5 ?? 4
      const g1 = params?.g1 ?? 0.05
      const g2 = params?.g2 ?? 0.25

      // s_bitrate = 5 / (1 + exp(-bitrate / a1)), a1 = 928.9840
      const sBitrate = 5 / (1 + Math.exp(-speedNum / a1))

      // s_resolution = 5 / (1 + exp(-resolution / a2)), a2 = 410
      const sResolution = 5 / (1 + Math.exp(-resolutionPixels / a2))

      // sQuality = max(min(4 * (1 - w1 * (5-s_bitrate) - w2 * (5 - s_resolution)) + 1, 5), 1), w1 = 0.25, w2 = 0.05
      const sQualityValue = 4 * (1 - w1 * (5 - sBitrate) - w2 * (5 - sResolution)) + 1
      const sQuality = Math.max(Math.min(sQualityValue, 5), 1)

      // s_RTT = 4 / exp(a3 * RTT) + 1, a3 = 0.0035
      const sRtt = 4 / Math.exp(a3 * rttNum) + 1

      // sInteraction = s_RTT
      const sInteraction = sRtt

      // s_lost_packet_rate = 4 / exp(a4 * lost_packet_rate) + 1, a4 = 180.94
      const sLostPacketRate = 4 / Math.exp(a4 * packetLossRateNum) + 1

      // s_stall_rate = -a5 * stall_rate + 5, a5 = 4
      const sStallRate = Math.max(Math.min(-a5 * stutterRatioNum + 5, 5), 1)

      // sView = max(min(4 * (1 - g1 * (5-s_lost_packet_rate) - g2 * (5 - s_stall_rate)) + 1, 5), 1), g1 = 0.05, g2 = 0.25
      const sViewValue = 4 * (1 - g1 * (5 - sLostPacketRate) - g2 * (5 - sStallRate)) + 1
      const sView = Math.max(Math.min(sViewValue, 5), 1)

      // α = 0.1 * (1 + 2 * exp(-sInteraction / 2))
      const alpha = 0.1 * (1 + 2 * Math.exp(-sInteraction / 2))

      // β = 0.1 * (1 + 2 * exp(-sView / 2))
      const beta = 0.1 * (1 + 2 * Math.exp(-sView / 2))

      // vMOS = min(max((sQuality - 1) * (1 - α(5 - sInteraction) - β(5 - sView)) + 1, 1), 5)
      const vmosValue = (sQuality - 1) * (1 - alpha * (5 - sInteraction) - beta * (5 - sView)) + 1
      const vmos = Math.min(Math.max(vmosValue, 1), 5)

      return {
        bitrate: sBitrate.toFixed(4),
        videoExperience: sQuality.toFixed(4),
        interactionExperience: sInteraction.toFixed(4),
        initialBufferingDelay: sRtt.toFixed(4),
        calculatedResolution: sResolution.toFixed(4),
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
          resolution: row.resolution || '',
          rtt: row.rtt || '',
          packetLossRate: row.packetLossRate || '',
          stutterRatio: row.stutterRatio || '',
        }

        // 根据业务大类计算vMOS相关字段
        if (taskDetail.value.taskInfo) {
          const service = taskDetail.value.taskInfo.service
          
          // 获取配置参数
          const params = await getVmosParams(service)
          
          if (service === 'shortvideo') {
            const calculated = calculateShortvideoVmos(
              row.speed || '0',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'voip') {
            const calculated = calculateVoipVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'watch_live') {
            const calculated = calculateWatchLiveVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'live_streaming') {
            const calculated = calculateLiveStreamingVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'vod_streaming') {
            const calculated = calculateVodStreamingVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'meeting') {
            const calculated = calculateMeetingVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'mobile_game') {
            const calculated = calculateMobileGameVmos(
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          } else if (service === 'mobile_game_cloud') {
            const calculated = calculateMobileGameCloudVmos(
              row.speed || '0',
              row.resolution || '',
              row.rtt || '0',
              row.packetLossRate || '0',
              row.stutterRatio || '0',
              params,
            )
            
            // 将计算后的字段添加到保存数据中
            dataToSave.bitrate = calculated.bitrate
            dataToSave.videoExperience = calculated.videoExperience
            dataToSave.interactionExperience = calculated.interactionExperience
            dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
            dataToSave.calculatedResolution = calculated.calculatedResolution
            dataToSave.presentationExperience = calculated.presentationExperience
            dataToSave.sLostPacketRate = calculated.sLostPacketRate
            dataToSave.sStallRate = calculated.sStallRate
            dataToSave.alpha = calculated.alpha
            dataToSave.beta = calculated.beta
            dataToSave.vmos = calculated.vmos
          }
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
        row.resolution = vmosEditBackup.value.resolution
        row.rtt = vmosEditBackup.value.rtt
        row.packetLossRate = vmosEditBackup.value.packetLossRate
        row.stutterRatio = vmosEditBackup.value.stutterRatio
        row.bitrate = vmosEditBackup.value.bitrate
        row.videoExperience = vmosEditBackup.value.videoExperience
        row.interactionExperience = vmosEditBackup.value.interactionExperience
        row.initialBufferingDelay = vmosEditBackup.value.initialBufferingDelay
        row.calculatedResolution = vmosEditBackup.value.calculatedResolution
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

    // 批量重新计算vMOS数据（不保存到数据库，只更新界面）
    const recalculateVmosDataForRow = async (row, service, params) => {
      if (service === 'voip') {
        const calculated = calculateVoipVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'meeting') {
        const calculated = calculateMeetingVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'mobile_game') {
        const calculated = calculateMobileGameVmos(
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      } else if (service === 'mobile_game_cloud') {
        const calculated = calculateMobileGameCloudVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        row.bitrate = calculated.bitrate
        row.videoExperience = calculated.videoExperience
        row.interactionExperience = calculated.interactionExperience
        row.initialBufferingDelay = calculated.initialBufferingDelay
        row.calculatedResolution = calculated.calculatedResolution
        row.presentationExperience = calculated.presentationExperience
        row.sLostPacketRate = calculated.sLostPacketRate
        row.sStallRate = calculated.sStallRate
        row.alpha = calculated.alpha
        row.beta = calculated.beta
        row.vmos = calculated.vmos
      }
    }

    // 准备保存数据（与handleSaveVmosRow中的逻辑相同）
    const prepareVmosDataToSave = (row, service, params) => {
      const dataToSave = {
        speed: row.speed || '',
        resolution: row.resolution || '',
        rtt: row.rtt || '',
        packetLossRate: row.packetLossRate || '',
        stutterRatio: row.stutterRatio || '',
      }

      if (service === 'voip') {
        const calculated = calculateVoipVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        dataToSave.bitrate = calculated.bitrate
        dataToSave.videoExperience = calculated.videoExperience
        dataToSave.interactionExperience = calculated.interactionExperience
        dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
        dataToSave.calculatedResolution = calculated.calculatedResolution
        dataToSave.presentationExperience = calculated.presentationExperience
        dataToSave.sLostPacketRate = calculated.sLostPacketRate
        dataToSave.sStallRate = calculated.sStallRate
        dataToSave.alpha = calculated.alpha
        dataToSave.beta = calculated.beta
        dataToSave.vmos = calculated.vmos
      } else if (service === 'meeting') {
        const calculated = calculateMeetingVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        dataToSave.bitrate = calculated.bitrate
        dataToSave.videoExperience = calculated.videoExperience
        dataToSave.interactionExperience = calculated.interactionExperience
        dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
        dataToSave.calculatedResolution = calculated.calculatedResolution
        dataToSave.presentationExperience = calculated.presentationExperience
        dataToSave.sLostPacketRate = calculated.sLostPacketRate
        dataToSave.sStallRate = calculated.sStallRate
        dataToSave.alpha = calculated.alpha
        dataToSave.beta = calculated.beta
        dataToSave.vmos = calculated.vmos
      } else if (service === 'mobile_game') {
        const calculated = calculateMobileGameVmos(
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        dataToSave.bitrate = calculated.bitrate
        dataToSave.videoExperience = calculated.videoExperience
        dataToSave.interactionExperience = calculated.interactionExperience
        dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
        dataToSave.calculatedResolution = calculated.calculatedResolution
        dataToSave.presentationExperience = calculated.presentationExperience
        dataToSave.sLostPacketRate = calculated.sLostPacketRate
        dataToSave.sStallRate = calculated.sStallRate
        dataToSave.alpha = calculated.alpha
        dataToSave.beta = calculated.beta
        dataToSave.vmos = calculated.vmos
      } else if (service === 'mobile_game_cloud') {
        const calculated = calculateMobileGameCloudVmos(
          row.speed || '0',
          row.resolution || '',
          row.rtt || '0',
          row.packetLossRate || '0',
          row.stutterRatio || '0',
          params,
        )
        dataToSave.bitrate = calculated.bitrate
        dataToSave.videoExperience = calculated.videoExperience
        dataToSave.interactionExperience = calculated.interactionExperience
        dataToSave.initialBufferingDelay = calculated.initialBufferingDelay
        dataToSave.calculatedResolution = calculated.calculatedResolution
        dataToSave.presentationExperience = calculated.presentationExperience
        dataToSave.sLostPacketRate = calculated.sLostPacketRate
        dataToSave.sStallRate = calculated.sStallRate
        dataToSave.alpha = calculated.alpha
        dataToSave.beta = calculated.beta
        dataToSave.vmos = calculated.vmos
      }

      return dataToSave
    }

    // 替换下行速率
    const handleReplaceDownlinkSpeed = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList || !taskDetail.value.speedDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service
      if (service !== 'voip' && service !== 'meeting') {
        ElMessage.warning('当前业务大类不支持此功能')
        return
      }

      if (taskDetail.value.vmosDataList.length !== taskDetail.value.speedDataList.length) {
        ElMessage.warning('vMOS数据与上下行速率统计数据数量不匹配')
        return
      }

      isReplacingSpeed.value = true
      try {
        // 获取配置参数
        const params = await getVmosParams(service)

        // 先保存所有原始速率数据
        originalSpeedDataBackup.value = {}
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          originalSpeedDataBackup.value[vmosRow.id] = vmosRow.speed || ''
        }

        // 遍历vMOS数据列表，替换速率并重新计算
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const speedRow = taskDetail.value.speedDataList[i]

          // 获取下行速率（单位：bps），除以1024转换为Kbps
          const dlSpeedBps = parseFloat(speedRow.dlSpeed) || 0
          const dlSpeedKbps = dlSpeedBps / 1024

          // 替换速率
          vmosRow.speed = dlSpeedKbps.toFixed(2)

          // 重新计算vMOS数据
          await recalculateVmosDataForRow(vmosRow, service, params)
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          ElMessage.success(`替换下行速率成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`替换下行速率完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Replace downlink speed error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingSpeed.value = false
      }
    }

    // 回退下行速率
    const handleRevertDownlinkSpeed = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service
      if (service !== 'voip' && service !== 'meeting') {
        ElMessage.warning('当前业务大类不支持此功能')
        return
      }

      if (Object.keys(originalSpeedDataBackup.value).length === 0) {
        ElMessage.warning('没有可回退的原始数据')
        return
      }

      isReplacingSpeed.value = true
      try {
        // 获取配置参数
        const params = await getVmosParams(service)

        // 遍历vMOS数据列表，恢复原始速率并重新计算
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const originalSpeed = originalSpeedDataBackup.value[vmosRow.id]

          // 如果存在原始速率，则恢复
          if (originalSpeed !== undefined && originalSpeed !== null) {
            vmosRow.speed = originalSpeed

            // 重新计算vMOS数据
            await recalculateVmosDataForRow(vmosRow, service, params)
          }
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          // 只有在全部保存成功后才清空原始数据备份
          originalSpeedDataBackup.value = {}
          ElMessage.success(`回退下行速率成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`回退下行速率完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Revert downlink speed error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingSpeed.value = false
      }
    }

    // 替换游戏内RTT
    const handleReplaceGameRtt = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList || !taskDetail.value.gameDelayDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service
      if (service !== 'mobile_game' && service !== 'mobile_game_cloud') {
        ElMessage.warning('当前业务大类不支持此功能')
        return
      }

      if (taskDetail.value.vmosDataList.length !== taskDetail.value.gameDelayDataList.length) {
        ElMessage.warning('vMOS数据与游戏延时统计数据数量不匹配')
        return
      }

      isReplacingRtt.value = true
      try {
        // 获取配置参数
        const params = await getVmosParams(service)

        // 先保存所有原始RTT数据
        originalRttDataBackup.value = {}
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          originalRttDataBackup.value[vmosRow.id] = vmosRow.rtt || ''
        }

        // 遍历vMOS数据列表，替换RTT并重新计算
        // 通过序号匹配：vmosDataList的sequenceNumber和gameDelayDataList的indexValue
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const gameDelayRow = taskDetail.value.gameDelayDataList[i]

          // 获取游戏延时（单位：ms），直接替换RTT
          const gameDelay = parseFloat(gameDelayRow.delay) || 0

          // 替换RTT
          vmosRow.rtt = gameDelay.toString()

          // 重新计算vMOS数据
          await recalculateVmosDataForRow(vmosRow, service, params)
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          ElMessage.success(`替换游戏内RTT成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`替换游戏内RTT完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Replace game RTT error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingRtt.value = false
      }
    }

    // 回退游戏内RTT
    const handleRevertGameRtt = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service
      if (service !== 'mobile_game' && service !== 'mobile_game_cloud') {
        ElMessage.warning('当前业务大类不支持此功能')
        return
      }

      if (Object.keys(originalRttDataBackup.value).length === 0) {
        ElMessage.warning('没有可回退的原始数据')
        return
      }

      isReplacingRtt.value = true
      try {
        // 获取配置参数
        const params = await getVmosParams(service)

        // 遍历vMOS数据列表，恢复原始RTT并重新计算
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const originalRtt = originalRttDataBackup.value[vmosRow.id]

          // 如果存在原始RTT，则恢复
          if (originalRtt !== undefined && originalRtt !== null) {
            vmosRow.rtt = originalRtt

            // 重新计算vMOS数据
            await recalculateVmosDataForRow(vmosRow, service, params)
          }
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          // 只有在全部保存成功后才清空原始数据备份
          originalRttDataBackup.value = {}
          ElMessage.success(`回退游戏内RTT成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`回退游戏内RTT完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Revert game RTT error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingRtt.value = false
      }
    }

    // 替换网络侧RTT
    const handleReplaceNetworkRtt = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service
      const taskId = taskDetail.value.taskInfo.taskId

      if (!taskId) {
        ElMessage.warning('任务ID不存在')
        return
      }

      isReplacingNetworkRtt.value = true
      try {
        // 获取网络侧RTT对比数据
        const response = await getRttComparison(taskId)
        if (response.code !== 200 || !response.data || !response.data.networkRttList || response.data.networkRttList.length === 0) {
          ElMessage.warning('无法获取网络侧RTT数据，请确保已配置网络侧数据')
          return
        }

        networkRttComparisonData.value = response.data
        const networkRttList = response.data.networkRttList

        if (taskDetail.value.vmosDataList.length !== networkRttList.length) {
          ElMessage.warning(`vMOS数据(${taskDetail.value.vmosDataList.length}条)与网络侧RTT数据(${networkRttList.length}条)数量不匹配`)
        }

        // 获取配置参数
        const params = await getVmosParams(service)

        // 先保存所有原始RTT数据
        originalNetworkRttDataBackup.value = {}
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          originalNetworkRttDataBackup.value[vmosRow.id] = vmosRow.rtt || ''
        }

        // 遍历vMOS数据列表，替换RTT并重新计算
        // 按照索引位置匹配（因为数据应该是按顺序对齐的）
        const minLength = Math.min(taskDetail.value.vmosDataList.length, networkRttList.length)
        for (let i = 0; i < minLength; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const networkRttRow = networkRttList[i]

          // 获取网络侧服务时延（单位：ms），直接替换RTT
          const networkServiceDelay = networkRttRow.serviceDelay ? parseFloat(networkRttRow.serviceDelay.toString()) : 0

          // 替换RTT
          vmosRow.rtt = networkServiceDelay.toString()

          // 重新计算vMOS数据
          await recalculateVmosDataForRow(vmosRow, service, params)
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          ElMessage.success(`替换网络侧RTT成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`替换网络侧RTT完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Replace network RTT error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingNetworkRtt.value = false
      }
    }

    // 回退网络侧RTT
    const handleRevertNetworkRtt = async () => {
      if (!taskDetail.value.taskInfo || !taskDetail.value.vmosDataList) {
        ElMessage.warning('数据不完整')
        return
      }

      const service = taskDetail.value.taskInfo.service

      if (Object.keys(originalNetworkRttDataBackup.value).length === 0) {
        ElMessage.warning('没有可回退的原始数据')
        return
      }

      isReplacingNetworkRtt.value = true
      try {
        // 获取配置参数
        const params = await getVmosParams(service)

        // 遍历vMOS数据列表，恢复原始RTT并重新计算
        for (let i = 0; i < taskDetail.value.vmosDataList.length; i++) {
          const vmosRow = taskDetail.value.vmosDataList[i]
          const originalRtt = originalNetworkRttDataBackup.value[vmosRow.id]

          // 如果存在原始RTT，则恢复
          if (originalRtt !== undefined && originalRtt !== null) {
            vmosRow.rtt = originalRtt

            // 重新计算vMOS数据
            await recalculateVmosDataForRow(vmosRow, service, params)
          }
        }

        // 批量保存到数据库
        let successCount = 0
        let failCount = 0
        const savePromises = taskDetail.value.vmosDataList.map(async (vmosRow) => {
          try {
            const dataToSave = prepareVmosDataToSave(vmosRow, service, params)
            const response = await updateVmosData(vmosRow.id, dataToSave)
            if (response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, response.message)
            }
          } catch (error) {
            failCount++
            console.error(`保存vMOS数据失败 (ID: ${vmosRow.id}):`, error)
          }
        })

        await Promise.all(savePromises)

        if (failCount === 0) {
          // 只有在全部保存成功后才清空原始数据备份
          originalNetworkRttDataBackup.value = {}
          ElMessage.success(`回退网络侧RTT成功，已保存 ${successCount} 条数据`)
          // 刷新当前任务详情
          if (taskDetail.value.taskInfo && taskDetail.value.taskInfo.taskId) {
            await handleViewDetail({ taskId: taskDetail.value.taskInfo.taskId })
          }
        } else {
          ElMessage.warning(`回退网络侧RTT完成，成功保存 ${successCount} 条，失败 ${failCount} 条`)
        }
      } catch (error) {
        console.error('Revert network RTT error:', error)
        ElMessage.error(error.message || t('common.error'))
      } finally {
        isReplacingNetworkRtt.value = false
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
      handleReplaceDownlinkSpeed,
      handleRevertDownlinkSpeed,
      isReplacingSpeed,
      hasOriginalSpeedData,
      hasSpeedData,
      handleReplaceGameRtt,
      handleRevertGameRtt,
      isReplacingRtt,
      hasOriginalRttData,
      hasGameDelayData,
      handleReplaceNetworkRtt,
      handleRevertNetworkRtt,
      isReplacingNetworkRtt,
      hasOriginalNetworkRttData,
      hasNetworkRttData,
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




















