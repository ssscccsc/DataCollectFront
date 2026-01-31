<template>
  <div class="test-settings-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.testSettings') }}</h2>
      <p class="page-description">{{ $t('experienceTest.testSettings.description') }}</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 端侧和网络侧时间配置 -->
        <el-tab-pane :label="$t('experienceTest.testSettings.timeConfig')" name="timeConfig">
          <div class="tab-content">
            <el-form
              ref="timeConfigFormRef"
              :model="timeConfigForm"
              :rules="timeConfigRules"
              label-width="200px"
              style="max-width: 600px;"
            >
              <el-form-item :label="$t('experienceTest.testSettings.timeDiff')" prop="timeDiff">
                <el-input-number
                  v-model="timeConfigForm.timeDiff"
                  :min="0"
                  :max="10"
                  :precision="0"
                  style="width: 200px;"
                />
                <span style="margin-left: 10px; color: #909399;">
                  {{ $t('experienceTest.testSettings.timeDiffTip') }}
                </span>
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.collectInterval')" prop="collectInterval">
                <el-select
                  v-model="timeConfigForm.collectInterval"
                  :placeholder="$t('experienceTest.testSettings.collectIntervalPlaceholder')"
                  style="width: 200px;"
                >
                  <el-option
                    :label="$t('experienceTest.testSettings.collectInterval10')"
                    :value="10"
                  />
                  <el-option
                    :label="$t('experienceTest.testSettings.collectInterval30')"
                    :value="30"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveTimeConfig">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="handleResetTimeConfig">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 端侧FTP服务器信息 -->
        <el-tab-pane :label="$t('experienceTest.testSettings.clientFtpServer')" name="clientFtp">
          <div class="tab-content">
            <el-form
              ref="clientFtpFormRef"
              :model="clientFtpForm"
              :rules="clientFtpRules"
              label-width="150px"
              style="max-width: 600px;"
            >
              <el-form-item :label="$t('experienceTest.testSettings.serverAddress')" prop="serverAddress">
                <el-input
                  v-model="clientFtpForm.serverAddress"
                  :placeholder="$t('experienceTest.testSettings.serverAddressPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.account')" prop="account">
                <el-input
                  v-model="clientFtpForm.account"
                  :placeholder="$t('experienceTest.testSettings.accountPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.password')" prop="password">
                <el-input
                  v-model="clientFtpForm.password"
                  type="password"
                  show-password
                  :placeholder="$t('experienceTest.testSettings.passwordPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.checkMd5')" prop="checkMd5">
                <el-switch v-model="clientFtpForm.checkMd5" />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.directory')" prop="directory">
                <el-input
                  v-model="clientFtpForm.directory"
                  :placeholder="$t('experienceTest.testSettings.directoryPlaceholder')"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveClientFtp">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="handleResetClientFtp">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 网络侧FTP服务器信息 -->
        <el-tab-pane :label="$t('experienceTest.testSettings.networkFtpServer')" name="networkFtp">
          <div class="tab-content">
            <el-form
              ref="networkFtpFormRef"
              :model="networkFtpForm"
              :rules="networkFtpRules"
              label-width="150px"
              style="max-width: 600px;"
            >
              <el-form-item :label="$t('experienceTest.testSettings.serverAddress')" prop="serverAddress">
                <el-input
                  v-model="networkFtpForm.serverAddress"
                  :placeholder="$t('experienceTest.testSettings.serverAddressPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.account')" prop="account">
                <el-input
                  v-model="networkFtpForm.account"
                  :placeholder="$t('experienceTest.testSettings.accountPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.password')" prop="password">
                <el-input
                  v-model="networkFtpForm.password"
                  type="password"
                  show-password
                  :placeholder="$t('experienceTest.testSettings.passwordPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.checkMd5')" prop="checkMd5">
                <el-switch v-model="networkFtpForm.checkMd5" />
              </el-form-item>
              <el-form-item :label="$t('experienceTest.testSettings.directory')" prop="directory">
                <el-input
                  v-model="networkFtpForm.directory"
                  :placeholder="$t('experienceTest.testSettings.directoryPlaceholder')"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveNetworkFtp">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="handleResetNetworkFtp">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- deviceid和GPSI对应关系 -->
        <el-tab-pane :label="$t('experienceTest.testSettings.deviceIdGpsiMapping')" name="deviceIdGpsi">
          <div class="tab-content">
            <div class="table-operations">
              <el-button type="primary" @click="handleAddMapping">
                <el-icon><Plus /></el-icon>
                {{ $t('common.add') }}
              </el-button>
              <el-button @click="loadMappingData">
                <el-icon><Refresh /></el-icon>
                {{ $t('common.refresh') }}
              </el-button>
            </div>

            <el-table :data="mappingData" v-loading="mappingLoading" style="width: 100%">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column
                prop="deviceId"
                :label="$t('experienceTest.testSettings.deviceId')"
                width="200"
              />
              <el-table-column
                prop="gpsi"
                :label="$t('experienceTest.testSettings.gpsi')"
                width="200"
              />
              <el-table-column
                prop="createTime"
                :label="$t('common.createTime')"
                width="180"
              />
              <el-table-column :label="$t('common.operations')" width="200" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEditMapping(scope.row)">
                    {{ $t('common.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDeleteMapping(scope.row)">
                    {{ $t('common.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- vMOS计算参数配置 -->
        <el-tab-pane label="vMOS计算参数配置" name="vmosParams">
          <div class="tab-content">
            <div class="table-operations">
              <el-button @click="loadVmosParamsData">
                <el-icon><Refresh /></el-icon>
                {{ $t('common.refresh') }}
              </el-button>
            </div>

            <el-table :data="vmosParamsData" v-loading="vmosParamsLoading" style="width: 100%" border>
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="service" label="应用大类" width="150" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEditVmosParams(scope.row)">
                    {{ $t('common.edit') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加/编辑deviceid和GPSI对应关系对话框 -->
    <el-dialog
      v-model="mappingDialogVisible"
      :title="mappingDialogTitle"
      width="500px"
      @close="handleMappingDialogClose"
    >
      <el-form
        ref="mappingFormRef"
        :model="mappingForm"
        :rules="mappingRules"
        label-width="120px"
      >
        <el-form-item :label="$t('experienceTest.testSettings.deviceId')" prop="deviceId">
          <el-input
            v-model="mappingForm.deviceId"
            :placeholder="$t('experienceTest.testSettings.deviceIdPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('experienceTest.testSettings.gpsi')" prop="gpsi">
          <el-input
            v-model="mappingForm.gpsi"
            :placeholder="$t('experienceTest.testSettings.gpsiPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mappingDialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleSaveMapping">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑vMOS参数配置对话框 -->
    <el-dialog
      v-model="vmosParamsDialogVisible"
      title="编辑vMOS计算参数"
      width="800px"
      @close="handleVmosParamsDialogClose"
    >
      <el-form
        ref="vmosParamsFormRef"
        :model="vmosParamsForm"
        label-width="180px"
      >
        <el-form-item label="应用大类">
          <el-input v-model="vmosParamsForm.service" disabled />
        </el-form-item>
        
        <!-- voip业务大类的特殊配置 -->
        <template v-if="vmosParamsForm.service === 'voip'">
          <el-divider>voip特有参数 - s_bitrate计算</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v1">
                <el-input-number
                  v-model="vmosParamsForm.v1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v2">
                <el-input-number
                  v-model="vmosParamsForm.v2"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v3">
                <el-input-number
                  v-model="vmosParamsForm.v3"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v4">
                <el-input-number
                  v-model="vmosParamsForm.v4"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v5">
                <el-input-number
                  v-model="vmosParamsForm.v5"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="fr (帧率)">
                <el-input-number
                  v-model="vmosParamsForm.fr"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>voip特有参数 - s_resolution计算</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v12">
                <el-input-number
                  v-model="vmosParamsForm.v12"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v13">
                <el-input-number
                  v-model="vmosParamsForm.v13"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v14">
                <el-input-number
                  v-model="vmosParamsForm.v14"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>voip特有参数 - s_RTT计算</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v60">
                <el-input-number
                  v-model="vmosParamsForm.v60"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v61">
                <el-input-number
                  v-model="vmosParamsForm.v61"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v62">
                <el-input-number
                  v-model="vmosParamsForm.v62"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v63">
                <el-input-number
                  v-model="vmosParamsForm.v63"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>voip特有参数 - s_lost_packet_rate计算</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="v58">
                <el-input-number
                  v-model="vmosParamsForm.v58"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="v59">
                <el-input-number
                  v-model="vmosParamsForm.v59"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>voip通用参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="a1 (stall_rate参数)">
                <el-input-number
                  v-model="vmosParamsForm.a1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>sView参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="g1 (sView权重1)">
                <el-input-number
                  v-model="vmosParamsForm.g1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="g2 (sView权重2)">
                <el-input-number
                  v-model="vmosParamsForm.g2"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        
        <!-- 其他业务大类的通用配置 -->
        <template v-else>
          <el-divider>基础参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="a1 (bitrate参数)">
                <el-input-number
                  v-model="vmosParamsForm.a1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="a2 (resolution参数)">
                <el-input-number
                  v-model="vmosParamsForm.a2"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="w1 (sQuality权重1)">
                <el-input-number
                  v-model="vmosParamsForm.w1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="w2 (sQuality权重2)">
                <el-input-number
                  v-model="vmosParamsForm.w2"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>RTT参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="a3 (RTT参数)">
                <el-input-number
                  v-model="vmosParamsForm.a3"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>丢包率参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="a4 (lost_packet_rate参数)">
                <el-input-number
                  v-model="vmosParamsForm.a4"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>卡顿率参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="a5 (stall_rate参数)">
                <el-input-number
                  v-model="vmosParamsForm.a5"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>sView参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="g1 (sView权重1)">
                <el-input-number
                  v-model="vmosParamsForm.g1"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="g2 (sView权重2)">
                <el-input-number
                  v-model="vmosParamsForm.g2"
                  :precision="4"
                  :step="0.0001"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="vmosParamsDialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleSaveVmosParams" :loading="vmosParamsSaving">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Plus, Refresh } from '@element-plus/icons-vue'
import * as testSettingsApi from '@/api/test-settings'

export default {
  name: 'TestSettings',
  components: {
    Plus,
    Refresh,
  },
  setup() {
    const { t } = useI18n()
    const activeTab = ref('timeConfig')
    const clientFtpFormRef = ref(null)
    const networkFtpFormRef = ref(null)
    const mappingFormRef = ref(null)
    const timeConfigFormRef = ref(null)
    const vmosParamsFormRef = ref(null)
    const mappingLoading = ref(false)
    const mappingDialogVisible = ref(false)
    const mappingDialogTitle = ref('')
    const isEditMapping = ref(false)
    const currentMappingId = ref(null)
    const vmosParamsLoading = ref(false)
    const vmosParamsDialogVisible = ref(false)
    const vmosParamsSaving = ref(false)
    const vmosParamsData = ref([])

    // 时间配置表单
    const timeConfigForm = reactive({
      timeDiff: 0,
      collectInterval: 10,
    })

    // 端侧FTP服务器表单
    const clientFtpForm = reactive({
      serverAddress: '',
      account: '',
      password: '',
      checkMd5: false,
      directory: '',
    })

    // 网络侧FTP服务器表单
    const networkFtpForm = reactive({
      serverAddress: '',
      account: '',
      password: '',
      checkMd5: false,
      directory: '',
    })

    // deviceid和GPSI对应关系数据
    const mappingData = ref([])

    // deviceid和GPSI对应关系表单
    const mappingForm = reactive({
      deviceId: '',
      gpsi: '',
    })

    // vMOS参数配置表单
    const vmosParamsForm = reactive({
      service: '',
      a1: 928.9840,
      a2: 410,
      w1: 0.25,
      w2: 0.05,
      a3: 0.0035,
      a4: 180.94,
      a5: 4,
      g1: 0.25,
      g2: 0.1,
      // voip特有参数
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
    })

    // 时间配置表单验证规则
    const timeConfigRules = {
      timeDiff: [
        { required: true, message: t('experienceTest.testSettings.timeDiffRequired'), trigger: 'blur' },
        { type: 'number', min: 0, max: 10, message: t('experienceTest.testSettings.timeDiffRange'), trigger: 'blur' },
      ],
      collectInterval: [
        { required: true, message: t('experienceTest.testSettings.collectIntervalRequired'), trigger: 'change' },
      ],
    }

    // 表单验证规则
    const clientFtpRules = {
      serverAddress: [
        { required: true, message: t('experienceTest.testSettings.serverAddressRequired'), trigger: 'blur' },
      ],
      account: [
        { required: true, message: t('experienceTest.testSettings.accountRequired'), trigger: 'blur' },
      ],
      password: [
        { required: true, message: t('experienceTest.testSettings.passwordRequired'), trigger: 'blur' },
      ],
    }

    const networkFtpRules = {
      serverAddress: [
        { required: true, message: t('experienceTest.testSettings.serverAddressRequired'), trigger: 'blur' },
      ],
      account: [
        { required: true, message: t('experienceTest.testSettings.accountRequired'), trigger: 'blur' },
      ],
      password: [
        { required: true, message: t('experienceTest.testSettings.passwordRequired'), trigger: 'blur' },
      ],
    }

    const mappingRules = {
      deviceId: [
        { required: true, message: t('experienceTest.testSettings.deviceIdRequired'), trigger: 'blur' },
      ],
      gpsi: [
        { required: true, message: t('experienceTest.testSettings.gpsiRequired'), trigger: 'blur' },
      ],
    }

    // Tab切换
    const handleTabClick = (tab) => {
      if (tab.name === 'timeConfig') {
        loadTimeConfigData()
      } else if (tab.name === 'deviceIdGpsi') {
        loadMappingData()
      } else if (tab.name === 'clientFtp') {
        loadClientFtpData()
      } else if (tab.name === 'networkFtp') {
        loadNetworkFtpData()
      } else if (tab.name === 'vmosParams') {
        loadVmosParamsData()
      }
    }

    // 监听tab切换，自动加载对应数据
    watch(activeTab, (newTab) => {
      if (newTab === 'timeConfig') {
        loadTimeConfigData()
      } else if (newTab === 'deviceIdGpsi') {
        loadMappingData()
      } else if (newTab === 'clientFtp') {
        loadClientFtpData()
      } else if (newTab === 'networkFtp') {
        loadNetworkFtpData()
      } else if (newTab === 'vmosParams') {
        loadVmosParamsData()
      }
    })

    // 加载时间配置数据
    const loadTimeConfigData = async () => {
      try {
        const response = await testSettingsApi.getTimeConfig()
        if (response.data) {
          timeConfigForm.timeDiff = response.data.timeDiff || 0
          timeConfigForm.collectInterval = response.data.collectInterval || 10
        }
      } catch (error) {
        // 如果没有数据，不显示错误，保持表单为默认值
        if (error.response && error.response.status !== 404) {
          ElMessage.error(t('common.error'))
        }
      }
    }

    // 保存时间配置
    const handleSaveTimeConfig = async () => {
      if (!timeConfigFormRef.value) {
        return
      }
      await timeConfigFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              timeDiff: timeConfigForm.timeDiff,
              collectInterval: timeConfigForm.collectInterval,
            }
            await testSettingsApi.saveOrUpdateTimeConfig(data)
            ElMessage.success(t('common.success'))
          } catch (error) {
            ElMessage.error(t('common.error'))
          }
        }
      })
    }

    // 重置时间配置表单
    const handleResetTimeConfig = () => {
      if (timeConfigFormRef.value) {
        timeConfigFormRef.value.resetFields()
        loadTimeConfigData()
      }
    }

    // 加载端侧FTP服务器数据
    const loadClientFtpData = async () => {
      try {
        const response = await testSettingsApi.getClientFtpConfig()
        if (response.data) {
          clientFtpForm.serverAddress = response.data.serverAddress || ''
          clientFtpForm.account = response.data.account || ''
          clientFtpForm.password = response.data.password || ''
          clientFtpForm.checkMd5 = response.data.checkMd5 === 1
          clientFtpForm.directory = response.data.directory || ''
        }
      } catch (error) {
        // 如果没有数据，不显示错误，保持表单为空
        if (error.response && error.response.status !== 404) {
          ElMessage.error(t('common.error'))
        }
      }
    }

    // 加载网络侧FTP服务器数据
    const loadNetworkFtpData = async () => {
      try {
        const response = await testSettingsApi.getNetworkFtpConfig()
        if (response.data) {
          networkFtpForm.serverAddress = response.data.serverAddress || ''
          networkFtpForm.account = response.data.account || ''
          networkFtpForm.password = response.data.password || ''
          networkFtpForm.checkMd5 = response.data.checkMd5 === 1
          networkFtpForm.directory = response.data.directory || ''
        }
      } catch (error) {
        // 如果没有数据，不显示错误，保持表单为空
        if (error.response && error.response.status !== 404) {
          ElMessage.error(t('common.error'))
        }
      }
    }

    // 保存端侧FTP服务器信息
    const handleSaveClientFtp = async () => {
      if (!clientFtpFormRef.value) {
        return
      }
      await clientFtpFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              serverAddress: clientFtpForm.serverAddress,
              account: clientFtpForm.account,
              password: clientFtpForm.password,
              checkMd5: clientFtpForm.checkMd5 ? 1 : 0,
              directory: clientFtpForm.directory,
            }
            await testSettingsApi.saveOrUpdateClientFtpConfig(data)
            ElMessage.success(t('common.success'))
          } catch (error) {
            ElMessage.error(t('common.error'))
          }
        }
      })
    }

    // 重置端侧FTP服务器表单
    const handleResetClientFtp = () => {
      if (clientFtpFormRef.value) {
        clientFtpFormRef.value.resetFields()
        loadClientFtpData()
      }
    }

    // 保存网络侧FTP服务器信息
    const handleSaveNetworkFtp = async () => {
      if (!networkFtpFormRef.value) {
        return
      }
      await networkFtpFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              serverAddress: networkFtpForm.serverAddress,
              account: networkFtpForm.account,
              password: networkFtpForm.password,
              checkMd5: networkFtpForm.checkMd5 ? 1 : 0,
              directory: networkFtpForm.directory,
            }
            await testSettingsApi.saveOrUpdateNetworkFtpConfig(data)
            ElMessage.success(t('common.success'))
          } catch (error) {
            ElMessage.error(t('common.error'))
          }
        }
      })
    }

    // 重置网络侧FTP服务器表单
    const handleResetNetworkFtp = () => {
      if (networkFtpFormRef.value) {
        networkFtpFormRef.value.resetFields()
        loadNetworkFtpData()
      }
    }

    // 加载deviceid和GPSI对应关系数据
    const loadMappingData = async () => {
      mappingLoading.value = true
      try {
        const response = await testSettingsApi.getDeviceImsiMappings()
        mappingData.value = response.data || []
      } catch (error) {
        ElMessage.error(t('common.error'))
        mappingData.value = []
      } finally {
        mappingLoading.value = false
      }
    }

    // 添加deviceid和GPSI对应关系
    const handleAddMapping = () => {
      isEditMapping.value = false
      currentMappingId.value = null
      mappingDialogTitle.value = t('experienceTest.testSettings.addMapping')
      mappingForm.deviceId = ''
      mappingForm.gpsi = ''
      mappingDialogVisible.value = true
    }

    // 编辑deviceid和GPSI对应关系
    const handleEditMapping = (row) => {
      isEditMapping.value = true
      currentMappingId.value = row.id
      mappingDialogTitle.value = t('experienceTest.testSettings.editMapping')
      mappingForm.deviceId = row.deviceId
      mappingForm.gpsi = row.gpsi
      mappingDialogVisible.value = true
    }

    // 删除deviceid和GPSI对应关系
    const handleDeleteMapping = async (row) => {
      try {
        await ElMessageBox.confirm(
          t('experienceTest.testSettings.deleteMappingConfirm'),
          t('common.warning'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        )
        await testSettingsApi.deleteDeviceImsiMapping(row.id)
        ElMessage.success(t('common.success'))
        loadMappingData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('common.error'))
        }
      }
    }

    // 保存deviceid和GPSI对应关系
    const handleSaveMapping = async () => {
      if (!mappingFormRef.value) {
        return
      }
      await mappingFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              deviceId: mappingForm.deviceId,
              gpsi: mappingForm.gpsi,
            }
            if (isEditMapping.value) {
              await testSettingsApi.updateDeviceImsiMapping(currentMappingId.value, data)
            } else {
              await testSettingsApi.createDeviceImsiMapping(data)
            }
            ElMessage.success(t('common.success'))
            mappingDialogVisible.value = false
            loadMappingData()
          } catch (error) {
            ElMessage.error(t('common.error'))
          }
        }
      })
    }

    // 关闭对话框
    const handleMappingDialogClose = () => {
      if (mappingFormRef.value) {
        mappingFormRef.value.resetFields()
      }
    }

    onMounted(() => {
      loadTimeConfigData()
    })

    // 加载vMOS参数配置数据
    const loadVmosParamsData = async () => {
      vmosParamsLoading.value = true
      try {
        const response = await testSettingsApi.getVmosParamsConfig()
        if (response.code === 200) {
          const configs = response.data || []
          // 定义所有业务大类
          const allServices = [
            'shortvideo',
            'voip',
            'watch_live',
            'live_streaming',
            'vod_streaming',
            'meeting',
            'mobile_game',
            'mobile_game_cloud',
          ]
          
          // 创建业务大类列表，如果已有配置则使用配置，否则创建默认项
          const serviceList = allServices.map(service => {
            const config = configs.find(c => c.service === service)
            return config || { service }
          })
          
          vmosParamsData.value = serviceList
        } else {
          ElMessage.error(response.message || t('common.error'))
          // 如果获取失败，至少显示所有业务大类
          vmosParamsData.value = [
            { service: 'shortvideo' },
            { service: 'voip' },
            { service: 'watch_live' },
            { service: 'live_streaming' },
            { service: 'vod_streaming' },
            { service: 'meeting' },
            { service: 'mobile_game' },
            { service: 'mobile_game_cloud' },
          ]
        }
      } catch (error) {
        ElMessage.error(t('common.error'))
        // 如果出错，至少显示所有业务大类
        vmosParamsData.value = [
          { service: 'shortvideo' },
          { service: 'voip' },
          { service: 'watch_live' },
          { service: 'live_streaming' },
          { service: 'vod_streaming' },
          { service: 'meeting' },
          { service: 'mobile_game' },
          { service: 'mobile_game_cloud' },
        ]
      } finally {
        vmosParamsLoading.value = false
      }
    }

    // 编辑vMOS参数配置
    const handleEditVmosParams = async (row) => {
      try {
        const response = await testSettingsApi.getVmosParamsConfigByService(row.service)
        vmosParamsForm.service = row.service
        
        if (response.code === 200 && response.data) {
          const config = response.data
          
          if (row.service === 'voip') {
            // voip特有参数的默认值
            vmosParamsForm.v1 = config.v1 ?? 4.1192
            vmosParamsForm.v2 = config.v2 ?? 0.0975
            vmosParamsForm.v3 = config.v3 ?? 1.2667
            vmosParamsForm.v4 = config.v4 ?? 0.3177
            vmosParamsForm.v5 = config.v5 ?? 2.1276
            vmosParamsForm.fr = config.fr ?? 30
            vmosParamsForm.v12 = config.v12 ?? -0.6571
            vmosParamsForm.v13 = config.v13 ?? 232000
            vmosParamsForm.v14 = config.v14 ?? -1.295
            vmosParamsForm.v58 = config.v58 ?? 5
            vmosParamsForm.v59 = config.v59 ?? 1.382
            vmosParamsForm.v60 = config.v60 ?? 3.615
            vmosParamsForm.v61 = config.v61 ?? 396.6
            vmosParamsForm.v62 = config.v62 ?? 0.256
            vmosParamsForm.v63 = config.v63 ?? -2.016
            vmosParamsForm.a1 = config.a1 ?? 5
            vmosParamsForm.g1 = config.g1 ?? 0.15
            vmosParamsForm.g2 = config.g2 ?? 0.15
          } else {
            // 其他业务大类的默认值
            vmosParamsForm.a1 = config.a1 ?? 928.9840
            vmosParamsForm.a2 = config.a2 ?? 410
            vmosParamsForm.w1 = config.w1 ?? 0.25
            vmosParamsForm.w2 = config.w2 ?? 0.05
            vmosParamsForm.a3 = config.a3 ?? 0.0035
            vmosParamsForm.a4 = config.a4 ?? 180.94
            vmosParamsForm.a5 = config.a5 ?? 4
            vmosParamsForm.g1 = config.g1 ?? 0.25
            vmosParamsForm.g2 = config.g2 ?? 0.1
          }
          
          vmosParamsDialogVisible.value = true
        } else {
          // 如果没有配置，使用默认值
          if (row.service === 'voip') {
            vmosParamsForm.v1 = 4.1192
            vmosParamsForm.v2 = 0.0975
            vmosParamsForm.v3 = 1.2667
            vmosParamsForm.v4 = 0.3177
            vmosParamsForm.v5 = 2.1276
            vmosParamsForm.fr = 30
            vmosParamsForm.v12 = -0.6571
            vmosParamsForm.v13 = 232000
            vmosParamsForm.v14 = -1.295
            vmosParamsForm.v58 = 5
            vmosParamsForm.v59 = 1.382
            vmosParamsForm.v60 = 3.615
            vmosParamsForm.v61 = 396.6
            vmosParamsForm.v62 = 0.256
            vmosParamsForm.v63 = -2.016
            vmosParamsForm.a1 = 5
            vmosParamsForm.g1 = 0.15
            vmosParamsForm.g2 = 0.15
          } else {
            vmosParamsForm.a1 = 928.9840
            vmosParamsForm.a2 = 410
            vmosParamsForm.w1 = 0.25
            vmosParamsForm.w2 = 0.05
            vmosParamsForm.a3 = 0.0035
            vmosParamsForm.a4 = 180.94
            vmosParamsForm.a5 = 4
            vmosParamsForm.g1 = 0.25
            vmosParamsForm.g2 = 0.1
          }
          vmosParamsDialogVisible.value = true
        }
      } catch (error) {
        // 如果出错，使用默认值
        vmosParamsForm.service = row.service
        if (row.service === 'voip') {
          vmosParamsForm.v1 = 4.1192
          vmosParamsForm.v2 = 0.0975
          vmosParamsForm.v3 = 1.2667
          vmosParamsForm.v4 = 0.3177
          vmosParamsForm.v5 = 2.1276
          vmosParamsForm.fr = 30
          vmosParamsForm.v12 = -0.6571
          vmosParamsForm.v13 = 232000
          vmosParamsForm.v14 = -1.295
          vmosParamsForm.v58 = 5
          vmosParamsForm.v59 = 1.382
          vmosParamsForm.v60 = 3.615
          vmosParamsForm.v61 = 396.6
          vmosParamsForm.v62 = 0.256
          vmosParamsForm.v63 = -2.016
          vmosParamsForm.a1 = 5
          vmosParamsForm.g1 = 0.15
          vmosParamsForm.g2 = 0.15
        } else {
          vmosParamsForm.a1 = 928.9840
          vmosParamsForm.a2 = 410
          vmosParamsForm.w1 = 0.25
          vmosParamsForm.w2 = 0.05
          vmosParamsForm.a3 = 0.0035
          vmosParamsForm.a4 = 180.94
          vmosParamsForm.a5 = 4
          vmosParamsForm.g1 = 0.25
          vmosParamsForm.g2 = 0.1
        }
        vmosParamsDialogVisible.value = true
      }
    }

    // 保存vMOS参数配置
    const handleSaveVmosParams = async () => {
      vmosParamsSaving.value = true
      try {
        const data = {
          service: vmosParamsForm.service,
        }
        
        if (vmosParamsForm.service === 'voip') {
          // voip特有参数
          data.v1 = vmosParamsForm.v1
          data.v2 = vmosParamsForm.v2
          data.v3 = vmosParamsForm.v3
          data.v4 = vmosParamsForm.v4
          data.v5 = vmosParamsForm.v5
          data.fr = vmosParamsForm.fr
          data.v12 = vmosParamsForm.v12
          data.v13 = vmosParamsForm.v13
          data.v14 = vmosParamsForm.v14
          data.v58 = vmosParamsForm.v58
          data.v59 = vmosParamsForm.v59
          data.v60 = vmosParamsForm.v60
          data.v61 = vmosParamsForm.v61
          data.v62 = vmosParamsForm.v62
          data.v63 = vmosParamsForm.v63
          data.a1 = vmosParamsForm.a1
          data.g1 = vmosParamsForm.g1
          data.g2 = vmosParamsForm.g2
        } else {
          // 其他业务大类的参数
          data.a1 = vmosParamsForm.a1
          data.a2 = vmosParamsForm.a2
          data.w1 = vmosParamsForm.w1
          data.w2 = vmosParamsForm.w2
          data.a3 = vmosParamsForm.a3
          data.a4 = vmosParamsForm.a4
          data.a5 = vmosParamsForm.a5
          data.g1 = vmosParamsForm.g1
          data.g2 = vmosParamsForm.g2
        }
        
        const response = await testSettingsApi.saveOrUpdateVmosParamsConfig(data)
        if (response.code === 200) {
          ElMessage.success(t('common.success'))
          vmosParamsDialogVisible.value = false
          loadVmosParamsData()
        } else {
          ElMessage.error(response.message || t('common.error'))
        }
      } catch (error) {
        ElMessage.error(t('common.error'))
      } finally {
        vmosParamsSaving.value = false
      }
    }

    // 关闭vMOS参数配置对话框
    const handleVmosParamsDialogClose = () => {
      vmosParamsForm.service = ''
      vmosParamsForm.a1 = 928.9840
      vmosParamsForm.a2 = 410
      vmosParamsForm.w1 = 0.25
      vmosParamsForm.w2 = 0.05
      vmosParamsForm.a3 = 0.0035
      vmosParamsForm.a4 = 180.94
      vmosParamsForm.a5 = 4
      vmosParamsForm.g1 = 0.25
      vmosParamsForm.g2 = 0.1
      // 重置voip特有参数
      vmosParamsForm.v1 = 4.1192
      vmosParamsForm.v2 = 0.0975
      vmosParamsForm.v3 = 1.2667
      vmosParamsForm.v4 = 0.3177
      vmosParamsForm.v5 = 2.1276
      vmosParamsForm.fr = 30
      vmosParamsForm.v12 = -0.6571
      vmosParamsForm.v13 = 232000
      vmosParamsForm.v14 = -1.295
      vmosParamsForm.v58 = 5
      vmosParamsForm.v59 = 1.382
      vmosParamsForm.v60 = 3.615
      vmosParamsForm.v61 = 396.6
      vmosParamsForm.v62 = 0.256
      vmosParamsForm.v63 = -2.016
    }

    return {
      activeTab,
      clientFtpFormRef,
      networkFtpFormRef,
      mappingFormRef,
      timeConfigFormRef,
      vmosParamsFormRef,
      clientFtpForm,
      networkFtpForm,
      timeConfigForm,
      mappingData,
      mappingForm,
      vmosParamsData,
      vmosParamsForm,
      mappingLoading,
      mappingDialogVisible,
      mappingDialogTitle,
      vmosParamsLoading,
      vmosParamsDialogVisible,
      vmosParamsSaving,
      clientFtpRules,
      networkFtpRules,
      timeConfigRules,
      mappingRules,
      handleTabClick,
      handleSaveTimeConfig,
      handleResetTimeConfig,
      loadTimeConfigData,
      handleSaveClientFtp,
      handleResetClientFtp,
      handleSaveNetworkFtp,
      handleResetNetworkFtp,
      loadMappingData,
      handleAddMapping,
      handleEditMapping,
      handleDeleteMapping,
      handleSaveMapping,
      handleMappingDialogClose,
      loadVmosParamsData,
      handleEditVmosParams,
      handleSaveVmosParams,
      handleVmosParamsDialogClose,
    }
  },
}
</script>

<style scoped>
.test-settings-page {
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

.tab-content {
  padding: 20px 0;
}

.table-operations {
  margin-bottom: 16px;
}

.table-operations .el-button {
  margin-right: 8px;
}
</style>

