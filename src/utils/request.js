import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5分钟超时，支持大文件上传
})

// 用户活跃时间管理
const ACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1小时（毫秒）
let lastActivityTime = null
let activityCheckTimer = null

// 更新最后活跃时间
function updateLastActivityTime() {
  lastActivityTime = Date.now()
  localStorage.setItem('lastActivityTime', lastActivityTime.toString())
}

// 检查用户是否活跃
function checkUserActivity() {
  const token = localStorage.getItem('token')
  if (!token) {
    return
  }
  
  const savedTime = localStorage.getItem('lastActivityTime')
  if (!savedTime) {
    updateLastActivityTime()
    return
  }
  
  const inactiveTime = Date.now() - parseInt(savedTime)
  if (inactiveTime > ACTIVITY_TIMEOUT) {
    // 超过1小时无操作，自动退出
    ElMessage.warning('您已超过1小时未操作，系统已自动退出登录')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('lastActivityTime')
    
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    
    // 清除定时器
    if (activityCheckTimer) {
      clearInterval(activityCheckTimer)
      activityCheckTimer = null
    }
  }
}

// 启动活跃时间检查
function startActivityCheck() {
  // 清除已有定时器
  if (activityCheckTimer) {
    clearInterval(activityCheckTimer)
  }
  
  // 初始化最后活跃时间
  const savedTime = localStorage.getItem('lastActivityTime')
  if (savedTime) {
    lastActivityTime = parseInt(savedTime)
  } else {
    updateLastActivityTime()
  }
  
  // 每30秒检查一次
  activityCheckTimer = setInterval(() => {
    checkUserActivity()
  }, 30 * 1000)
}

// 停止活跃时间检查
function stopActivityCheck() {
  if (activityCheckTimer) {
    clearInterval(activityCheckTimer)
    activityCheckTimer = null
  }
  localStorage.removeItem('lastActivityTime')
}

// 监听用户操作事件
const userActivityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
userActivityEvents.forEach(event => {
  document.addEventListener(event, updateLastActivityTime, true)
})

// 页面加载时启动检查
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token')
  if (token) {
    startActivityCheck()
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token并添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // 更新最后活跃时间
      updateLastActivityTime()
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000,
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    console.log('err' + error)
    
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('lastActivityTime')
      
      // 停止活跃时间检查
      stopActivityCheck()
      
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    ElMessage({
      message: error.response?.data?.message || error.message || '网络错误',
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  }
)

// 导出活跃时间管理函数，供外部使用
export { startActivityCheck, stopActivityCheck, updateLastActivityTime }

export default service
