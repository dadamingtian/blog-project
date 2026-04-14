import http from '../http';

export function fetchPublicSiteConfig() {
  return http.get('/site/config');
}
