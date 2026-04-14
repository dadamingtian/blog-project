import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getDashboardOverview } from '../services/dashboard.service.js';

export const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const data = await getDashboardOverview();
  return sendSuccess(res, { data });
});
