import mongoose from 'mongoose';
import Article from '../models/article.model.js';
import ArticleViewStat from '../models/article-view-stat.model.js';
import Category from '../models/category.model.js';
import Comment from '../models/comment.model.js';
import Tag from '../models/tag.model.js';
import HttpError from '../utils/httpError.js';
import { buildPaginationResult, parsePagination } from '../utils/pagination.js';
import { parseCommaSeparated } from '../utils/query.js';
import { ensureSlug, ensureUniqueSlug } from '../utils/slug.js';

function escapeRegex(keyword = '') {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeObjectId(id, fieldName) {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError({ statusCode: 422, message: `${fieldName} is invalid` });
  }
  return new mongoose.Types.ObjectId(id);
}

async function validateCategoryAndTags({ category, tags }) {
  if (category) {
    const exists = await Category.exists({ _id: category });
    if (!exists) throw new HttpError({ statusCode: 422, message: 'Category does not exist' });
  }

  if (tags.length) {
    const found = await Tag.find({ _id: { $in: tags } }).select('_id');
    if (found.length !== tags.length) {
      throw new HttpError({ statusCode: 422, message: 'One or more tags do not exist' });
    }
  }
}

function buildArticleFilter({ query, isAdmin }) {
  const filter = {};

  if (!isAdmin) {
    filter.status = 'published';
  } else if (query.status && ['draft', 'published'].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.categoryId) filter.category = normalizeObjectId(query.categoryId, 'categoryId');
  if (query.tagId) filter.tags = normalizeObjectId(query.tagId, 'tagId');

  if (query.keyword) {
    const keyword = String(query.keyword).trim();
    if (keyword) {
      const keywordRegex = escapeRegex(keyword);
      filter.$or = [
        { title: { $regex: keywordRegex, $options: 'i' } },
        { summary: { $regex: keywordRegex, $options: 'i' } },
        { content: { $regex: keywordRegex, $options: 'i' } }
      ];
    }
  }

  return filter;
}

function toArticleDTO(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    coverImage: item.coverImage,
    status: item.status,
    category: item.category
      ? {
          id: item.category._id?.toString?.() || item.category.toString(),
          name: item.category.name,
          slug: item.category.slug
        }
      : null,
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag) => ({
          id: tag._id?.toString?.() || tag.toString(),
          name: tag.name,
          slug: tag.slug
        }))
      : [],
    isTop: item.isTop,
    viewCount: item.viewCount,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

export async function listArticles({ query, isAdmin }) {
  const { page, pageSize, skip } = parsePagination(query, { pageSize: 10, maxPageSize: 50 });
  const filter = buildArticleFilter({ query, isAdmin });

  const sort = isAdmin ? { updatedAt: -1, createdAt: -1 } : { isTop: -1, publishedAt: -1, viewCount: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Article.find(filter)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(pageSize),
    Article.countDocuments(filter)
  ]);

  return {
    items: items.map(toArticleDTO),
    pagination: buildPaginationResult({ page, pageSize, total })
  };
}

export async function getArticleById(id, { isAdmin }) {
  const filter = { _id: id };
  if (!isAdmin) filter.status = 'published';

  const item = await Article.findOne(filter).populate('category', 'name slug').populate('tags', 'name slug');
  if (!item) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  return toArticleDTO(item);
}

export async function getArticleBySlug(slug, { isAdmin }) {
  const filter = { slug };
  if (!isAdmin) filter.status = 'published';

  const item = await Article.findOne(filter).populate('category', 'name slug').populate('tags', 'name slug');
  if (!item) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  return toArticleDTO(item);
}

function toRelatedArticleDTO(item) {
  if (!item) return null;
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug
  };
}

export async function getPublicArticleWithNeighbors(slug) {
  const item = await Article.findOne({ slug, status: 'published' })
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  if (!item) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  const currentSortTime = item.publishedAt || item.createdAt;

  const [previous, next] = await Promise.all([
    Article.findOne({
      status: 'published',
      _id: { $ne: item._id },
      $expr: {
        $gt: [{ $ifNull: ['$publishedAt', '$createdAt'] }, currentSortTime]
      }
    })
      .sort({ publishedAt: 1, createdAt: 1, _id: 1 })
      .select('title slug'),
    Article.findOne({
      status: 'published',
      _id: { $ne: item._id },
      $expr: {
        $lt: [{ $ifNull: ['$publishedAt', '$createdAt'] }, currentSortTime]
      }
    })
      .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
      .select('title slug')
  ]);

  return {
    ...toArticleDTO(item),
    previousArticle: toRelatedArticleDTO(previous),
    nextArticle: toRelatedArticleDTO(next)
  };
}

