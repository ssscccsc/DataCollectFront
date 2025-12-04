<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>{{ $t('system.title') }}</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>{{ $t('menu.dashboard') }}</span>
        </el-menu-item>
        
        <el-sub-menu index="app-monitor">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>{{ $t('menu.appMonitor') }}</span>
          </template>
          <el-menu-item index="/app-market-monitor/index">
            <el-icon><ShoppingBag /></el-icon>
            <span>{{ $t('menu.appMarketMonitor') }}</span>
          </el-menu-item>
          <el-menu-item index="/app-version-change/index">
            <el-icon><DocumentCopy /></el-icon>
            <span>{{ $t('menu.appVersionChange') }}</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="data-collect">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('menu.dataCollect') }}</span>
          </template>
          <el-menu-item index="/collect-task/index">
            <el-icon><List /></el-icon>
            <span>{{ $t('menu.collectTask') }}</span>
          </el-menu-item>
          <el-menu-item index="/collect-strategy/index">
            <el-icon><Operation /></el-icon>
            <span>{{ $t('menu.collectStrategy') }}</span>
          </el-menu-item>
          <el-menu-item index="/collect-data-upload/index">
            <el-icon><Upload /></el-icon>
            <span>{{ $t('menu.collectDataUpload') }}</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>{{ $t('menu.settings') }}</span>
          </template>
          <el-menu-item index="/test-case-set/index">
            <el-icon><Document /></el-icon>
            <span>{{ $t('menu.testCaseSet') }}</span>
          </el-menu-item>
          <el-menu-item index="/logic-environment/index">
            <el-icon><Setting /></el-icon>
            <span>{{ $t('menu.logicEnvironment') }}</span>
          </el-menu-item>
          <el-menu-item index="/executor/index">
            <el-icon><Monitor /></el-icon>
            <span>{{ $t('menu.executor') }}</span>
          </el-menu-item>
          <el-menu-item index="/ue/index">
            <el-icon><Iphone /></el-icon>
            <span>{{ $t('menu.ue') }}</span>
          </el-menu-item>
          <el-menu-item index="/region/index">
            <el-icon><Location /></el-icon>
            <span>{{ $t('menu.region') }}</span>
          </el-menu-item>
          <el-menu-item index="/network-type/index">
            <el-icon><Connection /></el-icon>
            <span>{{ $t('menu.networkType') }}</span>
          </el-menu-item>
          <el-menu-item index="/user/index">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="experience-test">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('menu.experienceTest') }}</span>
          </template>
          <el-menu-item index="/experience-test/client-data/index">
            <el-icon><DataBoard /></el-icon>
            <span>{{ $t('menu.clientData') }}</span>
          </el-menu-item>
          <el-menu-item index="/experience-test/network-data/index">
            <el-icon><Connection /></el-icon>
            <span>{{ $t('menu.networkData') }}</span>
          </el-menu-item>
          <el-menu-item index="/experience-test/data-comparison/index">
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('menu.dataComparison') }}</span>
          </el-menu-item>
          <el-menu-item index="/experience-test/network-settings/index">
            <el-icon><Setting /></el-icon>
            <span>{{ $t('menu.networkSettings') }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h3>{{ currentPageTitle }}</h3>
        </div>
        <div class="header-right">
          <LanguageSwitcher />
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ currentUsername }} <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { Iphone, DataBoard, Upload } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'Layout',
  components: {
    LanguageSwitcher,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    
    const currentPageTitle = computed(() => {
      const routeMap = {
        '/dashboard': t('pageTitle.dashboard'),
        '/app-market-monitor/index': t('pageTitle.appMarketMonitor'),
        '/app-version-change/index': t('pageTitle.appVersionChange'),
        '/collect-task/index': t('pageTitle.collectTask'),
        '/collect-strategy/index': t('pageTitle.collectStrategy'),
        '/collect-data-upload/index': t('pageTitle.collectDataUpload'),
        '/test-case-set/index': t('pageTitle.testCaseSet'),
        '/logic-environment/index': t('pageTitle.logicEnvironment'),
        '/executor/index': t('pageTitle.executor'),
        '/ue/index': t('pageTitle.ue'),
        '/region/index': t('pageTitle.region'),
        '/network-type/index': t('pageTitle.networkType'),
        '/user/index': '用户管理',
        '/experience-test/client-data/index': t('pageTitle.clientData'),
        '/experience-test/network-data/index': t('pageTitle.networkData'),
        '/experience-test/data-comparison/index': t('pageTitle.dataComparison'),
        '/experience-test/network-settings/index': t('pageTitle.networkSettings'),
      }
      return routeMap[route.path] || t('system.title')
    })
    
    const currentUsername = computed(() => {
      return localStorage.getItem('username') || '用户'
    })
    
    const handleCommand = (command) => {
      if (command === 'logout') {
        // 清除token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        localStorage.removeItem('lastActivityTime')
        ElMessage.success('退出登录成功')
        router.push('/login')
      }
    }

    return {
      currentPageTitle,
      currentUsername,
      handleCommand,
    }
  },
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: #bfcbd9;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
}

.logo h2 {
  font-size: 16px;
  margin: 0;
}

.sidebar-menu {
  border: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
