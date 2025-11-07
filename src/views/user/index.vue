<template>
  <div class="user-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <p class="page-description">管理系统用户，只有管理员可以新增用户</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button 
          v-if="isAdmin" 
          type="primary" 
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <div class="search-box">
          <el-input
            v-model="searchForm.username"
            placeholder="搜索用户名"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter="loadData"
          />
          <el-select
            v-model="searchForm.role"
            placeholder="选择角色"
            style="width: 150px; margin-right: 10px;"
            clearable
          >
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else type="info">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              v-if="isAdmin" 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="handleChangePassword(scope.row)"
            >
              修改密码
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
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            :disabled="form.id !== null"
          />
        </el-form-item>
        <el-form-item v-if="form.id === null" label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item v-if="!isAdmin" label="旧密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

export default {
  name: 'User',
  setup() {
    const loading = ref(false)
    const dialogVisible = ref(false)
    const passwordDialogVisible = ref(false)
    const formRef = ref(null)
    const passwordFormRef = ref(null)
    const tableData = ref([])
    const currentUserId = ref(null)
    
    const isAdmin = computed(() => {
      return localStorage.getItem('role') === 'admin'
    })
    
    const dialogTitle = computed(() => {
      return currentUserId.value === null ? '新增用户' : '编辑用户'
    })
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })
    
    const searchForm = reactive({
      username: '',
      role: '',
    })
    
    const form = reactive({
      id: null,
      username: '',
      password: '',
      role: 'user',
      status: 1,
    })
    
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' },
      ],
    }
    
    const passwordRules = {
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
    }
    
    const loadData = async () => {
      loading.value = true
      try {
        const response = await request.get('/user/page', {
          params: {
            current: pagination.current,
            size: pagination.size,
            username: searchForm.username || undefined,
            role: searchForm.role || undefined,
          },
        })
        
        if (response.code === 200 && response.data) {
          tableData.value = response.data.records
          pagination.total = response.data.total
        }
      } catch (error) {
        ElMessage.error('加载用户列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleAdd = () => {
      if (!isAdmin.value) {
        ElMessage.warning('只有管理员可以新增用户')
        return
      }
      currentUserId.value = null
      resetForm()
      dialogVisible.value = true
    }
    
    const handleEdit = (row) => {
      currentUserId.value = row.id
      Object.assign(form, {
        id: row.id,
        username: row.username,
        password: '',
        role: row.role,
        status: row.status,
      })
      dialogVisible.value = true
    }
    
    const handleDelete = async (row) => {
      if (!isAdmin.value) {
        ElMessage.warning('只有管理员可以删除用户')
        return
      }
      
      try {
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
          type: 'warning',
        })
        
        const response = await request.delete(`/user/${row.id}`)
        if (response.code === 200) {
          ElMessage.success('删除成功')
          loadData()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const handleChangePassword = (row) => {
      currentUserId.value = row.id
      resetPasswordForm()
      passwordDialogVisible.value = true
    }
    
    const handleSubmit = async () => {
      if (!formRef.value) {
        return
      }
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            let response
            if (currentUserId.value === null) {
              // 新增
              response = await request.post('/user', {
                username: form.username,
                password: form.password,
                role: form.role,
              })
            } else {
              // 编辑
              response = await request.put(`/user/${currentUserId.value}`, {
                role: form.role,
                status: form.status,
              })
            }
            
            if (response.code === 200) {
              ElMessage.success(currentUserId.value === null ? '新增成功' : '更新成功')
              dialogVisible.value = false
              loadData()
            }
          } catch (error) {
            ElMessage.error(error.message || '操作失败')
          }
        }
      })
    }
    
    const handlePasswordSubmit = async () => {
      if (!passwordFormRef.value) {
        return
      }
      
      await passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const response = await request.post(`/user/${currentUserId.value}/password`, {
              newPassword: passwordForm.newPassword,
            })
            
            if (response.code === 200) {
              ElMessage.success('修改密码成功')
              passwordDialogVisible.value = false
            }
          } catch (error) {
            ElMessage.error(error.message || '修改密码失败')
          }
        }
      })
    }
    
    const resetForm = () => {
      Object.assign(form, {
        id: null,
        username: '',
        password: '',
        role: 'user',
        status: 1,
      })
      currentUserId.value = null
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }
    
    const resetPasswordForm = () => {
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      if (passwordFormRef.value) {
        passwordFormRef.value.resetFields()
      }
    }
    
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }
    
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
      passwordDialogVisible,
      formRef,
      passwordFormRef,
      tableData,
      isAdmin,
      dialogTitle,
      pagination,
      searchForm,
      form,
      passwordForm,
      rules,
      passwordRules,
      loadData,
      handleAdd,
      handleEdit,
      handleDelete,
      handleChangePassword,
      handleSubmit,
      handlePasswordSubmit,
      resetForm,
      resetPasswordForm,
      handleSizeChange,
      handleCurrentChange,
    }
  },
}
</script>

<style scoped>
.user-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.page-description {
  margin: 0;
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
</style>

