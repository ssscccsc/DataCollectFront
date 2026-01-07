<template>
  <div class="network-element-page">
    <div class="page-header">
      <h2 class="page-title">网元管理</h2>
      <p class="page-description">管理系统网元及其属性配置</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增网元
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <div class="search-box">
          <el-input
            v-model="searchForm.name"
            placeholder="搜索网元名称"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter="loadData"
          />
          <el-button type="primary" @click="loadData">搜索</el-button>
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
              <el-empty v-else description="暂无属性" :image-size="50" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.name" label="网元" />
        <el-table-column label="属性数量">
          <template #default="{ row }">
            <el-tag>{{ row.attributes ? row.attributes.length : 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.networkElement.status === 1 ? 'success' : 'danger'">
              {{ row.networkElement.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="networkElement.createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
        <el-form-item label="网元名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入网元名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="属性配置">
          <div class="attribute-form-list">
            <div 
              v-for="(attr, index) in form.attributes" 
              :key="index"
              class="attribute-form-item"
            >
              <el-input
                v-model="attr.attributeName"
                placeholder="属性名称"
                style="width: 150px; margin-right: 10px;"
              />
              <el-input
                v-model="attr.attributeValue"
                placeholder="属性取值"
                style="flex: 1; margin-right: 10px;"
              />
              <el-button 
                type="danger" 
                size="small"
                @click="removeAttribute(index)"
              >
                删除
              </el-button>
            </div>
            <el-button 
              type="primary" 
              size="small"
              @click="addAttribute"
              style="margin-top: 10px;"
            >
              添加属性
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

export default {
  name: 'NetworkElement',
  components: {
    Plus,
    Refresh,
  },
  setup() {
    const loading = ref(false)
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const tableData = ref([])
    const currentId = ref(null)
    
    const dialogTitle = computed(() => {
      return currentId.value === null ? '新增网元' : '编辑网元'
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
        { required: true, message: '请输入网元名称', trigger: 'blur' },
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
          ElMessage.error(response.msg || '加载数据失败')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
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
          ElMessage.error(response.msg || '加载数据失败')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
      }
    }
    
    // 删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除网元"${row.networkElement.name}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          const response = await request.delete(`/network-element/${row.networkElement.id}`)
          if (response.code === 200) {
            ElMessage.success('删除成功')
            loadData()
          } else {
            ElMessage.error(response.msg || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
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
              ElMessage.success(currentId.value === null ? '新增成功' : '更新成功')
              dialogVisible.value = false
              loadData()
            } else {
              ElMessage.error(response.msg || '操作失败')
            }
          } catch (error) {
            console.error('操作失败:', error)
            ElMessage.error('操作失败')
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
        ElMessage.warning('至少保留一个属性')
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

