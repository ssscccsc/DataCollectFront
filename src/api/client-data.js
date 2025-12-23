import request from '@/utils/request'

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

