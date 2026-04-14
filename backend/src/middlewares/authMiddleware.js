import { sendError } from '../utils/response.js';
import { verifyToken } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [schema, token] = authHeader.split(' ');

  if (schema !== 'Bearer' || !token) {
    return sendError(res, {
      status: 401,
      message: 'Unauthorized'
    });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded?.sub || decoded?.role !== 'admin') {
      return sendError(res, {
        status: 401,
        message: 'Invalid token payload'
      });
    }

    req.auth = {
      adminId: decoded.sub,
      username: decoded.username,
      role: decoded.role
    };

    return next();
  } catch {
    return sendError(res, {
      status: 401,
      message: 'Invalid or expired token'
    });
  }
}