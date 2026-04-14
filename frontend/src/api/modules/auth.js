import http from '../http';

export function loginAdmin(payload) {
  return http.post('/auth/login', payload);
}

export function fetchAdminProfile() {
  return http.get('/auth/profile');
}

export function checkAdminAccess() {
  return http.get('/admin/access-check');
}