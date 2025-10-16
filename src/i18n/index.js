import { createI18n } from 'vue-i18n'
import zh from '@/locales/zh.js'
import en from '@/locales/en.js'

// 从本地存储获取语言设置，默认为中文
const getDefaultLocale = () => {
  const savedLocale = localStorage.getItem('locale')
  return savedLocale || 'zh'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh',
  messages: {
    zh,
    en,
  },
})

export default i18n










