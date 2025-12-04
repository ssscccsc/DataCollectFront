<template>
  <div class="collect-data-upload-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.collectDataUpload') }}</h2>
    </div>
    
    <el-card>
      <div class="developing-container">
        <el-empty 
          description="功能开发中" 
          :image-size="200"
        >
          <template #image>
            <el-icon :size="200" color="#909399">
              <Tools />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Tools } from '@element-plus/icons-vue'

export default {
  name: 'CollectDataUpload',
  components: {
    Tools,
  },
}
</script>

<style scoped>
.collect-data-upload-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.developing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 0;
}
</style>

