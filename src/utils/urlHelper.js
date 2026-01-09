/**
 * URL工具函数
 * 用于处理gohttpserver URL的IP替换
 */

/**
 * 根据当前页面访问IP替换URL中的IP地址
 * @param {string} url 原始URL
 * @returns {string} 替换后的URL
 */
export function replaceUrlHost(url) {
  if (!url) {
    return url
  }
  
  try {
    const urlObj = new URL(url)
    const currentHost = window.location.hostname
    const currentPort = window.location.port
    
    // 如果当前页面有端口，且URL也有端口，保持URL的端口
    // 如果当前页面没有端口，使用URL的端口
    let newPort = urlObj.port
    if (currentPort && urlObj.port) {
      // 保持原URL的端口
      newPort = urlObj.port
    } else if (urlObj.port) {
      // URL有端口，使用URL的端口
      newPort = urlObj.port
    }
    
    // 构建新URL
    const protocol = urlObj.protocol
    const pathname = urlObj.pathname
    const search = urlObj.search
    const hash = urlObj.hash
    
    if (newPort) {
      return `${protocol}//${currentHost}:${newPort}${pathname}${search}${hash}`
    } else {
      return `${protocol}//${currentHost}${pathname}${search}${hash}`
    }
  } catch (e) {
    console.error('URL替换失败:', e)
    return url
  }
}

/**
 * 获取URL的简短显示（用于显示）
 * @param {string} url 原始URL
 * @returns {string} 简短URL
 */
export function getShortUrl(url) {
  if (!url) {
    return ''
  }
  try {
    const urlObj = new URL(url)
    return `${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`
  } catch (e) {
    return url
  }
}



