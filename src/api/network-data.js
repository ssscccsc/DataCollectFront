import request from '@/utils/request'

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

