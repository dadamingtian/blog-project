import { validationResult } from 'express-validator';
import HttpError from '../utils/httpError.js';

export default function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true });
  const first = errors[0];

  return next(
    new HttpError({
      statusCode: 422,
      message: first?.msg || 'Validation failed',
      data: {
        errors
      }
    })
  );
}