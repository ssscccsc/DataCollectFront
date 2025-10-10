<template>
  <div class="region-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.region') }}</h2>
      <p class="page-description">{{ $t('region.description') }}</p>
    </div>

    <el-card>
      <div class="table-operations">
        <el-button type="primary" @click="handleBatchAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('region.batchAddRegion') }}
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          {{ $t('region.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="regionName" :label="$t('region.region')" width="120" />
        <el-table-column prop="countryName" :label="$t('region.country')" width="150" />
        <el-table-column prop="provinceName" :label="$t('region.province')" width="120" />
        <el-table-column prop="cityName" :label="$t('region.city')" width="120" />
        <el-table-column prop="status" :label="$t('region.status')" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('region.enabled') : $t('region.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('region.operations')" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              {{ $t('region.edit') }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              {{ $t('region.delete') }}
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
          :hide-on-single-page="false"
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
        <el-form-item :label="$t('region.regionNameLabel')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('region.regionNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('region.levelLabel')" prop="level">
          <el-select v-model="form.level" :placeholder="$t('region.levelPlaceholder')" style="width: 100%">
            <el-option :label="$t('region.regionLevel')" :value="1" />
            <el-option :label="$t('region.countryLevel')" :value="2" />
            <el-option :label="$t('region.provinceLevel')" :value="3" />
            <el-option :label="$t('region.cityLevel')" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.parentRegionLabel')" prop="parentId" v-if="form.level > 1">
          <el-select v-model="form.parentId" :placeholder="$t('region.parentRegionPlaceholder')" style="width: 100%">
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.descriptionLabel')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('region.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('region.statusLabel')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('region.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('region.disabled') }}</el-radio>
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

    <!-- 批量录入地域对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="$t('region.batchAddRegionInfo')"
      width="600px"
      @close="resetBatchForm"
    >
      <el-form
        ref="batchFormRef"
        :model="batchForm"
        :rules="batchRules"
        label-width="120px"
      >
        <el-form-item :label="$t('region.regionNameLabel')" prop="regionName">
          <el-select
            v-model="batchForm.regionName"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('region.regionNamePlaceholder')"
            style="width: 100%"
            @change="handleRegionChange"
          >
            <el-option
              v-for="item in regionOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.countryNameLabel')" prop="countryName">
          <el-select
            v-model="batchForm.countryName"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('region.countryNamePlaceholder')"
            style="width: 100%"
            @change="handleCountryChange"
            :disabled="!batchForm.regionName"
          >
            <el-option
              v-for="item in filteredCountryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.provinceNameLabel')" prop="provinceName">
          <el-select
            v-model="batchForm.provinceName"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('region.provinceNamePlaceholder')"
            style="width: 100%"
            @change="handleProvinceChange"
            :disabled="!batchForm.countryName"
          >
            <el-option
              v-for="item in filteredProvinceOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.cityNameLabel')" prop="cityName">
          <el-select
            v-model="batchForm.cityName"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('region.cityNamePlaceholder')"
            style="width: 100%"
            @change="handleCityChange"
            :disabled="!batchForm.provinceName"
          >
            <el-option
              v-for="item in filteredCityOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('region.statusLabel')" prop="status">
          <el-radio-group v-model="batchForm.status">
            <el-radio :label="1">{{ $t('region.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('region.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleBatchSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

export default {
  name: 'Region',
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref()
    const parentOptions = ref([])
    
    // 批量录入相关
    const batchDialogVisible = ref(false)
    const batchFormRef = ref()
    const regionOptions = ref([])
    const countryOptions = ref([])
    const provinceOptions = ref([])
    const cityOptions = ref([])

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0,
    })

    const form = reactive({
      id: null,
      name: '',
      level: 1,
      parentId: null,
      description: '',
      status: 1,
    })

    const batchForm = reactive({
      regionName: '',
      countryName: '',
      provinceName: '',
      cityName: '',
      status: 1,
    })

    const rules = {
      name: [
        { required: true, message: t('region.regionNameRequired'), trigger: 'blur' },
      ],
      level: [
        { required: true, message: t('region.levelRequired'), trigger: 'change' },
      ],
    }

    const batchRules = {
      regionName: [
        { required: true, message: t('region.regionNameBatchRequired'), trigger: 'change' },
      ],
      countryName: [
        { required: true, message: t('region.countryNameRequired'), trigger: 'change' },
      ],
    }

    const getLevelType = (level) => {
      const typeMap = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'info',
      }
      return typeMap[level] || 'info'
    }

    const getLevelText = (level) => {
      const textMap = {
        1: t('region.regionLevel'),
        2: t('region.countryLevel'),
        3: t('region.provinceLevel'),
        4: t('region.cityLevel'),
      }
      return textMap[level] || t('common.unknown')
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          size: pagination.size,
        }
        const res = await request({
          url: '/region/hierarchy',
          method: 'get',
          params,
        })
        tableData.value = res.data.records || res.data
        pagination.total = res.data.total || res.data.length
      } catch (error) {
        console.error(t('region.loadDataFailed'), error)
      } finally {
        loading.value = false
      }
    }

    const loadParentOptions = async (level) => {
      if (level <= 1) return
      try {
        const res = await request({
          url: `/region/level/${level - 1}`,
          method: 'get',
        })
        parentOptions.value = res.data
      } catch (error) {
        console.error(t('region.loadParentRegionFailed'), error)
      }
    }

    // 加载所有选项数据
    const loadAllOptions = async () => {
      try {
        // 加载所有地域数据（包含层级关系）
        const allRegionsRes = await request({
          url: '/region/list',
          method: 'get'
        })
        const allRegions = allRegionsRes.data || []
        
        // 按层级分组
        regionOptions.value = allRegions.filter(item => item.level === 1)
        countryOptions.value = allRegions.filter(item => item.level === 2)
        provinceOptions.value = allRegions.filter(item => item.level === 3)
        cityOptions.value = allRegions.filter(item => item.level === 4)
      } catch (error) {
        console.error(t('region.loadOptionsDataFailed'), error)
      }
    }



    const handleAdd = () => {
      dialogTitle.value = t('region.addRegion')
      dialogVisible.value = true
      resetForm()
    }

    const handleBatchAdd = () => {
      batchDialogVisible.value = true
      resetBatchForm()
      loadAllOptions()
    }

    // 处理地域变化
    const handleRegionChange = (value) => {
      batchForm.regionName = value
      // 清空国家、省份、城市选择
      batchForm.countryName = ''
      batchForm.provinceName = ''
      batchForm.cityName = ''
    }

    // 处理国家变化
    const handleCountryChange = (value) => {
      batchForm.countryName = value
      // 清空省份和城市选择
      batchForm.provinceName = ''
      batchForm.cityName = ''
    }

    // 处理省份变化
    const handleProvinceChange = (value) => {
      batchForm.provinceName = value
      // 清空城市选择
      batchForm.cityName = ''
    }

    // 处理城市变化
    const handleCityChange = (value) => {
      batchForm.cityName = value
    }

    // 计算属性：过滤国家选项
    const filteredCountryOptions = computed(() => {
      if (!batchForm.regionName) return []
      
      // 找到选中的地域
      const selectedRegion = regionOptions.value.find(item => item.name === batchForm.regionName)
      if (!selectedRegion) return countryOptions.value
      
      // 返回属于该地域的国家
      return countryOptions.value.filter(item => item.parentId === selectedRegion.id)
    })

    // 计算属性：过滤省份选项
    const filteredProvinceOptions = computed(() => {
      if (!batchForm.countryName) return []
      
      // 找到选中的国家
      const selectedCountry = countryOptions.value.find(item => item.name === batchForm.countryName)
      if (!selectedCountry) return provinceOptions.value
      
      // 返回属于该国家的省份
      return provinceOptions.value.filter(item => item.parentId === selectedCountry.id)
    })

    // 计算属性：过滤城市选项
    const filteredCityOptions = computed(() => {
      if (!batchForm.provinceName) return []
      
      // 找到选中的省份
      const selectedProvince = provinceOptions.value.find(item => item.name === batchForm.provinceName)
      if (!selectedProvince) return cityOptions.value
      
      // 返回属于该省份的城市
      return cityOptions.value.filter(item => item.parentId === selectedProvince.id)
    })

    const handleEdit = (row) => {
      dialogTitle.value = t('region.editRegion')
      Object.assign(form, row)
      dialogVisible.value = true
      loadParentOptions(form.level)
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(t('region.deleteConfirm'), t('common.info'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        
        await request({
          url: `/region/${row.id}`,
          method: 'delete',
        })
        ElMessage.success(t('region.deleteSuccess'))
        loadData()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(t('region.deleteFailed'))
        }
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        if (form.id) {
          await request({
            url: `/region/${form.id}`,
            method: 'put',
            data: form,
          })
          ElMessage.success(t('region.updateSuccess'))
        } else {
          await request({
            url: '/region',
            method: 'post',
            data: form,
          })
          ElMessage.success(t('region.createSuccess'))
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('region.submitFailed'), error)
      }
    }

    const handleBatchSubmit = async () => {
      try {
        await batchFormRef.value.validate()
        
        await request({
          url: '/region/batch',
          method: 'post',
          data: batchForm,
        })
        ElMessage.success(t('region.batchCreateSuccess'))
        batchDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(t('region.batchSubmitFailed'), error)
        ElMessage.error(t('region.batchCreateFailed'))
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id: null,
        name: '',
        level: 1,
        parentId: null,
        description: '',
        status: 1,
      })
      parentOptions.value = []
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    const resetBatchForm = () => {
      Object.assign(batchForm, {
        regionName: '',
        countryName: '',
        provinceName: '',
        cityName: '',
        status: 1,
      })
      regionOptions.value = []
      countryOptions.value = []
      provinceOptions.value = []
      cityOptions.value = []
      if (batchFormRef.value) {
        batchFormRef.value.resetFields()
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
      batchDialogVisible,
      batchFormRef,
      batchForm,
      batchRules,
      regionOptions,
      countryOptions,
      provinceOptions,
      cityOptions,
      filteredCountryOptions,
      filteredProvinceOptions,
      filteredCityOptions,
      loadData,
      handleBatchAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      handleBatchSubmit,
      resetForm,
      resetBatchForm,
      handleSizeChange,
      handleCurrentChange,
      getLevelType,
      getLevelText,
      loadAllOptions,
      handleRegionChange,
      handleCountryChange,
      handleProvinceChange,
      handleCityChange,
    }
  },
}
</script>

<style scoped>
.region-page {
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
