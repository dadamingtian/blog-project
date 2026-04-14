import { body, param } from 'express-validator';

export const categoryIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid category id')
];

export const categorySlugParamValidator = [
  param('slug').trim().notEmpty().withMessage('slug is required').isLength({ max: 128 })
];

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 64 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 128 }),
  body('description').optional().trim().isLength({ max: 300 })
];

export const updateCategoryValidator = [
  ...categoryIdParamValidator,
  body('name').optional().trim().notEmpty().isLength({ max: 64 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 128 }),
  body('description').optional().trim().isLength({ max: 300 })
];
