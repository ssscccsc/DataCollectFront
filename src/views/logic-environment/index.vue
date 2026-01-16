<template>
  <div class="logic-environment-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.logicEnvironment') }}</h2>
      <p class="page-description">{{ $t('logicEnvironment.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('logicEnvironment.addLogicEnvironment') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('logicEnvironment.refresh') }}
        </el-button>
        <div style="margin-left: 20px; display: inline-flex; align-items: center;">
          <span style="margin-right: 8px;">{{ $t('logicEnvironment.disableEnvironmentWhenUeInUse') }}</span>
          <el-switch
            v-model="disableEnvironmentWhenUeInUse"
            @change="handleDisableEnvironmentSettingChange"
          />
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" :label="$t('logicEnvironment.logicEnvironmentName')" />
        <el-table-column :label="$t('logicEnvironment.executor')" min-width="200">
          <template #default="scope">
            <div>
              <div>{{ scope.row.executorName }}</div>
              <div style="color: #909399; font-size: 12px;">{{ scope.row.executorIpAddress }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('logicEnvironment.ueInfo')" min-width="300">
          <template #default="scope">
            <div v-if="scope.row.ueList && scope.row.ueList.length > 0">
              <div v-for="ue in scope.row.ueList" :key="ue.id" style="margin-bottom: 8px;">
                <el-tag size="small" type="info">
                  {{ ue.name }} ({{ ue.ueId }}) - {{ ue.purpose }}
                </el-tag>
              </div>
            </div>
            <span v-else style="color: #909399;">{{ $t('logicEnvironment.noUe') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('logicEnvironment.logicNetwork')" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.networkList && scope.row.networkList.length > 0">
              <div v-for="network in scope.row.networkList" :key="network.id" style="margin-bottom: 8px;">
                <el-tag size="small" type="success">
                  {{ network.name }}
                </el-tag>
              </div>
            </div>
            <span v-else style="color: #909399;">{{ $t('logicEnvironment.noNetwork') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="$t('logicEnvironment.description')" />
        <el-table-column prop="status" :label="$t('logicEnvironment.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('logicEnvironment.enabled') : $t('logicEnvironment.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('logicEnvironment.createTime')" />
        <el-table-column :label="$t('logicEnvironment.operations')" width="300">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">{{ $t('logicEnvironment.edit') }}</el-button>
            <el-button size="small" type="primary" @click="handleManageUe(scope.row)">{{ $t('logicEnvironment.manageUe') }}</el-button>
            <el-button size="small" type="warning" @click="handleManageNetwork(scope.row)">{{ $t('logicEnvironment.manageNetwork') }}</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('logicEnvironment.delete') }}</el-button>
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
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item :label="$t('logicEnvironment.logicEnvironmentNameLabel')" prop="name">
          <el-input
              v-model="form.name"
              :placeholder="$t('logicEnvironment.logicEnvironmentNamePlaceholder')"
              disabled
          />
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.executorLabel')" prop="executorId">
          <el-select v-model="form.executorId" :placeholder="$t('logicEnvironment.executorPlaceholder')" style="width: 100%">
            <el-option
              v-for="item in executorOptions"
              :key="item.id"
              :label="`${item.name} (${item.ipAddress}) - ${item.regionName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.ueSelection')" prop="selectedUeIds">
          <el-select
            v-model="form.selectedUeIds"
            multiple
            filterable
            :placeholder="$t('logicEnvironment.uePlaceholder')"
            style="width: 100%"
            @change="handleUeSelectionChange"
          >
            <el-option
              v-for="item in ueOptions"
              :key="item.id"
              :label="`${item.name} (${item.ueId}) - ${item.purpose}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.selectedUe')" v-if="form.selectedUeIds && form.selectedUeIds.length > 0">
          <div class="selected-ue-list">
            <el-tag
              v-for="ueId in form.selectedUeIds"
              :key="ueId"
              closable
              @close="removeSelectedUe(ueId)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ getUeDisplayName(ueId) }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.networkLabel')" prop="network">
          <el-select v-model="form.network" :placeholder="$t('logicEnvironment.networkPlaceholder')" style="width: 100%">
            <el-option :label="$t('logicEnvironment.networkNormal')" value="normal" />
            <el-option :label="$t('logicEnvironment.networkWeak')" value="weak" />
            <el-option :label="$t('logicEnvironment.networkCongestion')" value="congestion" />
            <el-option :label="$t('logicEnvironment.networkWeakCongestion')" value="weakcongestion" />
            <el-option :label="$t('logicEnvironment.networkSunshang')" value="sunshang" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.logicNetworkSelection')" prop="selectedNetworkIds">
          <div style="margin-bottom: 10px;">
            <el-button size="small" type="primary" @click="showAddNetworkDialog">
              <el-icon><Plus /></el-icon>
              {{ $t('logicEnvironment.quickAddNetwork') }}
            </el-button>
          </div>
          <el-select
            v-model="form.selectedNetworkIds"
            multiple
            filterable
            :placeholder="$t('logicEnvironment.logicNetworkPlaceholder')"
            style="width: 100%"
            @change="handleNetworkSelectionChange"
          >
            <el-option
              v-for="item in networkOptions"
              :key="item.id"
              :label="`${item.name}${item.description ? ' - ' + item.description : ''}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.selectedNetwork')" v-if="form.selectedNetworkIds && form.selectedNetworkIds.length > 0">
          <div class="selected-network-list">
            <el-tag
              v-for="networkId in form.selectedNetworkIds"
              :key="networkId"
              closable
              @close="removeSelectedNetwork(networkId)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ getNetworkDisplayName(networkId) }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.physicalNetworkLabel')" prop="physicalNetwork">
          <div v-if="physicalNetworks.length > 0" class="physical-network-list">
            <el-tag
              v-for="(item, index) in physicalNetworks"
              :key="index"
              type="info"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ item }}
            </el-tag>
          </div>
          <div v-else style="color: #909399; font-size: 14px;">
             {{ $t('logicEnvironment.noPhysicalNetwork') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('logicEnvironment.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('logicEnvironment.statusLabel')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('logicEnvironment.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('logicEnvironment.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- UE管理对话框 -->
    <el-dialog
      v-model="ueDialogVisible"
      :title="$t('logicEnvironment.manageUe')"
      width="600px"
    >
      <div class="ue-management">
        <div class="ue-section">
          <h4>{{ $t('logicEnvironment.currentUeList') }}</h4>
          <el-table :data="currentUes" style="width: 100%">
            <el-table-column prop="name" :label="$t('logicEnvironment.ueName')" />
            <el-table-column prop="ueId" :label="$t('logicEnvironment.ueId')" />
            <el-table-column prop="purpose" :label="$t('logicEnvironment.purpose')" />
            <el-table-column :label="$t('logicEnvironment.operations')" width="100">
              <template #default="scope">
                <el-button size="small" type="danger" @click="removeUe(scope.row)">{{ $t('logicEnvironment.remove') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="ue-section">
          <h4>{{ $t('logicEnvironment.addUe') }}</h4>
          <el-select
            v-model="selectedUeId"
            :placeholder="$t('logicEnvironment.selectUeToAdd')"
            style="width: 100%"
            @change="addUe"
          >
            <el-option
              v-for="item in availableUes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
      </div>
    </el-dialog>

    <!-- 逻辑组网管理对话框 -->
    <el-dialog
      v-model="networkDialogVisible"
      :title="$t('logicEnvironment.manageLogicNetwork')"
      width="600px"
    >
      <div class="network-management">
        <div class="network-section">
          <h4>{{ $t('logicEnvironment.currentNetworkList') }}</h4>
          <el-table :data="currentNetworks" style="width: 100%">
            <el-table-column prop="name" :label="$t('logicEnvironment.networkName')" />
            <el-table-column prop="description" :label="$t('logicEnvironment.networkDescription')" />
            <el-table-column :label="$t('logicEnvironment.operations')" width="100">
              <template #default="scope">
                <el-button size="small" type="danger" @click="removeNetwork(scope.row)">{{ $t('logicEnvironment.remove') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="network-section">
          <h4>{{ $t('logicEnvironment.addNetwork') }}</h4>
          <el-select
            v-model="selectedNetworkId"
            :placeholder="$t('logicEnvironment.selectNetworkToAdd')"
            style="width: 100%"
            @change="addNetwork"
          >
            <el-option
              v-for="item in availableNetworks"
              :key="item.id"
              :label="`${item.name}${item.description ? ' - ' + item.description : ''}`"
              :value="item.id"
            />
          </el-select>
        </div>
      </div>
    </el-dialog>

    <!-- 快速添加逻辑组网对话框 -->
    <el-dialog
      v-model="quickAddNetworkDialogVisible"
      :title="$t('logicEnvironment.quickAddLogicNetwork')"
      width="500px"
    >
      <div class="quick-add-network">
        <div class="network-list">
          <div v-for="(network, index) in quickAddNetworks" :key="index" class="network-item">
            <el-form-item :label="`${$t('logicEnvironment.network')} ${index + 1}`" :prop="`networks.${index}.name`">
              <el-input
                v-model="network.name"
                :placeholder="$t('logicEnvironment.networkNamePlaceholder')"
                style="width: 100%; margin-bottom: 8px;"
              />
              <el-input
                v-model="network.description"
                type="textarea"
                :rows="2"
                :placeholder="$t('logicEnvironment.networkDescriptionPlaceholder')"
                style="width: 100%;"
              />
            </el-form-item>
            <el-button
              v-if="quickAddNetworks.length > 1"
              size="small"
              type="danger"
              @click="removeQuickAddNetwork(index)"
              style="margin-top: 8px;"
            >
              {{ $t('logicEnvironment.delete') }}
            </el-button>
          </div>
        </div>
        
        <div class="add-network-button">
          <el-button type="primary" @click="addQuickAddNetwork">
            <el-icon><Plus /></el-icon>
            {{ $t('logicEnvironment.addMoreNetworks') }}
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quickAddNetworkDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitQuickAddNetworks">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

export default {
  name: 'LogicEnvironment',
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()
    const executorOptions = ref([])
    const ueOptions = ref([])
    const networkOptions = ref([])
    const physicalNetworks = ref([])
    
    // UE管理相关
    const ueDialogVisible = ref(false)
    const currentUes = ref([])
    const availableUes = ref([])
    const selectedUeId = ref(null)
    const currentLogicEnvironmentId = ref(null)

    // 逻辑组网管理相关
    const networkDialogVisible = ref(false)
    const currentNetworks = ref([])
    const availableNetworks = ref([])
    const selectedNetworkId = ref(null)

    // 快速添加逻辑组网相关
    const quickAddNetworkDialogVisible = ref(false)
    const quickAddNetworks = ref([{ name: '', description: '' }])

    // UE使用中禁用环境配置
    const disableEnvironmentWhenUeInUse = ref(false)

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      executorId: null,
      network: null,
      selectedUeIds: [],
      selectedNetworkIds: [],
      description: '',
      status: 1,
    })

    const rules = {
      name: [
        { required: true, message: t('logicEnvironment.logicEnvironmentNameRequired'), trigger: 'blur' },
      ],
      executorId: [
        { required: true, message: t('logicEnvironment.executorRequired'), trigger: 'change' },
      ],
      selectedUeIds: [
        { required: true, message: t('logicEnvironment.ueRequired'), trigger: 'change' },
      ],
    }

    // 加载UE使用中禁用环境配置
    const loadDisableEnvironmentSetting = async () => {
      try {
        const res = await request({
          url: '/config/ue-disable-environment-when-in-use',
          method: 'get',
        })
        // 确保正确处理返回值，即使为null或undefined也使用false
        disableEnvironmentWhenUeInUse.value = res.data === true
      } catch (error) {
        console.error('加载配置失败:', error)
        // 如果接口不存在，使用默认值false
        disableEnvironmentWhenUeInUse.value = false
      }
    }

    // 处理禁用环境设置变更
    const handleDisableEnvironmentSettingChange = async (value) => {
      try {
        await request({
          url: '/config/ue-disable-environment-when-in-use',
          method: 'put',
          data: { enabled: value },
        })
        ElMessage.success(t('logicEnvironment.configSavedSuccess'))
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error(t('logicEnvironment.configSavedFailed'))
        // 恢复原值
        disableEnvironmentWhenUeInUse.value = !value
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        const res = await request({
          url: '/logic-environment/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
        
        // 刷新时同时重新加载配置状态
        loadDisableEnvironmentSetting()
      } catch (error) {
        console.error(t('logicEnvironment.loadDataFailed'), error)
      } finally {
        loading.value = false
      }
    }

    const loadExecutorOptions = async () => {
      try {
        const res = await request({
          url: '/executor/options',
          method: 'get',
        })
        executorOptions.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadExecutorDataFailed'), error)
      }
    }

    const loadUeOptions = async () => {
      try {
        const res = await request({
          url: '/ue/options',
          method: 'get',
        })
        ueOptions.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadUeDataFailed'), error)
      }
    }

    const loadNetworkOptions = async () => {
      try {
        const res = await request({
          url: '/network-type/list',
          method: 'get',
        })
        networkOptions.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadNetworkDataFailed'), error)
      }
    }

    const getUeDisplayName = (ueId) => {
      const ue = ueOptions.value.find(item => item.id === ueId)
      return ue ? `${ue.name} (${ue.ueId}) - ${ue.purpose}` : ueId
    }

    const getNetworkDisplayName = (networkId) => {
      const network = networkOptions.value.find(item => item.id === networkId)
      return network ? `${network.name}${network.description ? ' - ' + network.description : ''}` : networkId
    }

    const handleUeSelectionChange = (value) => {
      form.selectedUeIds = value
    }

    const removeSelectedUe = (ueId) => {
      const index = form.selectedUeIds.indexOf(ueId)
      if (index > -1) {
        form.selectedUeIds.splice(index, 1)
      }
    }

    const handleNetworkSelectionChange = (value) => {
      form.selectedNetworkIds = value
    }

    const removeSelectedNetwork = (networkId) => {
      const index = form.selectedNetworkIds.indexOf(networkId)
      if (index > -1) {
        form.selectedNetworkIds.splice(index, 1)
      }
    }

    const handleAdd = () => {
      dialogTitle.value = t('logicEnvironment.addLogicEnvironment')
      dialogVisible.value = true
      resetForm()
      loadExecutorOptions()
      loadUeOptions()
      loadNetworkOptions()
    }

    const handleEdit = (row) => {
      dialogTitle.value = t('logicEnvironment.editLogicEnvironment')
      Object.assign(form, row)
      
      // 处理UE回显：将ueList中的UE ID提取到selectedUeIds
      if (row.ueList && row.ueList.length > 0) {
        form.selectedUeIds = row.ueList.map(ue => ue.id)
      } else {
        form.selectedUeIds = []
      }
      
      // 处理逻辑组网回显：将networkList中的网络ID提取到selectedNetworkIds
      if (row.networkList && row.networkList.length > 0) {
        form.selectedNetworkIds = row.networkList.map(network => network.id)
      } else {
        form.selectedNetworkIds = []
      }
      
      // 处理物理组网回显：从数据库加载的physicalNetwork（JSON字符串）解析为数组
      if (row.physicalNetwork) {
        try {
          physicalNetworks.value = JSON.parse(row.physicalNetwork)
        } catch (error) {
          console.error('解析物理组网数据失败:', error)
          physicalNetworks.value = []
        }
      } else {
        physicalNetworks.value = []
      }
      
      dialogVisible.value = true
      loadExecutorOptions()
      loadUeOptions()
      loadNetworkOptions()

      // 等待数据加载后，如果数据库中没有物理组网数据，则自动生成
      setTimeout(() => {
        // 如果数据库中没有物理组网数据，则根据当前选择自动生成
        if (!row.physicalNetwork || physicalNetworks.value.length === 0) {
          generatePhysicalNetworks()
        }
        generateLogicEnvironmentName()
      }, 100)
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('logicEnvironment.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/logic-environment/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('logicEnvironment.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('logicEnvironment.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        // 将物理组网数组转换为JSON字符串
        const physicalNetworkJson = physicalNetworks.value && physicalNetworks.value.length > 0 
          ? JSON.stringify(physicalNetworks.value) 
          : null

        if (form.id) {
          // 编辑逻辑环境，同时更新UE和逻辑组网关联
          const requestData = {
            logicEnvironment: {
              name: form.name,
              executorId: form.executorId,
              description: form.description,
              network: form.network,
              physicalNetwork: physicalNetworkJson,
              status: form.status,
            },
            ueIds: form.selectedUeIds,
            networkIds: form.selectedNetworkIds,
          }
          
          await request({
            url: `/logic-environment/${form.id}/with-ue-and-network`,
            method: 'put',
            data: requestData,
          })
          ElMessage.success(t('logicEnvironment.updateSuccess'))
        } else {
          // 新增逻辑环境，同时关联UE
          const requestData = {
            logicEnvironment: {
              name: form.name,
              executorId: form.executorId,
              description: form.description,
              network: form.network,
              physicalNetwork: physicalNetworkJson,
              status: form.status,
            },
            ueIds: form.selectedUeIds,
            networkIds: form.selectedNetworkIds,
          }
          
          await request({
            url: '/logic-environment/with-ue-and-network',
            method: 'post',
            data: requestData,
          })
          ElMessage.success(t('logicEnvironment.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('logicEnvironment.submitFailed'), error)
        ElMessage.error(t('logicEnvironment.operationFailed'))
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        executorId: null,
        network: null,
        selectedUeIds: [],
        selectedNetworkIds: [],
        description: '',
        status: 1,
      })
      physicalNetworks.value = []
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    // UE管理相关方法
    const handleManageUe = async (row) => {
      currentLogicEnvironmentId.value = row.id
      ueDialogVisible.value = true
      await loadCurrentUes(row.id)
      await loadAvailableUes()
    }

    const loadCurrentUes = async (logicEnvironmentId) => {
      try {
        const res = await request({
          url: `/logic-environment/${logicEnvironmentId}/ue`,
          method: 'get',
        })
        currentUes.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadCurrentUeFailed'), error)
      }
    }

    const loadAvailableUes = async () => {
      try {
        const res = await request({
          url: '/ue/list',
          method: 'get',
        })
        availableUes.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadAvailableUeFailed'), error)
      }
    }

    const addUe = async () => {
      if (!selectedUeId.value) return
      
      try {
        await request({
          url: `/logic-environment/${currentLogicEnvironmentId.value}/ue`,
          method: 'post',
          data: [selectedUeId.value],
        })
        ElMessage.success(t('logicEnvironment.addUeSuccess'))
        selectedUeId.value = null
        await loadCurrentUes(currentLogicEnvironmentId.value)
        await loadAvailableUes()
      } catch (error) {
        ElMessage.error(t('logicEnvironment.addUeFailed'))
      }
    }

    const removeUe = async (ue) => {
      try {
        await request({
          url: `/logic-environment/${currentLogicEnvironmentId.value}/ue/${ue.id}`,
          method: 'delete',
        })
        ElMessage.success(t('logicEnvironment.removeUeSuccess'))
        await loadCurrentUes(currentLogicEnvironmentId.value)
        await loadAvailableUes()
      } catch (error) {
        ElMessage.error(t('logicEnvironment.removeUeFailed'))
      }
    }

    // 逻辑组网管理相关方法
    const handleManageNetwork = async (row) => {
      currentLogicEnvironmentId.value = row.id
      networkDialogVisible.value = true
      await loadCurrentNetworks(row.id)
      await loadAvailableNetworks()
    }

    const loadCurrentNetworks = async (logicEnvironmentId) => {
      try {
        const res = await request({
          url: `/logic-environment/${logicEnvironmentId}/network`,
          method: 'get',
        })
        currentNetworks.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadCurrentNetworkFailed'), error)
      }
    }

    const loadAvailableNetworks = async () => {
      try {
        const res = await request({
          url: '/network-type/list',
          method: 'get',
        })
        availableNetworks.value = res.data
      } catch (error) {
        console.error(t('logicEnvironment.loadAvailableNetworkFailed'), error)
      }
    }

    const addNetwork = async () => {
      if (!selectedNetworkId.value) return
      
      try {
        await request({
          url: `/logic-environment/${currentLogicEnvironmentId.value}/network`,
          method: 'post',
          data: [selectedNetworkId.value],
        })
        ElMessage.success(t('logicEnvironment.addNetworkSuccess'))
        selectedNetworkId.value = null
        await loadCurrentNetworks(currentLogicEnvironmentId.value)
        await loadAvailableNetworks()
      } catch (error) {
        ElMessage.error(t('logicEnvironment.addNetworkFailed'))
      }
    }

    const removeNetwork = async (network) => {
      try {
        await request({
          url: `/logic-environment/${currentLogicEnvironmentId.value}/network/${network.id}`,
          method: 'delete',
        })
        ElMessage.success(t('logicEnvironment.removeNetworkSuccess'))
        await loadCurrentNetworks(currentLogicEnvironmentId.value)
        await loadAvailableNetworks()
      } catch (error) {
        ElMessage.error(t('logicEnvironment.removeNetworkFailed'))
      }
    }


    // 快速添加逻辑组网相关方法
    const showAddNetworkDialog = () => {
      quickAddNetworks.value = [{ name: '', description: '' }]
      quickAddNetworkDialogVisible.value = true
    }

    const addQuickAddNetwork = () => {
      quickAddNetworks.value.push({ name: '', description: '' })
    }

    const removeQuickAddNetwork = (index) => {
      quickAddNetworks.value.splice(index, 1)
    }

    const submitQuickAddNetworks = async () => {
      // 验证输入
      for (let i = 0; i < quickAddNetworks.value.length; i++) {
        const network = quickAddNetworks.value[i]
        if (!network.name || !network.name.trim()) {
          ElMessage.warning(t('logicEnvironment.fillNetworkName', { index: i + 1 }))
          return
        }
        // 描述字段不是必需的，可以为空
      }

      try {
        // 批量创建网络类型（作为逻辑组网使用）
        const createdNetworks = []
        for (const network of quickAddNetworks.value) {
          const res = await request({
            url: '/network-type',
            method: 'post',
            data: {
              name: network.name.trim(),
              description: network.description ? network.description.trim() : '', // 描述可以为空
              status: 1, // 默认启用状态
            },
          })
          createdNetworks.push(res.data)
        }

        // 将新创建的组网添加到选择列表中
        for (const network of createdNetworks) {
          if (!form.selectedNetworkIds.includes(network.id)) {
            form.selectedNetworkIds.push(network.id)
          }
        }

        // 刷新组网选项列表
        await loadNetworkOptions()
        
        ElMessage.success(t('logicEnvironment.quickAddNetworkSuccess', { count: createdNetworks.length }))
        quickAddNetworkDialogVisible.value = false
      } catch (error) {
        console.error(t('logicEnvironment.quickAddNetworkFailed'), error)
        ElMessage.error(t('logicEnvironment.quickAddNetworkFailed'))
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

    // 生成物理组网
    const generatePhysicalNetworks = () => {
      const networks = []

      // 检查必须得数据是否都已选择
      if (!form.selectedNetworkIds || form.selectedNetworkIds.length === 0 
          || !form.network 
          || !form.selectedUeIds || form.selectedUeIds.length === 0) {
            physicalNetworks.value = []
            return
      }

      // 获取选中的逻辑组网名称列表
      const logicNetworkNames = form.selectedNetworkIds.map(id => {
        const network = networkOptions.value.find(n => n.id === id)
        return network ? network.name : null
      }).filter(name => name)

      //获取选中的UE的厂商列表（去重）
      const vendors = [...new Set(
        form.selectedUeIds.map(id => {
          const ue = ueOptions.value.find(u => u.id ===id)
          return ue ? ue.vendor : null
        }).filter(vendor => vendor)
      )]

      // 生成物理组网: 逻辑组网_网络_厂商
      for (const logicNetworkName of logicNetworkNames) {
        for (const vendor of vendors) {
          const physicalNetworkName = `${logicNetworkName}_${form.network}_${vendor}`
          networks.push(physicalNetworkName)
        }
      }

      physicalNetworks.value = networks
    }

    // 监听表单变化，自动生成物理组网
    watch(() => [form.selectedNetworkIds, form.network, form.selectedUeIds],
          () => {generatePhysicalNetworks()},
          {deep: true}
          )   

    // 生成逻辑环境名称
    const generateLogicEnvironmentName = () => {
      // 检查必须得数据
      if (!form.executorId || !physicalNetworks.value || physicalNetworks.value.length === 0) {
        form.name = ''
        return
      }

      // 获取执行机名称
      const executor = executorOptions.value.find(e => e.id === form.executorId)
      if (!executor) {
        form.name = ''
        return
      }

      // 生成逻辑环境名称：执行机_物理组网
      const executorName = executor.name
      const physicalNetworkNames = physicalNetworks.value.join("_")
      form.name = `${executorName}_${physicalNetworkNames}`
    }

      // 监听表单变化，自动生成物理组网
    watch(() => [form.executorId, physicalNetworks.value],
          () => {generateLogicEnvironmentName()},
          {deep: true}
          ) 

    onMounted(() => {
      loadData()
      loadExecutorOptions()
      loadUeOptions()
      loadNetworkOptions()
      loadDisableEnvironmentSetting()
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
      executorOptions,
      ueOptions,
      networkOptions,
      physicalNetworks,
      ueDialogVisible,
      currentUes,
      availableUes,
      selectedUeId,
      loadData,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      resetForm,
      handleManageUe,
      addUe,
      removeUe,
      handleSizeChange,
      handleCurrentChange,
      getUeDisplayName,
      handleUeSelectionChange,
      removeSelectedUe,
      networkDialogVisible,
      currentNetworks,
      availableNetworks,
      selectedNetworkId,
      handleManageNetwork,
      loadCurrentNetworks,
      loadAvailableNetworks,
      addNetwork,
      removeNetwork,
      getNetworkDisplayName,
      handleNetworkSelectionChange,
      removeSelectedNetwork,
      showAddNetworkDialog,
      quickAddNetworkDialogVisible,
      quickAddNetworks,
      addQuickAddNetwork,
      removeQuickAddNetwork,
      submitQuickAddNetworks,
      disableEnvironmentWhenUeInUse,
      handleDisableEnvironmentSettingChange,
    }
  },
}
</script>

<style scoped>
.logic-environment-page {
  padding: 20px;
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

.ue-management {
  padding: 20px 0;
}

.ue-section {
  margin-bottom: 20px;
}

.ue-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.ue-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ue-name {
  font-weight: bold;
  color: #303133;
}

.ue-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.ue-id {
  color: #409EFF;
}

.ue-purpose {
  color: #67C23A;
}



.selected-ue-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-add-network .network-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.quick-add-network .network-item {
  margin-bottom: 15px;
}

.quick-add-network .network-item .el-form-item {
  margin-bottom: 8px;
}

.quick-add-network .add-network-button {
  text-align: center;
  margin-top: 15px;
}
</style>
