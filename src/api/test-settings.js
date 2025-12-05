import request from '@/utils/request'

// 端侧FTP服务器配置API
export function getClientFtpConfig() {
  return request({
    url: '/test-settings/client-ftp',
    method: 'get',
  })
}

export function saveOrUpdateClientFtpConfig(data) {
  return request({
    url: '/test-settings/client-ftp',
    method: 'post',
    data,
  })
}

// 网络侧FTP服务器配置API
export function getNetworkFtpConfig() {
  return request({
    url: '/test-settings/network-ftp',
    method: 'get',
  })
}

export function saveOrUpdateNetworkFtpConfig(data) {
  return request({
    url: '/test-settings/network-ftp',
    method: 'post',
    data,
  })
}

// deviceid和GPSI对应关系API
export function getDeviceImsiMappings() {
  return request({
    url: '/test-settings/device-imsi-mapping',
    method: 'get',
  })
}

export function getDeviceImsiMappingPage(params) {
  return request({
    url: '/test-settings/device-imsi-mapping/page',
    method: 'get',
    params,
  })
}

export function createDeviceImsiMapping(data) {
  return request({
    url: '/test-settings/device-imsi-mapping',
    method: 'post',
    data,
  })
}

export function updateDeviceImsiMapping(id, data) {
  return request({
    url: `/test-settings/device-imsi-mapping/${id}`,
    method: 'put',
    data,
  })
}

export function deleteDeviceImsiMapping(id) {
  return request({
    url: `/test-settings/device-imsi-mapping/${id}`,
    method: 'delete',
  })
}




