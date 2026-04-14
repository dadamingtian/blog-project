import http from '../../http';

export function fetchAdminSiteConfig() {
  return http.get('/admin/site/config');
}

export function updateAdminSiteConfig(payload) {
  return http.put('/admin/site/config', payload);
}
