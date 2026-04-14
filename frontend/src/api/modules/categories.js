import http from '../http';

export function fetchPublicCategories(params = {}) {
  return http.get('/categories', { params });
}

export function fetchPublicArticlesByCategorySlug(slug, params = {}) {
  return http.get(`/categories/${slug}/articles`, { params });
}
