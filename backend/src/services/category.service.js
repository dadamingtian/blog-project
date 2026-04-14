import Category from '../models/category.model.js';
import Article from '../models/article.model.js';
import HttpError from '../utils/httpError.js';
import { buildPaginationResult, parsePagination } from '../utils/pagination.js';
import { ensureSlug, ensureUniqueSlug } from '../utils/slug.js';

function escapeRegex(keyword = '') {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toCategoryDTO(category, articleCount = 0) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    articleCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

async function buildCategoryCountMap(categoryIds, publishedOnly = true) {
  if (!categoryIds.length) return new Map();

  const match = { category: { $in: categoryIds } };
  if (publishedOnly) match.status = 'published';

  const rows = await Article.aggregate([
    { $match: match },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function listCategories({ query, publishedOnly = false }) {
  const { page, pageSize, skip } = parsePagination(query, { pageSize: 20, maxPageSize: 100 });
  const keyword = String(query.keyword || '').trim();

  const filter = {};
  if (keyword) {
    const keywordRegex = escapeRegex(keyword);
    filter.$or = [
      { name: { $regex: keywordRegex, $options: 'i' } },
      { slug: { $regex: keywordRegex, $options: 'i' } },
      { description: { $regex: keywordRegex, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Category.countDocuments(filter)
  ]);

  const ids = items.map((item) => item._id);
  const countMap = await buildCategoryCountMap(ids, publishedOnly);

  return {
    items: items.map((item) => toCategoryDTO(item, countMap.get(item._id.toString()) || 0)),
    pagination: buildPaginationResult({ page, pageSize, total })
  };
}

export async function getCategoryById(id) {
  const item = await Category.findById(id);
  if (!item) throw new HttpError({ statusCode: 404, message: 'Category not found' });

  const countMap = await buildCategoryCountMap([item._id], false);
  return toCategoryDTO(item, countMap.get(item._id.toString()) || 0);
}

export async function getCategoryBySlug(slug) {
  const item = await Category.findOne({ slug });
  if (!item) throw new HttpError({ statusCode: 404, message: 'Category not found' });

  const countMap = await buildCategoryCountMap([item._id], false);
  return toCategoryDTO(item, countMap.get(item._id.toString()) || 0);
}

export async function createCategory(payload) {
  const baseSlug = ensureSlug(payload.slug, payload.name);
  const uniqueSlug = await ensureUniqueSlug({ model: Category, slug: baseSlug });

  const created = await Category.create({
    name: String(payload.name || '').trim(),
    slug: uniqueSlug,
    description: String(payload.description || '').trim()
  });

  return toCategoryDTO(created, 0);
}

export async function updateCategory(id, payload) {
  const current = await Category.findById(id);
  if (!current) throw new HttpError({ statusCode: 404, message: 'Category not found' });

  if (typeof payload.name !== 'undefined') current.name = String(payload.name).trim();
  if (typeof payload.description !== 'undefined') current.description = String(payload.description).trim();

  if (typeof payload.slug !== 'undefined' || typeof payload.name !== 'undefined') {
    const baseSlug = ensureSlug(payload.slug ?? current.slug, payload.name ?? current.name);
    current.slug = await ensureUniqueSlug({ model: Category, slug: baseSlug, excludeId: current._id });
  }

  await current.save();

  const countMap = await buildCategoryCountMap([current._id], false);
  return toCategoryDTO(current, countMap.get(current._id.toString()) || 0);
}

export async function deleteCategory(id) {
  const inUse = await Article.exists({ category: id });
  if (inUse) {
    throw new HttpError({ statusCode: 409, message: 'Category is used by articles and cannot be deleted' });
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new HttpError({ statusCode: 404, message: 'Category not found' });

  return { id };
}
