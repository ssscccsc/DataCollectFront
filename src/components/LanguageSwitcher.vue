<template>
  <el-dropdown @command="handleLanguageChange" trigger="click">
    <span class="language-switcher">
      <el-icon><Translation /></el-icon>
      <span>{{ currentLanguageText }}</span>
      <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          command="zh" 
          :class="{ 'is-active': currentLocale === 'zh' }"
        >
          <span>🇨🇳</span>
          <span>{{ $t('language.chinese') }}</span>
        </el-dropdown-item>
        <el-dropdown-item 
          command="en" 
          :class="{ 'is-active': currentLocale === 'en' }"
        >
          <span>🇺🇸</span>
          <span>{{ $t('language.english') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { Translation, ArrowDown } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',
  components: {
    Translation,
    ArrowDown,
  },
  setup() {
    const { locale, t } = useI18n()
    
    const currentLocale = computed(() => locale.value)
    
    const currentLanguageText = computed(() => {
      return currentLocale.value === 'zh' ? t('language.chinese') : t('language.english')
    })
    
    const handleLanguageChange = (lang) => {
      if (lang !== locale.value) {
        locale.value = lang
        localStorage.setItem('locale', lang)
        // 刷新页面以应用语言更改
        window.location.reload()
      }
    }
    
    return {
      currentLocale,
      currentLanguageText,
      handleLanguageChange,
    }
  },
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.language-switcher:hover {
  background-color: #f5f7fa;
}

.language-switcher .el-icon {
  margin: 0 4px;
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

