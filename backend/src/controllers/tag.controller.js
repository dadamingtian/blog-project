import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  createTag,
  deleteTag,
  getTagById,
  getTagBySlug,
  listTags,
  updateTag
} from '../services/tag.service.js';
import { listArticles } from '../services/article.service.js';

export const listPublicTags = asyncHandler(async (req, res) => {
  const data = await listTags({ query: req.query, publishedOnly: true });
  return sendSuccess(res, { data });
});

export const listAdminTags = asyncHandler(async (req, res) => {
  const data = await listTags({ query: req.query, publishedOnly: false });
  return sendSuccess(res, { data });
});

export const listPublicArticlesByTagSlug = asyncHandler(async (req, res) => {
  const tag = await getTagBySlug(req.params.slug);

  const data = await listArticles({
    query: {
      ...req.query,
      tagId: tag.id
    },
    isAdmin: false
  });

  return sendSuccess(res, {
    data: {
      tag,
      ...data
    }
  });
});

export const getAdminTag = asyncHandler(async (req, res) => {
  const data = await getTagById(req.params.id);
  return sendSuccess(res, { data });
});

export const createAdminTag = asyncHandler(async (req, res) => {
  const data = await createTag(req.body);
  return sendSuccess(res, { status: 201, message: 'Tag created', data });
});

export const updateAdminTag = asyncHandler(async (req, res) => {
  const data = await updateTag(req.params.id, req.body);
  return sendSuccess(res, { message: 'Tag updated', data });
});

export const deleteAdminTag = asyncHandler(async (req, res) => {
  const data = await deleteTag(req.params.id);
  return sendSuccess(res, { message: 'Tag deleted', data });
});