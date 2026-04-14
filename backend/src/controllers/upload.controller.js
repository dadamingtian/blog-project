import path from 'node:path';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { env } from '../config/index.js';
import { sendSuccess } from '../utils/response.js';

function buildPublicBaseUrl(req) {
  if (env.publicServerUrl) {
    return env.publicServerUrl.replace(/\/+$/, '');
  }
  const host = req.get('host') || '';
  return `${req.protocol}://${host}`;
}

export const uploadAdminImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError({ statusCode: 400, message: 'image file is required' });
  }

  const relativePath = path.posix.join('uploads', 'images', req.file.filename);
  const publicBaseUrl = buildPublicBaseUrl(req);
  const fileUrl = `${publicBaseUrl}/${relativePath}`;

  return sendSuccess(res, {
    status: 201,
    message: 'Image uploaded',
    data: {
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/${relativePath}`,
      url: fileUrl
    }
  });
});