function normalizeArticlePayload(payload = {}) {
  const category = normalizeObjectId(payload.category || null, 'category');
  const tagValues = Array.isArray(payload.tags) ? payload.tags : parseCommaSeparated(payload.tags);

  const tags = [...new Set(tagValues.map((item) => String(item).trim()).filter(Boolean))]
    .map((id) => normalizeObjectId(id, 'tags'))
    .filter(Boolean);

  const status = ['draft', 'published'].includes(payload.status) ? payload.status : 'draft';

  return {
    title: String(payload.title || '').trim(),
    slug: String(payload.slug || '').trim(),
    summary: String(payload.summary || '').trim(),
    content: String(payload.content || ''),
    coverImage: String(payload.coverImage || '').trim(),
    status,
    category,
    tags,
    isTop: Boolean(payload.isTop),
    seoTitle: String(payload.seoTitle || '').trim(),
    seoDescription: String(payload.seoDescription || '').trim()
  };
}

export async function createArticle(payload, auth) {
  const normalized = normalizeArticlePayload(payload);

  const baseSlug = ensureSlug(normalized.slug, normalized.title, 'slug');
  normalized.slug = await ensureUniqueSlug({ model: Article, slug: baseSlug });

  await validateCategoryAndTags({ category: normalized.category, tags: normalized.tags });

  if (!normalized.title || !normalized.content || !normalized.category) {
    throw new HttpError({ statusCode: 422, message: 'title, content and category are required' });
  }

  const created = await Article.create({
    ...normalized,
    author: auth?.adminId || null,
    publishedAt: normalized.status === 'published' ? new Date() : null
  });

  return getArticleById(created._id, { isAdmin: true });
}

export async function updateArticle(id, payload) {
  const current = await Article.findById(id);
  if (!current) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  const normalized = normalizeArticlePayload({ ...current.toObject(), ...payload });

  const baseSlug = ensureSlug(normalized.slug, normalized.title, 'slug');
  normalized.slug = await ensureUniqueSlug({ model: Article, slug: baseSlug, excludeId: current._id });

  await validateCategoryAndTags({ category: normalized.category, tags: normalized.tags });

  current.title = normalized.title;
  current.slug = normalized.slug;
  current.summary = normalized.summary;
  current.content = normalized.content;
  current.coverImage = normalized.coverImage;
  current.status = normalized.status;
  current.category = normalized.category;
  current.tags = normalized.tags;
  current.isTop = normalized.isTop;
  current.seoTitle = normalized.seoTitle;
  current.seoDescription = normalized.seoDescription;

  if (normalized.status === 'published' && !current.publishedAt) current.publishedAt = new Date();
  if (normalized.status === 'draft') current.publishedAt = null;

  await current.save();

  return getArticleById(current._id, { isAdmin: true });
}

export async function deleteArticle(id) {
  const deleted = await Article.findByIdAndDelete(id);
  if (!deleted) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  await Promise.all([
    Comment.deleteMany({ article: deleted._id }),
    ArticleViewStat.deleteMany({ article: deleted._id })
  ]);

  return { id };
}

export async function incrementArticleViewCount(idOrSlug) {
  const filter = mongoose.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const target = await Article.findOneAndUpdate(
    { ...filter, status: 'published' },
    { $inc: { viewCount: 1 } },
    { new: true, projection: { _id: 1 } }
  );

  if (!target?._id) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;

  await ArticleViewStat.updateOne(
    { article: target._id, date: dateKey },
    { $inc: { views: 1 } },
    { upsert: true }
  );
}

export async function listArchive() {
  const rows = await Article.aggregate([
    { $match: { status: 'published' } },
    {
      $project: {
        title: 1,
        slug: 1,
        publishedAt: { $ifNull: ['$publishedAt', '$createdAt'] },
        year: { $year: { $ifNull: ['$publishedAt', '$createdAt'] } },
        month: { $month: { $ifNull: ['$publishedAt', '$createdAt'] } }
      }
    },
    { $sort: { publishedAt: -1 } },
    {
      $group: {
        _id: { year: '$year', month: '$month' },
        items: { $push: { title: '$title', slug: '$slug', publishedAt: '$publishedAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);

  return rows.map((row) => ({
    year: row._id.year,
    month: row._id.month,
    count: row.count,
    items: row.items
  }));
}

export async function searchPublishedArticles(query) {
  const { page, pageSize, skip } = parsePagination(query, { pageSize: 10, maxPageSize: 50 });
  const keyword = String(query.keyword || '').trim();

  const filter = { status: 'published' };
  if (keyword) {
    const keywordRegex = escapeRegex(keyword);
    filter.$or = [
      { title: { $regex: keywordRegex, $options: 'i' } },
      { summary: { $regex: keywordRegex, $options: 'i' } },
      { content: { $regex: keywordRegex, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Article.find(filter)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ isTop: -1, publishedAt: -1, viewCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Article.countDocuments(filter)
  ]);

  return {
    items: items.map(toArticleDTO),
    pagination: buildPaginationResult({ page, pageSize, total })
  };
}
