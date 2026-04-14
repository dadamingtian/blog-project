import { sendSuccess } from '../utils/response.js';
import { getHealthStatus } from '../services/health.service.js';

export function getHealth(req, res) {
  const data = getHealthStatus();
  return sendSuccess(res, { data });
}
