import { body, param, query } from 'express-validator';

export const commentIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid comment id')
];

export const articleIdParamValidator = [
  param('articleId').isMongoId().withMessage('Invalid article id')
];

export const adminCommentQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('articleId').optional().isMongoId()
];

export const createCommentValidator = [
  body('article').isMongoId().withMessage('article is required'),
  body('nickname').trim().notEmpty().withMessage('nickname is required').isLength({ max: 64 }),
  body('email').trim().notEmpty().withMessage('email is required').isEmail().withMessage('email is invalid'),
  body('website').optional().trim().isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('content is required').isLength({ max: 1000 })
];

export const updateCommentStatusValidator = [
  ...commentIdParamValidator,
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];