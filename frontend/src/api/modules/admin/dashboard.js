import http from '../../http';

export function fetchAdminDashboardOverview() {
  return http.get('/admin/dashboard/overview');
}
