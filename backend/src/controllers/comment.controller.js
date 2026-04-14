import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  createComment,
  deleteComment,
  listAdminComments,
  listArticleComments,
  updateCommentStatus
} from '../services/comment.service.js';

export const createPublicComment = asyncHandler(async (req, res) => {
  const data = await createComment(req.body);
  return sendSuccess(res, { status: 201, message: 'Comment submitted', data });
});

export const listPublicArticleComments = asyncHandler(async (req, res) => {
  const data = await listArticleComments(req.params.articleId);
  return sendSuccess(res, { data });
});

export const listAdminCommentItems = asyncHandler(async (req, res) => {
  const data = await listAdminComments(req.query);
  return sendSuccess(res, { data });
});

export const updateAdminCommentStatus = asyncHandler(async (req, res) => {
  const data = await updateCommentStatus(req.params.id, req.body.status);
  return sendSuccess(res, { message: 'Comment status updated', data });
});

export const deleteAdminComment = asyncHandler(async (req, res) => {
  const data = await deleteComment(req.params.id);
  return sendSuccess(res, { message: 'Comment deleted', data });
});