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

// 网络侧数据文件上传API
export function uploadNetworkDataFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/test-settings/network-data/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 分页查询网络侧数据列表
export function getNetworkDataPage(params) {
  return request({
    url: '/network-data/page',
    method: 'get',
    params,
  });
}

// 端侧数据文件上传API
export function uploadClientDataFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/test-settings/client-data/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 分页查询端侧任务信息列表
export function getClientDataPage(params) {
  return request({
    url: '/client-data/page',
    method: 'get',
    params,
  });
}

// 根据任务ID获取任务详情
export function getClientDataDetail(taskId) {
  return request({
    url: `/client-data/detail/${taskId}`,
    method: 'get',
  });
}
