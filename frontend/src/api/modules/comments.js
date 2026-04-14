import http from '../http';

export function createPublicComment(payload) {
  return http.post('/comments', payload);
}

export function fetchPublicCommentsByArticleId(articleId) {
  return http.get(`/comments/article/${articleId}`);
}
