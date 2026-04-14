import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getPublicArticleWithNeighbors,
  incrementArticleViewCount,
  listArchive,
  listArticles,
  searchPublishedArticles,
  updateArticle
} from '../services/article.service.js';

function readCookie(req, key) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return '';

  const chunks = cookieHeader.split(';').map((item) => item.trim());
  const target = chunks.find((item) => item.startsWith(`${key}=`));
  if (!target) return '';
  return decodeURIComponent(target.slice(key.length + 1));
}

function appendCookie(res, cookieLine) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieLine);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieLine]);
    return;
  }
  res.setHeader('Set-Cookie', [String(existing), cookieLine]);
}

export const listPublicArticles = asyncHandler(async (req, res) => {
  const data = await listArticles({ query: req.query, isAdmin: false });
  return sendSuccess(res, { data });
});

export const searchPublicArticles = asyncHandler(async (req, res) => {
  const data = await searchPublishedArticles(req.query);
  return sendSuccess(res, { data });
});

export const listPublicArchive = asyncHandler(async (req, res) => {
  const data = await listArchive();
  return sendSuccess(res, { data });
});

export const getPublicArticleBySlug = asyncHandler(async (req, res) => {
  const data = await getPublicArticleWithNeighbors(req.params.slug);
  const viewedCookie = readCookie(req, 'viewed_articles');
  const viewedSet = new Set(
    String(viewedCookie || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  if (!viewedSet.has(req.params.slug)) {
    await incrementArticleViewCount(req.params.slug);
    data.viewCount = Number(data.viewCount || 0) + 1;
    viewedSet.add(req.params.slug);

    const maxCount = 100;
    const recentViewed = Array.from(viewedSet).slice(-maxCount).join(',');
    const maxAge = 60 * 60 * 24;
    const cookieValue = encodeURIComponent(recentViewed);
    const cookieLine = `viewed_articles=${cookieValue}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`;
    appendCookie(res, cookieLine);
  }

  return sendSuccess(res, { data });
});

export const listAdminArticles = asyncHandler(async (req, res) => {
  const data = await listArticles({ query: req.query, isAdmin: true });
  return sendSuccess(res, { data });
});

export const getAdminArticleById = asyncHandler(async (req, res) => {
  const data = await getArticleById(req.params.id, { isAdmin: true });
  return sendSuccess(res, { data });
});

export const createAdminArticle = asyncHandler(async (req, res) => {
  const data = await createArticle(req.body, req.auth);
  return sendSuccess(res, { status: 201, message: 'Article created', data });
});

export const updateAdminArticle = asyncHandler(async (req, res) => {
  const data = await updateArticle(req.params.id, req.body);
  return sendSuccess(res, { message: 'Article updated', data });
});

export const deleteAdminArticle = asyncHandler(async (req, res) => {
  const data = await deleteArticle(req.params.id);
  return sendSuccess(res, { message: 'Article deleted', data });
});
