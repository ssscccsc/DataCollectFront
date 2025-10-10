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
          <el-dropdown>
            <span class="user-info">
              {{ $t('system.admin') }} <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>{{ $t('system.personalInfo') }}</el-dropdown-item>
                <el-dropdown-item>{{ $t('system.logout') }}</el-dropdown-item>
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
import { Iphone } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'Layout',
  components: {
    LanguageSwitcher,
  },
  setup() {
    const route = useRoute()
    const { t } = useI18n()
    
    const currentPageTitle = computed(() => {
      const routeMap = {
        '/dashboard': t('pageTitle.dashboard'),
        '/collect-task/index': t('pageTitle.collectTask'),
        '/collect-strategy/index': t('pageTitle.collectStrategy'),
        '/test-case-set/index': t('pageTitle.testCaseSet'),
        '/logic-environment/index': t('pageTitle.logicEnvironment'),
        '/executor/index': t('pageTitle.executor'),
        '/ue/index': t('pageTitle.ue'),
        '/region/index': t('pageTitle.region'),
        '/network-type/index': t('pageTitle.networkType'),
      }
      return routeMap[route.path] || t('system.title')
    })

    return {
      currentPageTitle,
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
