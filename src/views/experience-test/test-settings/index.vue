<template>
  <div class="test-settings-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.testSettings') }}</h2>
      <p class="page-description">{{ $t('experienceTest.testSettings.description') }}</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
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
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
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
    const activeTab = ref('clientFtp')
    const clientFtpFormRef = ref(null)
    const networkFtpFormRef = ref(null)
    const mappingFormRef = ref(null)
    const mappingLoading = ref(false)
    const mappingDialogVisible = ref(false)
    const mappingDialogTitle = ref('')
    const isEditMapping = ref(false)
    const currentMappingId = ref(null)

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
      if (tab.name === 'deviceIdGpsi') {
        loadMappingData()
      } else if (tab.name === 'clientFtp') {
        loadClientFtpData()
      } else if (tab.name === 'networkFtp') {
        loadNetworkFtpData()
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
      loadClientFtpData()
    })

    return {
      activeTab,
      clientFtpFormRef,
      networkFtpFormRef,
      mappingFormRef,
      clientFtpForm,
      networkFtpForm,
      mappingData,
      mappingForm,
      mappingLoading,
      mappingDialogVisible,
      mappingDialogTitle,
      clientFtpRules,
      networkFtpRules,
      mappingRules,
      handleTabClick,
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

