import { body } from 'express-validator';

export const updateSiteConfigValidator = [
  body('siteName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('siteDescription').optional().trim().isLength({ max: 300 }),
  body('aboutContent').optional().isString(),
  body('avatar').optional().trim().isLength({ max: 300 }),
  body('socialLinks').optional().isArray({ max: 20 }).withMessage('socialLinks must be array'),
  body('socialLinks.*.name').optional().trim().notEmpty().isLength({ max: 40 }),
  body('socialLinks.*.url').optional().trim().notEmpty().isLength({ max: 300 }),
  body('seoTitle').optional().trim().isLength({ max: 120 }),
  body('seoDescription').optional().trim().isLength({ max: 300 })
];