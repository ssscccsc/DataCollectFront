import request from '@/utils/request'

// 时间配置API
export function getTimeConfig() {
  return request({
    url: '/test-settings/time-config',
    method: 'get',
  })
}

export function saveOrUpdateTimeConfig(data) {
  return request({
    url: '/test-settings/time-config',
    method: 'post',
    data,
  })
}

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

// 网络侧数据文件上传API（支持多文件上传）
export function uploadNetworkDataFile(files) {
  const formData = new FormData();
  // 如果传入的是单个文件，转换为数组
  const fileArray = Array.isArray(files) ? files : [files];
  // 添加所有文件到FormData
  fileArray.forEach((file) => {
    formData.append('files', file);
  });
  
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

// 获取网络侧数据聚合分页（按GPSI+日期+子应用ID分组）
export function getGroupedNetworkDataPage(params) {
  return request({
    url: '/network-data/group/page',
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

// 更新vMOS数据
export function updateVmosData(id, data) {
  return request({
    url: `/client-data/vmos/${id}`,
    method: 'put',
    data,
  });
}

// 获取速率对比数据
export function getSpeedComparison(taskId) {
  return request({
    url: `/client-data/speed-comparison/${taskId}`,
    method: 'get',
  });
}

// 更新任务的网络侧开始时间
export function updateNetworkStartTime(taskId, networkStartTime, clientStartSequence) {
  return request({
    url: `/client-data/network-start-time/${taskId}`,
    method: 'put',
    data: {
      networkStartTime: networkStartTime,
      clientStartSequence: clientStartSequence,
    },
  });
}

// 获取RTT对比数据
export function getRttComparison(taskId) {
  return request({
    url: `/client-data/rtt-comparison/${taskId}`,
    method: 'get',
  });
}

// 获取卡顿对比数据
export function getStutterComparison(taskId) {
  return request({
    url: `/client-data/stutter-comparison/${taskId}`,
    method: 'get',
  });
}

// 获取平均QOE对比数据
export function getAvgQoeComparison(taskId) {
  return request({
    url: `/client-data/avg-qoe-comparison/${taskId}`,
    method: 'get',
  });
}
