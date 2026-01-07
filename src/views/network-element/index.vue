<template>
  <div class="network-element-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.networkElement') }}</h2>
      <p class="page-description">{{ $t('networkElement.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('networkElement.addNetworkElement') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('networkElement.refresh') }}
        </el-button>
        <div class="search-box">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('networkElement.networkElementNamePlaceholder')"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter="loadData"
          />
          <el-button type="primary" @click="loadData">{{ $t('common.search') }}</el-button>
        </div>
      </div>

      <el-table 
        :data="tableData" 
        v-loading="loading" 
        style="width: 100%"
        row-key="id"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="attribute-list">
              <div v-if="row.attributes && row.attributes.length > 0">
                <div 
                  v-for="(attr, index) in row.attributes" 
                  :key="index"
                  class="attribute-item"
                >
                  <el-tag type="info" style="margin-right: 10px;">{{ attr.attributeName }}</el-tag>
                  <span>{{ attr.attributeValue || '-' }}</span>
                </div>
              </div>
              <el-empty v-else :description="$t('networkElement.noAttributes')" :image-size="50" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.name" :label="$t('networkElement.networkElementName')" />
        <el-table-column :label="$t('networkElement.attributeCount')">
          <template #default="{ row }">
            <el-tag>{{ row.attributes ? row.attributes.length : 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.status" :label="$t('networkElement.status')">
          <template #default="{ row }">
            <el-tag :type="row.networkElement.status === 1 ? 'success' : 'danger'">
              {{ row.networkElement.status === 1 ? $t('networkElement.enabled') : $t('networkElement.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.createTime" :label="$t('networkElement.createTime')" />
        <el-table-column :label="$t('networkElement.operations')" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">{{ $t('networkElement.edit') }}</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">{{ $t('networkElement.delete') }}</el-button>
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
        label-width="100px"
      >
        <el-form-item :label="$t('networkElement.networkElementNameLabel')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('networkElement.networkElementNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('networkElement.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('networkElement.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('networkElement.statusLabel')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('networkElement.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('networkElement.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('networkElement.attributeConfig')">
          <div class="attribute-form-list">
            <div 
              v-for="(attr, index) in form.attributes" 
              :key="index"
              class="attribute-form-item"
            >
              <el-input
                v-model="attr.attributeName"
                :placeholder="$t('networkElement.attributeNamePlaceholder')"
                style="width: 150px; margin-right: 10px;"
              />
              <el-input
                v-model="attr.attributeValue"
                :placeholder="$t('networkElement.attributeValuePlaceholder')"
                style="flex: 1; margin-right: 10px;"
              />
              <el-button 
                type="danger" 
                size="small"
                @click="removeAttribute(index)"
              >
                {{ $t('networkElement.removeAttribute') }}
              </el-button>
            </div>
            <el-button 
              type="primary" 
              size="small"
              @click="addAttribute"
              style="margin-top: 10px;"
            >
              {{ $t('networkElement.addAttribute') }}
            </el-button>
          </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

export default {
  name: 'NetworkElement',
  components: {
    Plus,
    Refresh,
  },
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const tableData = ref([])
    const currentId = ref(null)
    
    const dialogTitle = computed(() => {
      return currentId.value === null ? t('networkElement.addNetworkElement') : t('networkElement.editNetworkElement')
    })
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })
    
    const searchForm = reactive({
      name: '',
    })
    
    const form = reactive({
      name: '',
      description: '',
      status: 1,
      attributes: [],
    })
    
    const rules = {
      name: [
        { required: true, message: t('networkElement.networkElementNameRequired'), trigger: 'blur' },
      ],
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      try {
        const response = await request.get('/network-element/page', {
          params: {
            current: pagination.current,
            size: pagination.size,
            name: searchForm.name || undefined,
          },
        })
        
        if (response.code === 200) {
          tableData.value = response.data.records || []
          pagination.total = response.data.total || 0
        } else {
          ElMessage.error(response.msg || t('networkElement.loadDataFailed'))
        }
      } catch (error) {
        console.error(t('networkElement.loadDataFailed'), error)
        ElMessage.error(t('networkElement.loadDataFailed'))
      } finally {
        loading.value = false
      }
    }
    
    // 新增
    const handleAdd = () => {
      currentId.value = null
      resetForm()
      dialogVisible.value = true
    }
    
    // 编辑
    const handleEdit = async (row) => {
      currentId.value = row.networkElement.id
      try {
        const response = await request.get(`/network-element/${row.networkElement.id}`)
        if (response.code === 200) {
          const data = response.data
          form.name = data.networkElement.name
          form.description = data.networkElement.description || ''
          form.status = data.networkElement.status
          form.attributes = (data.attributes || []).map(attr => ({
            attributeName: attr.attributeName,
            attributeValue: attr.attributeValue || '',
          }))
          
          if (form.attributes.length === 0) {
            form.attributes.push({ attributeName: '', attributeValue: '' })
          }
          
          dialogVisible.value = true
        } else {
          ElMessage.error(response.msg || t('networkElement.loadDataFailed'))
        }
      } catch (error) {
        console.error(t('networkElement.loadDataFailed'), error)
        ElMessage.error(t('networkElement.loadDataFailed'))
      }
    }
    
    // 删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        t('networkElement.deleteConfirm', { name: row.networkElement.name }),
        t('common.info'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
      ).then(async () => {
        try {
          const response = await request.delete(`/network-element/${row.networkElement.id}`)
          if (response.code === 200) {
            ElMessage.success(t('networkElement.deleteSuccess'))
            loadData()
          } else {
            ElMessage.error(response.msg || t('networkElement.deleteFailed'))
          }
        } catch (error) {
          console.error(t('networkElement.deleteFailed'), error)
          ElMessage.error(t('networkElement.deleteFailed'))
        }
      }).catch(() => {})
    }
    
    // 提交
    const handleSubmit = async () => {
      if (!formRef.value) {
        return
      }
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 过滤掉空的属性
            const attributes = form.attributes.filter(
              attr => attr.attributeName && attr.attributeName.trim() !== ''
            )
            
            const requestData = {
              networkElement: {
                id: currentId.value,
                name: form.name,
                description: form.description,
                status: form.status,
              },
              attributes: attributes.map(attr => ({
                attributeName: attr.attributeName.trim(),
                attributeValue: attr.attributeValue ? attr.attributeValue.trim() : '',
              })),
            }
            
            let response
            if (currentId.value === null) {
              response = await request.post('/network-element', requestData)
            } else {
              response = await request.put(`/network-element/${currentId.value}`, requestData)
            }
            
            if (response.code === 200) {
              ElMessage.success(currentId.value === null ? t('networkElement.createSuccess') : t('networkElement.updateSuccess'))
              dialogVisible.value = false
              loadData()
            } else {
              ElMessage.error(response.msg || t('networkElement.submitFailed'))
            }
          } catch (error) {
            console.error(t('networkElement.submitFailed'), error)
            ElMessage.error(t('networkElement.submitFailed'))
          }
        }
      })
    }
    
    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      form.name = ''
      form.description = ''
      form.status = 1
      form.attributes = [{ attributeName: '', attributeValue: '' }]
      currentId.value = null
    }
    
    // 添加属性
    const addAttribute = () => {
      form.attributes.push({ attributeName: '', attributeValue: '' })
    }
    
    // 删除属性
    const removeAttribute = (index) => {
      if (form.attributes.length > 1) {
        form.attributes.splice(index, 1)
      } else {
        ElMessage.warning(t('networkElement.atLeastOneAttribute'))
      }
    }
    
    // 分页大小改变
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }
    
    // 当前页改变
    const handleCurrentChange = (current) => {
      pagination.current = current
      loadData()
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      loading,
      dialogVisible,
      formRef,
      tableData,
      dialogTitle,
      pagination,
      searchForm,
      form,
      rules,
      loadData,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      resetForm,
      addAttribute,
      removeAttribute,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.network-element-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.attribute-list {
  padding: 10px 0;
}

.attribute-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.attribute-item:last-child {
  border-bottom: none;
}

.attribute-form-list {
  width: 100%;
}

.attribute-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>

