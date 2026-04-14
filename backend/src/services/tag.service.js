import Tag from '../models/tag.model.js';
import Article from '../models/article.model.js';
import HttpError from '../utils/httpError.js';
import { buildPaginationResult, parsePagination } from '../utils/pagination.js';
import { ensureSlug, ensureUniqueSlug } from '../utils/slug.js';

function escapeRegex(keyword = '') {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toTagDTO(tag, articleCount = 0) {
  return {
    id: tag._id.toString(),
    name: tag.name,
    slug: tag.slug,
    articleCount,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
}

async function buildTagCountMap(tagIds, publishedOnly = true) {
  if (!tagIds.length) return new Map();

  const match = { tags: { $in: tagIds } };
  if (publishedOnly) match.status = 'published';

  const rows = await Article.aggregate([
    { $match: match },
    { $unwind: '$tags' },
    { $match: { tags: { $in: tagIds } } },
    { $group: { _id: '$tags', count: { $sum: 1 } } }
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function listTags({ query, publishedOnly = false }) {
  const { page, pageSize, skip } = parsePagination(query, { pageSize: 30, maxPageSize: 100 });
  const keyword = String(query.keyword || '').trim();

  const filter = {};
  if (keyword) {
    const keywordRegex = escapeRegex(keyword);
    filter.$or = [
      { name: { $regex: keywordRegex, $options: 'i' } },
      { slug: { $regex: keywordRegex, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Tag.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Tag.countDocuments(filter)
  ]);

  const ids = items.map((item) => item._id);
  const countMap = await buildTagCountMap(ids, publishedOnly);

  return {
    items: items.map((item) => toTagDTO(item, countMap.get(item._id.toString()) || 0)),
    pagination: buildPaginationResult({ page, pageSize, total })
  };
}

export async function getTagById(id) {
  const item = await Tag.findById(id);
  if (!item) throw new HttpError({ statusCode: 404, message: 'Tag not found' });

  const countMap = await buildTagCountMap([item._id], false);
  return toTagDTO(item, countMap.get(item._id.toString()) || 0);
}

export async function getTagBySlug(slug) {
  const item = await Tag.findOne({ slug });
  if (!item) throw new HttpError({ statusCode: 404, message: 'Tag not found' });

  const countMap = await buildTagCountMap([item._id], false);
  return toTagDTO(item, countMap.get(item._id.toString()) || 0);
}

export async function createTag(payload) {
  const baseSlug = ensureSlug(payload.slug, payload.name);
  const uniqueSlug = await ensureUniqueSlug({ model: Tag, slug: baseSlug });

  const created = await Tag.create({
    name: String(payload.name || '').trim(),
    slug: uniqueSlug
  });

  return toTagDTO(created, 0);
}

export async function updateTag(id, payload) {
  const current = await Tag.findById(id);
  if (!current) throw new HttpError({ statusCode: 404, message: 'Tag not found' });

  if (typeof payload.name !== 'undefined') current.name = String(payload.name).trim();

  if (typeof payload.slug !== 'undefined' || typeof payload.name !== 'undefined') {
    const baseSlug = ensureSlug(payload.slug ?? current.slug, payload.name ?? current.name);
    current.slug = await ensureUniqueSlug({ model: Tag, slug: baseSlug, excludeId: current._id });
  }

  await current.save();

  const countMap = await buildTagCountMap([current._id], false);
  return toTagDTO(current, countMap.get(current._id.toString()) || 0);
}

export async function deleteTag(id) {
  const inUse = await Article.exists({ tags: id });
  if (inUse) {
    throw new HttpError({ statusCode: 409, message: 'Tag is used by articles and cannot be deleted' });
  }

  const deleted = await Tag.findByIdAndDelete(id);
  if (!deleted) throw new HttpError({ statusCode: 404, message: 'Tag not found' });

  return { id };
}
