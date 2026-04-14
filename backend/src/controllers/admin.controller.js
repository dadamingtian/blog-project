import { sendSuccess } from '../utils/response.js';

export function getAccessCheck(req, res) {
  return sendSuccess(res, {
    data: {
      ok: true,
      adminId: req.auth.adminId,
      role: req.auth.role
    }
  });
}