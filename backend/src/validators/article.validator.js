import { body, param, query } from 'express-validator';

export const articleIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid article id')
];

export const articleSlugParamValidator = [
  param('slug').trim().notEmpty().isLength({ max: 220 }).withMessage('Invalid slug')
];

export const publicArticleListQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('pageSize').optional().isInt({ min: 1, max: 50 }).withMessage('pageSize must be 1-50'),
  query('categoryId').optional().isMongoId().withMessage('Invalid categoryId'),
  query('tagId').optional().isMongoId().withMessage('Invalid tagId'),
  query('keyword').optional().trim().isLength({ max: 100 })
];

export const adminArticleListQueryValidator = [
  ...publicArticleListQueryValidator,
  query('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
];

export const searchQueryValidator = [
  query('keyword').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 50 })
];

export const createArticleValidator = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 200 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 220 }),
  body('summary').optional().trim().isLength({ max: 500 }),
  body('content').isString().withMessage('content is required'),
  body('coverImage').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  body('category').notEmpty().withMessage('category is required').bail().custom((value) => {
    return /^[a-fA-F0-9]{24}$/.test(String(value));
  }).withMessage('Invalid category'),
  body('tags').optional().custom((value) => {
    if (Array.isArray(value)) {
      return value.every((item) => /^[a-fA-F0-9]{24}$/.test(String(item)));
    }
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean).every((item) => /^[a-fA-F0-9]{24}$/.test(String(item).trim()));
    }
    return false;
  }).withMessage('Invalid tags'),
  body('isTop').optional().isBoolean().withMessage('isTop must be boolean'),
  body('seoTitle').optional().trim().isLength({ max: 200 }),
  body('seoDescription').optional().trim().isLength({ max: 300 })
];

export const updateArticleValidator = [
  ...articleIdParamValidator,
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 220 }),
  body('summary').optional().trim().isLength({ max: 500 }),
  body('content').optional().isString(),
  body('coverImage').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['draft', 'published']),
  body('category').optional({ nullable: true }).custom((value) => {
    if (value === null || value === '') return true;
    return /^[a-fA-F0-9]{24}$/.test(String(value));
  }),
  body('tags').optional().custom((value) => {
    if (Array.isArray(value)) {
      return value.every((item) => /^[a-fA-F0-9]{24}$/.test(String(item)));
    }
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean).every((item) => /^[a-fA-F0-9]{24}$/.test(String(item).trim()));
    }
    return false;
  }),
  body('isTop').optional().isBoolean(),
  body('seoTitle').optional().trim().isLength({ max: 200 }),
  body('seoDescription').optional().trim().isLength({ max: 300 })
];
