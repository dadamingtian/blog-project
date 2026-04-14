import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getAdminProfileById, loginAdminByPassword } from '../services/auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const data = await loginAdminByPassword({ username, password });

  return sendSuccess(res, {
    message: 'Login successful',
    data
  });
});

export const profile = asyncHandler(async (req, res) => {
  const data = await getAdminProfileById(req.auth.adminId);
  return sendSuccess(res, { data });
});