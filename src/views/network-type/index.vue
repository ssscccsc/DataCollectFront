<template>
  <div class="network-type-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.networkType') }}</h2>
      <p class="page-description">{{ $t('networkType.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('networkType.addNetworkType') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('networkType.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" :label="$t('networkType.networkTypeName')" />
        <el-table-column prop="description" :label="$t('networkType.description')" />
        <el-table-column prop="status" :label="$t('networkType.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('networkType.enabled') : $t('networkType.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('networkType.createTime')" />
        <el-table-column :label="$t('networkType.operations')" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">{{ $t('networkType.edit') }}</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('networkType.delete') }}</el-button>
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
        label-width="120px"
      >
        <el-form-item :label="$t('networkType.networkTypeNameLabel')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('networkType.networkTypeNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('networkType.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('networkType.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('networkType.statusLabel')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('networkType.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('networkType.disabled') }}</el-radio>
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
  name: 'NetworkType',
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      description: '',
      status: 1,
    })

    const rules = {
      name: [
        { required: true, message: t('networkType.networkTypeNameRequired'), trigger: 'blur' },
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
          url: '/network-type/page',
          method: 'get',
          params,
        })
        tableData.value = res.data.records
        pagination.total = res.data.total
      } catch (error) {
        console.error(t('networkType.loadDataFailed'), error)
      } finally {
        loading.value = false
      }
    }

    const handleAdd = () => {
      dialogTitle.value = t('networkType.addNetworkType')
      dialogVisible.value = true
      resetForm()
    }

    const handleEdit = (row) => {
      dialogTitle.value = t('networkType.editNetworkType')
      Object.assign(form, row)
      dialogVisible.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('networkType.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/network-type/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('networkType.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('networkType.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        if (form.id) {
          await request({
            url: `/network-type/${form.id}`,
            method: 'put',
            data: form,
          })
          ElMessage.success(t('networkType.updateSuccess'))
        } else {
          await request({
            url: '/network-type',
            method: 'post',
            data: form,
          })
          ElMessage.success(t('networkType.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('networkType.submitFailed'), error)
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
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
.network-type-page {
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
