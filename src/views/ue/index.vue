<template>
  <div class="ue-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.ue') }}</h2>
      <p class="page-description">{{ $t('ue.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('ue.addUe') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('ue.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" :label="$t('ue.ueName')" />
        <el-table-column prop="ueId" :label="$t('ue.ueId')" />
        <el-table-column prop="purpose" :label="$t('ue.purpose')" />
        <el-table-column prop="networkTypeName" :label="$t('ue.networkType')" />
        <el-table-column prop="vendorName" :label="$t('ue.vendor')">
          <template #default="scope">
            <span v-if="scope.row.vendorName">{{ scope.row.vendorName }}</span>
            <span v-else style="color: #909399;">{{ $t('ue.notConfigured') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="port" :label="$t('ue.port')">
          <template #default="scope">
            <span v-if="scope.row.port && scope.row.port !== '0'">{{ scope.row.port }}</span>
            <span v-else style="color: #909399;">0</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="$t('ue.description')" />
        <el-table-column prop="status" :label="$t('ue.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('ue.enabled') : $t('ue.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('ue.inUseStatus')" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.inUse === 1 ? 'warning' : 'success'">
              {{ scope.row.inUse === 1 ? $t('ue.inUse') : $t('ue.available') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('ue.createTime')" />
        <el-table-column :label="$t('ue.operations')" width="280">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">{{ $t('ue.edit') }}</el-button>
            <el-button 
              v-if="scope.row.inUse === 1" 
              size="small" 
              type="warning" 
              @click="handleRelease(scope.row)"
            >
              {{ $t('ue.release') }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('ue.delete') }}</el-button>
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
        <el-form-item :label="$t('ue.ueNameLabel')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('ue.ueNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('ue.ueIdLabel')" prop="ueId">
          <el-input v-model="form.ueId" :placeholder="$t('ue.ueIdPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('ue.purposeLabel')" prop="purpose">
          <el-input v-model="form.purpose" :placeholder="$t('ue.purposePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('ue.networkTypeLabel')" prop="networkTypeId">
          <el-select v-model="form.networkTypeId" :placeholder="$t('ue.networkTypePlaceholder')" style="width: 100%">
            <el-option
              v-for="item in networkTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('ue.vendorLabel')" prop="vendor">
          <el-select v-model="form.vendor" :placeholder="$t('ue.vendorPlaceholder')" style="width: 100%">
            <el-option
              v-for="item in vendorOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('ue.portLabel')" prop="port">
          <el-input 
            v-model="form.port" 
            :placeholder="$t('ue.portPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('ue.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('ue.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('ue.statusLabel')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('ue.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('ue.disabled') }}</el-radio>
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
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

export default {
  name: 'Ue',
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()
    const networkTypeOptions = ref([])
    const vendorOptions = ref([])

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      ueId: '',
      purpose: '',
      networkTypeId: null,
      vendor: '',
      port: '0',
      description: '',
      status: 1,
    })

    const rules = {
      name: [
        { required: true, message: t('ue.ueNameRequired'), trigger: 'blur' },
      ],
      ueId: [
        { required: true, message: t('ue.ueIdRequired'), trigger: 'blur' },
      ],
      purpose: [
        { required: true, message: t('ue.purposeRequired'), trigger: 'blur' },
      ],
      networkTypeId: [
        { required: true, message: t('ue.networkTypeRequired'), trigger: 'change' },
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
          url: '/ue/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
      } catch (error) {
        console.error(t('ue.loadDataFailed'), error)
      } finally {
        loading.value = false
      }
    }

    const loadNetworkTypeOptions = async () => {
      try {
        const res = await request({
          url: '/network-type/list',
          method: 'get',
        })
        networkTypeOptions.value = res.data
      } catch (error) {
        console.error(t('ue.loadNetworkTypeDataFailed'), error)
      }
    }

    const loadVendorOptions = async () => {
      try {
        const res = await request({
          url: '/ue/vendors',
          method: 'get',
        })
        vendorOptions.value = res.data
      } catch (error) {
        console.error(t('ue.loadVendorDataFailed'), error)
      }
    }

    const handleAdd = () => {
      dialogTitle.value = t('ue.addUe')
      dialogVisible.value = true
      resetForm()
    }

    const handleEdit = (row) => {
      dialogTitle.value = t('ue.editUe')
      // 只提取实体类中存在的字段，避免DTO字段导致的反序列化错误
      Object.assign(form, {
        id: row.id,
        name: row.name,
        ueId: row.ueId,
        purpose: row.purpose,
        networkTypeId: row.networkTypeId,
        vendor: row.vendor,
        port: row.port,
        description: row.description,
        status: row.status,
      })
      dialogVisible.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('ue.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/ue/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('ue.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('ue.deleteFailed'))
        }
      }
    }

    const handleRelease = async (row) => {
      try {
        await ElMessageBox.confirm(
          t('ue.releaseConfirm', { name: row.name || row.ueId }),
          t('common.info'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        )
        
        await request({
          url: `/ue/${row.id}/release`,
          method: 'post',
        })
        ElMessage.success(t('ue.releaseSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('ue.releaseFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        if (form.id) {
          await request({
            url: `/ue/${form.id}`,
            method: 'put',
            data: form,
          })
          ElMessage.success(t('ue.updateSuccess'))
        } else {
          await request({
            url: '/ue',
            method: 'post',
            data: form,
          })
          ElMessage.success(t('ue.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('ue.submitFailed'), error)
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        ueId: '',
        purpose: '',
        networkTypeId: null,
        vendor: '',
        port: '0',
        description: '',
        status: 1,
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
      loadNetworkTypeOptions()
      loadVendorOptions()
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
      networkTypeOptions,
      vendorOptions,
      loadData,
      handleAdd,
      handleEdit,
      handleDelete,
      handleRelease,
      handleSubmit,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.ue-page {
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
