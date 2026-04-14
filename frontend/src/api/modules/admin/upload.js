import http from '../../http';

export function uploadAdminImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  return http.post('/admin/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
