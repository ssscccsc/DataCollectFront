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
      <el-col :span="24">
        <el-card>
          <template #header>
            <el-tabs v-model="activeMapTab" @tab-change="handleMapTabChange">
              <el-tab-pane :label="$t('dashboard.chinaMap')" name="china">
                <template #label>
                  <span>{{ $t('dashboard.chinaMap') }}</span>
                </template>
              </el-tab-pane>
              <el-tab-pane :label="$t('dashboard.worldMap')" name="world" disabled>
                <template #label>
                  <span class="disabled-tab">{{ $t('dashboard.worldMap') }}</span>
                </template>
              </el-tab-pane>
            </el-tabs>
          </template>
          <div id="world-map" style="width: 100%; height: 500px;"></div>
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
              <span class="label">{{ $t('dashboard.systemVersion') }}�?/span>
              <span class="value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.uptime') }}�?/span>
              <span class="value">{{ uptime }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.dbStatus') }}�?/span>
              <span class="value">
                <el-tag type="success">{{ $t('dashboard.normal') }}</el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('dashboard.apiStatus') }}�?/span>
              <span class="value">
                <el-tag type="success">{{ $t('dashboard.normal') }}</el-tag>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地域统计信息对话�?-->
    <el-dialog
      v-model="regionStatsDialogVisible"
      :title="regionStatsDialogTitle"
      width="600px"
    >
      <div class="region-stats-content">
        <!-- 汇总统�?-->
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('dashboard.appCount') }}�?/span>
            <span class="stat-value">{{ regionStats.appCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('dashboard.totalCollectCount') }}�?/span>
            <span class="stat-value">{{ regionStats.collectCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('dashboard.executorCount') }}�?/span>
            <span class="stat-value">{{ regionStats.executorCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('dashboard.ueCount') }}�?/span>
            <span class="stat-value">{{ regionStats.ueCount || 0 }}</span>
          </div>
        </div>
        
        <!-- APP详细信息列表 -->
        <div class="app-list-section" v-if="regionStats.appList && regionStats.appList.length > 0">
          <div class="section-title">{{ $t('dashboard.appDetails') }}</div>
          <el-table :data="regionStats.appList" stripe style="width: 100%">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column prop="appName" :label="$t('dashboard.appName')" min-width="200">
              <template #default="scope">
                <span>{{ scope.row.appName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="collectCount" :label="$t('dashboard.collectCount')" width="150" align="right">
              <template #default="scope">
                <span class="collect-count-value">{{ scope.row.collectCount || 0 }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="empty-tip" v-else-if="regionStats.executorCount === 0">
          <el-empty :description="$t('dashboard.noExecutor')" :image-size="80" />
        </div>
        
        <div class="empty-tip" v-else>
          <el-empty :description="$t('dashboard.noAppData')" :image-size="80" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import request from '@/utils/request'

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
    const uptime = ref('0�?0小时 0分钟')
    
    // 地图相关
    let worldMapChart = null
    const activeMapTab = ref('china') // 默认显示中国地图
    const regionStatsDialogVisible = ref(false)
    const regionStatsDialogTitle = ref('')
    const regionStats = ref({
      appCount: 0,
      collectCount: 0,
      executorCount: 0,
      ueCount: 0,
      appList: [],
    })
    
    // 城市名称到经纬度的映射（简化版，包含常见城市）
    const cityCoordinates = {
      '北京': [116.4074, 39.9042],
      '上海': [121.4737, 31.2304],
      '广州': [113.2644, 23.1291],
      '深圳': [114.0579, 22.5431],
      '杭州': [120.1551, 30.2741],
      '南京': [118.7969, 32.0603],
      '武汉': [114.3162, 30.5810],
      '成都': [104.0668, 30.5728],
      '西安': [108.9398, 34.3416],
      '重庆': [106.5516, 29.5630],
      '天津': [117.2008, 39.0842],
      '苏州': [120.5853, 31.2989],
      '青岛': [120.3826, 36.0671],
      '大连': [121.6147, 38.9140],
      '厦门': [118.1689, 24.4798],
      '长沙': [112.9388, 28.2282],
      '郑州': [113.6254, 34.7466],
      '沈阳': [123.4315, 41.8057],
      '哈尔�?: [126.5358, 45.8021],
      '昆明': [102.7146, 25.0492],
      '太原': [112.5489, 37.8570],
      '石家�?: [114.5149, 38.0428],
      '济南': [117.1210, 36.6512],
      '南昌': [115.8921, 28.6765],
      '合肥': [117.2838, 31.8612],
      '福州': [119.2965, 26.0745],
      '南宁': [108.3669, 22.8170],
      '海口': [110.3308, 20.0221],
      '贵阳': [106.6302, 26.6477],
      '乌鲁木齐': [87.6168, 43.8256],
      '银川': [106.2309, 38.4872],
      '西宁': [101.7782, 36.6171],
      '拉萨': [91.1145, 29.6441],
    }
    
    // 国家名称到经纬度的映射（使用国家中心点）
    const countryCoordinates = {
      '中国': [104.0668, 35.8676],
      '美国': [-95.7129, 37.0902],
      '日本': [138.2529, 36.2048],
      '韩国': [127.7669, 35.9078],
      '英国': [-3.4360, 55.3781],
      '法国': [2.2137, 46.2276],
      '德国': [10.4515, 51.1657],
      '意大�?: [12.5674, 41.8719],
      '俄罗�?: [105.3188, 61.5240],
      '印度': [78.9629, 20.5937],
      '加拿�?: [-106.3468, 56.1304],
      '澳大利亚': [133.7751, -25.2744],
      '巴西': [-51.9253, -14.2350],
    }

    const getStatusType = (status) => {
      const statusMap = {
        'RUNNING': 'success',
        'COMPLETED': 'success',
        'STOPPED': 'info',
        'PAUSED': 'warning',
        'FAILED': 'danger',
        'PENDING': 'info',
      }
      return statusMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'RUNNING': t('dashboard.statusRunning'),
        'COMPLETED': t('dashboard.statusCompleted'),
        'STOPPED': t('dashboard.statusStopped'),
        'PAUSED': t('dashboard.statusPaused'),
        'FAILED': t('dashboard.statusFailed'),
        'PENDING': t('dashboard.statusPending'),
      }
      return statusMap[status] || t('dashboard.statusUnknown')
    }

    const loadStats = async () => {
      try {
        const res = await request({
          url: '/dashboard/stats',
          method: 'get',
        })
        if (res.data) {
          stats.value = {
            regionCount: res.data.regionCount || 0,
            executorCount: res.data.executorCount || 0,
            ueCount: res.data.ueCount || 0,
            taskCount: res.data.taskCount || 0,
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 如果加载失败，保持默认�?
      stats.value = {
          regionCount: 0,
          executorCount: 0,
          ueCount: 0,
          taskCount: 0,
        }
      }
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) {
        return ''
      }
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const loadRecentTasks = async () => {
      try {
        const res = await request({
          url: '/collect-task/page',
          method: 'get',
          params: {
            current: 1,
            size: 10,
          },
        })
        if (res.data && res.data.records) {
          recentTasks.value = res.data.records.map(task => ({
            name: task.name,
            status: task.status,
            createTime: formatDateTime(task.createTime),
          }))
        }
      } catch (error) {
        console.error('加载最近任务失�?', error)
        recentTasks.value = []
      }
    }

    // 获取城市和国家坐�?    const getCoordinates = (regionName, level) => {
      if (level === 4) {
        // 城市级别
        return cityCoordinates[regionName] || null
      } else if (level === 2) {
        // 国家级别
        return countryCoordinates[regionName] || null
      }
      return null
    }

    // 加载地域数据并在地图上标�?    const loadRegionData = async () => {
      try {
        // 获取所有城市（level=4�?        const cityRes = await request({
          url: '/region/level/4',
          method: 'get',
        })
        const cities = cityRes.data || []
        
        // 获取所有国家（level=2�?        const countryRes = await request({
          url: '/region/level/2',
          method: 'get',
        })
        const countries = countryRes.data || []

        
        // 获取所有省份（level=3，用于中国地图高亮）
        let provinceMapData = []
        if (activeMapTab.value === 'china') {
          try {
            const provinceRes = await request({
              url: '/region/level/3',
              method: 'get',
            })
            const provinces = provinceRes.data || []
            // 将省份数据转换为 ECharts map 系列需要的格式
            provinceMapData = provinces
              .filter(province => province.deleted === 0 && province.status === 1)
              .map(province => ({
                name: province.name,
                value: 1, // 用于高亮显示
              }))
          } catch (error) {
            console.warn('获取省份数据失败:', error)
            provinceMapData = []
          }
        }
        
        
        // 准备地图数据�?        const data = []
        
        // 添加城市标记
        cities.forEach(city => {
          if (city.deleted === 0 && city.status === 1) {
            const coords = getCoordinates(city.name, 4)
            if (coords) {
              data.push({
                name: city.name,
                value: coords,
                regionId: city.id,
                level: 4,
              })
            }
          }
        })
        
        // 添加国家标记
        countries.forEach(country => {
          if (country.deleted === 0 && country.status === 1) {
            const coords = getCoordinates(country.name, 2)
            if (coords) {
              data.push({
                name: country.name,
                value: coords,
                regionId: country.id,
                level: 2,
              })
            }
          }
        })
        
        // 更新地图
        if (worldMapChart) {
          // 检查是否有地图数据（features数组不为空）
          const hasMapData = worldMapChart._mapDataLoaded || false
          
          const option = {
            tooltip: {
              trigger: 'item',
              formatter: (params) => {
                if (params.data) {
                  return `${params.data.name}`
                }
                return params.name || ''
              },
            },
            backgroundColor: '#fafafa',
            geo: hasMapData ? {
              map: activeMapTab.value === 'china' ? 'china' : 'world',
              roam: true,
              zoom: activeMapTab.value === 'china' ? 1.5 : 1.2,
              center: activeMapTab.value === 'china' ? [104.0, 35.0] : [105, 36],
              label: {
                show: false,
                emphasis: {
                  show: true,
                },
              },
              itemStyle: {
                areaColor: '#e7e7e7',
                borderColor: '#d0d0d0',
                borderWidth: 0.5,
              },
              emphasis: {
                itemStyle: {
                  areaColor: '#d0d0d0',
                },
                label: {
                  show: true,
                },
              },
            } : {
              show: false,
            },
            series: [
              // 省份高亮系列（仅在中国地图时显示）
              ...(hasMapData && activeMapTab.value === 'china' && provinceMapData && provinceMapData.length > 0 ? [{
                name: '省份',
                type: 'map',
                map: 'china',
                geoIndex: 0,
                data: provinceMapData,
                itemStyle: {
                  areaColor: '#a0d8ef', // 浅蓝色高亮
                  borderColor: '#409EFF',
                  borderWidth: 1.5,
                },
                emphasis: {
                  itemStyle: {
                    areaColor: '#66b1ff', // 更深的蓝色
                    borderColor: '#409EFF',
                    borderWidth: 2,
                  },
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333',
                  },
                },
                label: {
                  show: false,
                },
                silent: true, // 不响应鼠标事件，避免与散点图冲突
              }] : []),
              // 城市和国家标记散点图
              {
                name: '地域',
                type: 'scatter',
                coordinateSystem: hasMapData ? 'geo' : null,
                data: data,
                symbolSize: 12,
                label: {
                  show: true,
                  position: 'right',
                  formatter: (params) => {
                    return params.data.name
                  },
                  fontSize: 12,
                  color: '#333',
                },
                itemStyle: {
                  color: '#409EFF',
                },
                emphasis: {
                  itemStyle: {
                    color: '#66b1ff',
                    borderColor: '#409EFF',
                    borderWidth: 2,
                    shadowBlur: 10,
                    shadowColor: 'rgba(64, 158, 255, 0.5)',
                  },
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                  },
                },
                z: 10, // 确保散点图在省份高亮之上
              },
            ],
          }
          
          // 如果没有地图数据，使用地理坐标系作为备用方案
          if (!hasMapData) {
            option.xAxis = {
              type: 'value',
              show: false,
            }
            option.yAxis = {
              type: 'value',
              show: false,
            }
            // 转换地理坐标为屏幕坐�?            option.series[0].data = data.map(item => {
              // 简单的坐标转换：将经纬度转换为适合显示的坐�?              const lng = item.value[0]
              const lat = item.value[1]
              // 墨卡托投影简化版�?              const x = (lng + 180) / 360
              const y = (90 - lat) / 180
              return {
                ...item,
                value: [x, y],
                originalCoords: item.value,
              }
            })
            option.series[0].coordinateSystem = null
          }
          
          worldMapChart.setOption(option, true)
          
          // 存储数据以便在事件中访问
          worldMapChart._regionData = data
          
          // 使用echarts的点击事件，检测双�?          let lastClickTime = 0
          let lastClickData = null
          
          worldMapChart.on('click', (params) => {
            const now = Date.now()
            if (params.data && params.data.regionId) {
              // 检查是否是双击�?00ms内连续点击相同数据点�?              if (now - lastClickTime < 300 && 
                  lastClickData && 
                  lastClickData.regionId === params.data.regionId) {
                // 这是双击
                handleRegionDoubleClick(
                  params.data.regionId,
                  params.data.name,
                  params.data.level
                )
                lastClickTime = 0
                lastClickData = null
              } else {
                // 这是第一次点�?                lastClickTime = now
                lastClickData = params.data
              }
            }
          })
        }
      } catch (error) {
        console.error('加载地域数据失败:', error)
      }
    }

    // 处理地域双击事件
    const handleRegionDoubleClick = async (regionId, regionName, level) => {
      try {
        const res = await request({
          url: '/dashboard/region-stats',
          method: 'get',
          params: {
            regionId: regionId,
          },
        })
        if (res.data) {
          console.log('地域统计数据:', res.data)
          regionStats.value = {
            appCount: res.data.appCount || 0,
            collectCount: res.data.collectCount || 0,
            executorCount: res.data.executorCount || 0,
            ueCount: res.data.ueCount || 0,
            appList: res.data.appList || [],
          }
          console.log('处理后的统计数据:', regionStats.value)
          regionStatsDialogTitle.value = `${regionName} - ${level === 4 ? t('dashboard.city') : t('dashboard.country')}`
          regionStatsDialogVisible.value = true
        } else {
          console.warn('地域统计数据为空')
        }
      } catch (error) {
        console.error('获取地域统计信息失败:', error)
      }
    }

    // 加载中国地图数据
    const loadChinaMapData = async () => {
      try {
        // 从本地public目录加载中国地图JSON数据
        const response = await fetch('/china.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const chinaMapData = await response.json()
        
        // 检查数据是否有效（features数组不为空）
        if (chinaMapData && chinaMapData.features && chinaMapData.features.length > 0) {
          echarts.registerMap('china', chinaMapData)
          worldMapChart._mapDataLoaded = true
          console.log('中国地图数据加载成功，包含', chinaMapData.features.length, '个省/市/区')
          return true
        } else {
          throw new Error('地图数据为空')
        }
      } catch (error) {
        console.warn('加载中国地图数据失败，将使用散点图模式显示:', error)
        console.warn('提示：请将中国地图JSON文件保存到 public/china.json')
        // 如果本地加载失败，使用一个基本的中国地图结构
        echarts.registerMap('china', {
          type: 'FeatureCollection',
          features: [],
        })
        if (worldMapChart) {
          worldMapChart._mapDataLoaded = false
        }
        return false
      }
    }

    // 加载世界地图数据
    const loadWorldMapData = async () => {
      try {
        // 从本地public目录加载世界地图JSON数据
        const response = await fetch('/world.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const worldMapData = await response.json()
        
        // 检查数据是否有效（features数组不为空）
        if (worldMapData && worldMapData.features && worldMapData.features.length > 0) {
          echarts.registerMap('world', worldMapData)
          worldMapChart._mapDataLoaded = true
          console.log('世界地图数据加载成功，包�?, worldMapData.features.length, '个国�?地区')
          return true
        } else {
          throw new Error('地图数据为空')
        }
      } catch (error) {
        console.warn('加载世界地图数据失败，将使用散点图模式显�?', error)
        console.warn('提示：请将世界地图JSON文件保存�?public/world.json，参�?public/世界地图数据下载说明.md')
        // 如果本地加载失败，使用一个基本的世界地图结构
        echarts.registerMap('world', {
          type: 'FeatureCollection',
          features: [],
        })
        if (worldMapChart) {
          worldMapChart._mapDataLoaded = false
        }
        return false
      }
    }

    // 初始化地�?    const initWorldMap = async () => {
      await nextTick()
      const mapDom = document.getElementById('world-map')
      if (mapDom) {
        worldMapChart = echarts.init(mapDom)
        
        // 初始化地图数据加载标�?        worldMapChart._mapDataLoaded = false
        
        // 根据当前标签页加载对应的地图数据
        if (activeMapTab.value === 'china') {
          await loadChinaMapData()
        } else {
          await loadWorldMapData()
        }
        
        // 加载地域数据
        await loadRegionData()
        
        // 响应式调�?        window.addEventListener('resize', () => {
          if (worldMapChart) {
            worldMapChart.resize()
          }
        })
      }
    }

    onMounted(async () => {
      await loadStats()
      await loadRecentTasks()
      await initWorldMap()
    })

    return {
      stats,
      recentTasks,
      uptime,
      getStatusType,
      getStatusText,
      activeMapTab,
      handleMapTabChange,
      regionStatsDialogVisible,
      regionStatsDialogTitle,
      regionStats,
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

#world-map {
  min-height: 500px;
}

.region-stats-content {
  padding: 20px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.summary-stats {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.app-list-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.collect-count-value {
  font-weight: 600;
  color: #409EFF;
}

.empty-tip {
  margin-top: 20px;
  text-align: center;
}

.disabled-tab {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>

