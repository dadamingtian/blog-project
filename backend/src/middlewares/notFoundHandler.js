import HttpError from '../utils/httpError.js';

export default function notFoundHandler(req, res, next) {
  next(
    new HttpError({
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    })
  );
}
