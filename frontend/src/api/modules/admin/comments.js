import http from '../../http';

export function fetchAdminComments(params = {}) {
  return http.get('/admin/comments', { params });
}

export function updateAdminCommentStatus(id, status) {
  return http.put(`/admin/comments/${id}/status`, { status });
}

export function deleteAdminComment(id) {
  return http.delete(`/admin/comments/${id}`);
}
