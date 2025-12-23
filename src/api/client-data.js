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

