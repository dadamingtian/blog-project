import { body, param } from 'express-validator';

export const tagIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid tag id')
];

export const tagSlugParamValidator = [
  param('slug').trim().notEmpty().withMessage('slug is required').isLength({ max: 128 })
];

export const createTagValidator = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 64 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 128 })
];

export const updateTagValidator = [
  ...tagIdParamValidator,
  body('name').optional().trim().notEmpty().isLength({ max: 64 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 128 })
];
