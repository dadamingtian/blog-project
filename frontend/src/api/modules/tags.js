import http from '../http';

export function fetchPublicTags(params = {}) {
  return http.get('/tags', { params });
}

export function fetchPublicArticlesByTagSlug(slug, params = {}) {
  return http.get(`/tags/${slug}/articles`, { params });
}
