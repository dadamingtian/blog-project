import { env } from '../config/index.js';
import logger from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export default function errorHandler(err, req, res, next) {
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  let code = err.code;
  let clientMessage = err.message || 'Request failed';
  const data = err.data || null;

  if (err?.name === 'MulterError') {
    statusCode = 400;
    code = err.code;

    if (err.code === 'LIMIT_FILE_SIZE') {
      clientMessage = 'File size exceeds the limit';
    } else {
      clientMessage = 'File upload failed';
    }
  }

  const message = statusCode >= 500 ? 'Internal server error' : clientMessage;

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: env.isProduction ? undefined : err.stack
    });
  }

  return sendError(res, {
    status: statusCode,
    code,
    message,
    data
  });
}
