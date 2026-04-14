import http from '../http';

export function fetchPublicArticles(params = {}) {
  return http.get('/articles', { params });
}

export function fetchPublicHotArticles(params = {}) {
  return http.get('/articles', {
    params: {
      page: 1,
      pageSize: 8,
      ...params
    }
  });
}

export function fetchPublicArticleBySlug(slug) {
  return http.get(`/articles/${slug}`);
}

export function searchPublicArticles(params = {}) {
  return http.get('/articles/search', { params });
}

export function fetchArchiveList() {
  return http.get('/articles/archive/list');
}
