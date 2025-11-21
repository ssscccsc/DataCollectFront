<template>
  <div class="executor-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.executor') }}</h2>
      <p class="page-description">{{ $t('executor.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('executor.addExecutor') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('executor.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" :label="$t('executor.executorName')" />
        <el-table-column prop="ipAddress" :label="$t('executor.ipAddress')" />
        <el-table-column prop="macAddress" :label="$t('executor.macAddress')" />
        <el-table-column prop="regionName" :label="$t('executor.region')" />
        <el-table-column prop="description" :label="$t('executor.description')" />
        <el-table-column prop="createTime" :label="$t('executor.createTime')" />
        <el-table-column :label="$t('executor.operations')" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">{{ $t('executor.edit') }}</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('executor.delete') }}</el-button>
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
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('executor.executorNameLabel')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('executor.executorNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('executor.ipAddressLabel')" prop="ipAddress">
          <el-input v-model="form.ipAddress" :placeholder="$t('executor.ipAddressPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('executor.macAddressLabel')" prop="macAddressId">
          <el-select 
            v-model="form.macAddressId" 
            :placeholder="$t('executor.macAddressPlaceholder')" 
            style="width: 100%"
            filterable
            clearable
            @focus="loadMacAddressOptions"
          >
            <el-option
              v-for="item in macAddressOptions"
              :key="item.id"
              :label="getMacAddressLabel(item)"
              :value="item.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ item.macAddress }}</span>
                <span style="color: #909399; font-size: 12px; margin-left: 8px;">
                  {{ item.ipAddress || '未关联IP' }}
                </span>
              </div>
            </el-option>
          </el-select>
          <div v-if="form.macAddressId" style="margin-top: 8px; font-size: 12px; color: #909399;">
            <span>提示：一个MAC地址可以关联多个IP地址</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('executor.regionLabel')" prop="regionId">
          <el-select 
            v-model="form.regionId" 
            :placeholder="$t('executor.regionPlaceholder')" 
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="item in regionOptions"
              :key="item.id"
              :label="item.fullPath"
              :value="item.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ item.fullPath }}</span>
                <el-tag size="small" type="info">{{ $t('executor.city') }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('executor.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('executor.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

export default {
  name: 'Executor',
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()
    const regionOptions = ref([])
    const macAddressOptions = ref([])

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      ipAddress: '',
      macAddressId: null,
      regionId: null,
      description: '',
    })

    const rules = {
      name: [
        { required: true, message: t('executor.executorNameRequired'), trigger: 'blur' },
      ],
      ipAddress: [
        { required: true, message: t('executor.ipAddressRequired'), trigger: 'blur' },
      ],
      regionId: [
        { required: true, message: t('executor.regionRequired'), trigger: 'change' },
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
          url: '/executor/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
      } catch (error) {
        console.error(t('executor.loadDataFailed'), error)
      } finally {
        loading.value = false
      }
    }

    const loadRegionOptions = async () => {
      try {
        const res = await request({
          url: '/executor/region-options',
          method: 'get',
        })
        regionOptions.value = res.data
      } catch (error) {
        console.error(t('executor.loadRegionDataFailed'), error)
      }
    }

    const loadMacAddressOptions = async () => {
      try {
        const res = await request({
          url: '/executor-mac-address/list',
          method: 'get',
        })
        // 从executor_mac_address表获取所有数据（包括已关联和未关联的）
        macAddressOptions.value = res.data || []
      } catch (error) {
        console.error('加载MAC地址列表失败:', error)
        macAddressOptions.value = []
      }
    }

    const getMacAddressLabel = (item) => {
      if (item.ipAddress) {
        return `${item.macAddress} (${item.ipAddress})`
      }
      return item.macAddress
    }

    const handleAdd = () => {
      dialogTitle.value = t('executor.addExecutor')
      dialogVisible.value = true
      resetForm()
      loadMacAddressOptions()
    }

    const handleEdit = async (row) => {
      dialogTitle.value = t('executor.editExecutor')
      // 正确映射字段，确保字段名称一致
      form.id = row.id
      form.name = row.name
      form.ipAddress = row.ipAddress
      form.regionId = row.regionId
      form.description = row.description
      
      // 加载执行机关联的MAC地址
      if (row.id) {
        try {
          const res = await request({
            url: `/executor-mac-address/executor/${row.id}`,
            method: 'get',
          })
          if (res.data && res.data.length > 0) {
            form.macAddressId = res.data[0].id
          }
        } catch (error) {
          console.error('加载执行机MAC地址失败:', error)
        }
      }
      
      dialogVisible.value = true
      loadMacAddressOptions()
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('executor.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/executor/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('executor.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('executor.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        if (form.id) {
          await request({
            url: `/executor/${form.id}`,
            method: 'put',
            data: form,
          })
          ElMessage.success(t('executor.updateSuccess'))
        } else {
          await request({
            url: '/executor',
            method: 'post',
            data: form,
          })
          ElMessage.success(t('executor.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('executor.submitFailed'), error)
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        ipAddress: '',
        macAddressId: null,
        regionId: null,
        description: '',
      })
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

    onMounted(() => {
      loadData()
      loadRegionOptions()
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
      regionOptions,
      macAddressOptions,
      loadMacAddressOptions,
      getMacAddressLabel,
      loadData,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.executor-page {
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
</style>
