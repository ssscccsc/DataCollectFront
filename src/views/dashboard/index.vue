<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">{{ $t('pageTitle.dashboard') }}</h2>
      <p class="page-description">{{ $t('dashboard.description') }}</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.regionCount }}</div>
              <div class="stat-label">{{ $t('dashboard.regionCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.executorCount }}</div>
              <div class="stat-label">{{ $t('dashboard.executorCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Mobile /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.ueCount }}</div>
              <div class="stat-label">{{ $t('dashboard.ueCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.taskCount }}</div>
              <div class="stat-label">{{ $t('dashboard.taskCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ $t('dashboard.recentTasks') }}</span>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="name" :label="$t('dashboard.taskName')" />
            <el-table-column prop="status" :label="$t('dashboard.status')">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('dashboard.createTime')" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ $t('dashboard.systemInfo') }}</span>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="label">{{ $t('dashboard.systemVersion') }}：</span>
              <span class="value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.uptime') }}：</span>
              <span class="value">{{ uptime }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.dbStatus') }}：</span>
              <span class="value">
                <el-tag type="success">{{ $t('dashboard.normal') }}</el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.apiStatus') }}：</span>
              <span class="value">
                <el-tag type="success">{{ $t('dashboard.normal') }}</el-tag>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Dashboard',
  setup() {
    const { t } = useI18n()
    
    const stats = ref({
      regionCount: 0,
      executorCount: 0,
      ueCount: 0,
      taskCount: 0,
    })
    
    const recentTasks = ref([])
    const uptime = ref('0天 0小时 0分钟')

    const getStatusType = (status) => {
      const statusMap = {
        0: 'info',
        1: 'success',
        2: 'warning',
      }
      return statusMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const statusMap = {
        0: t('dashboard.statusStopped'),
        1: t('dashboard.statusRunning'),
        2: t('dashboard.statusPaused'),
      }
      return statusMap[status] || t('dashboard.statusBlocked')
    }

    const loadStats = () => {
      // 这里应该调用API获取统计数据
      stats.value = {
        regionCount: 5,
        executorCount: 4,
        ueCount: 4,
        taskCount: 3,
      }
    }

    const loadRecentTasks = () => {
      // 这里应该调用API获取最近任务
      recentTasks.value = [
        {
          name: '北京Android性能监控任务',
          status: 1,
          createTime: '2024-01-15 10:30:00',
        },
        {
          name: '北京iOS日志采集任务',
          status: 0,
          createTime: '2024-01-15 09:15:00',
        },
        {
          name: '上海Android网络监控任务',
          status: 2,
          createTime: '2024-01-15 08:45:00',
        },
      ]
    }

    onMounted(() => {
      loadStats()
      loadRecentTasks()
    })

    return {
      stats,
      recentTasks,
      uptime,
      getStatusType,
      getStatusText,
    }
  },
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  font-size: 48px;
  color: #409EFF;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}

.system-info {
  padding: 10px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #606266;
}

.value {
  color: #303133;
}
</style>
