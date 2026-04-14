import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory
} from '../services/category.service.js';
import { listArticles } from '../services/article.service.js';

export const listPublicCategories = asyncHandler(async (req, res) => {
  const data = await listCategories({ query: req.query, publishedOnly: true });
  return sendSuccess(res, { data });
});

export const listAdminCategories = asyncHandler(async (req, res) => {
  const data = await listCategories({ query: req.query, publishedOnly: false });
  return sendSuccess(res, { data });
});

export const listPublicArticlesByCategorySlug = asyncHandler(async (req, res) => {
  const category = await getCategoryBySlug(req.params.slug);

  const data = await listArticles({
    query: {
      ...req.query,
      categoryId: category.id
    },
    isAdmin: false
  });

  return sendSuccess(res, {
    data: {
      category,
      ...data
    }
  });
});

export const getAdminCategory = asyncHandler(async (req, res) => {
  const data = await getCategoryById(req.params.id);
  return sendSuccess(res, { data });
});

export const createAdminCategory = asyncHandler(async (req, res) => {
  const data = await createCategory(req.body);
  return sendSuccess(res, { status: 201, message: 'Category created', data });
});

export const updateAdminCategory = asyncHandler(async (req, res) => {
  const data = await updateCategory(req.params.id, req.body);
  return sendSuccess(res, { message: 'Category updated', data });
});

export const deleteAdminCategory = asyncHandler(async (req, res) => {
  const data = await deleteCategory(req.params.id);
  return sendSuccess(res, { message: 'Category deleted', data });
});