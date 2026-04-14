import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getSiteConfig, updateSiteConfig } from '../services/site-config.service.js';

export const getPublicSiteConfig = asyncHandler(async (req, res) => {
  const data = await getSiteConfig();
  return sendSuccess(res, { data });
});

export const getAdminSiteConfig = asyncHandler(async (req, res) => {
  const data = await getSiteConfig();
  return sendSuccess(res, { data });
});

export const updateAdminSiteConfig = asyncHandler(async (req, res) => {
  const data = await updateSiteConfig(req.body);
  return sendSuccess(res, { message: 'Site config updated', data });
});