import Comment from '../models/comment.model.js';
import Article from '../models/article.model.js';
import { env } from '../config/index.js';
import HttpError from '../utils/httpError.js';
import { buildPaginationResult, parsePagination } from '../utils/pagination.js';

function toCommentDTO(item) {
  return {
    id: item._id.toString(),
    article: item.article
      ? {
          id: item.article._id?.toString?.() || item.article.toString(),
          title: item.article.title,
          slug: item.article.slug
        }
      : null,
    nickname: item.nickname,
    email: item.email,
    website: item.website,
    content: item.content,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

export async function listAdminComments(query) {
  const { page, pageSize, skip } = parsePagination(query, { pageSize: 10, maxPageSize: 50 });

  const filter = {};
  if (query.status && ['pending', 'approved', 'rejected'].includes(query.status)) filter.status = query.status;
  if (query.articleId) filter.article = query.articleId;

  const [items, total] = await Promise.all([
    Comment.find(filter).populate('article', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Comment.countDocuments(filter)
  ]);

  return {
    items: items.map(toCommentDTO),
    pagination: buildPaginationResult({ page, pageSize, total })
  };
}

export async function listArticleComments(articleId) {
  const items = await Comment.find({ article: articleId, status: 'approved' }).sort({ createdAt: -1 }).limit(200);
  return items.map(toCommentDTO);
}

export async function createComment(payload) {
  const article = await Article.findOne({ _id: payload.article, status: 'published' });
  if (!article) throw new HttpError({ statusCode: 404, message: 'Article not found' });

  const status = payload.status && ['pending', 'approved', 'rejected'].includes(payload.status)
    ? payload.status
    : env.commentDefaultStatus;

  const created = await Comment.create({
    article: payload.article,
    nickname: String(payload.nickname || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    website: String(payload.website || '').trim(),
    content: String(payload.content || '').trim(),
    status
  });

  return toCommentDTO(created);
}

export async function updateCommentStatus(id, status) {
  const target = await Comment.findById(id).populate('article', 'title slug');
  if (!target) throw new HttpError({ statusCode: 404, message: 'Comment not found' });

  target.status = status;
  await target.save();

  return toCommentDTO(target);
}

export async function deleteComment(id) {
  const deleted = await Comment.findByIdAndDelete(id);
  if (!deleted) throw new HttpError({ statusCode: 404, message: 'Comment not found' });
  return { id };
}
