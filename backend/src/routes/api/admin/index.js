import { Router } from 'express';
import authMiddleware from '../../../middlewares/authMiddleware.js';
import validateRequest from '../../../middlewares/validateRequest.js';
import { getAccessCheck } from '../../../controllers/admin.controller.js';
import { getAdminDashboardOverview } from '../../../controllers/dashboard.controller.js';
import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticleById,
  listAdminArticles,
  updateAdminArticle
} from '../../../controllers/article.controller.js';
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategory,
  listAdminCategories,
  updateAdminCategory
} from '../../../controllers/category.controller.js';
import {
  createAdminTag,
  deleteAdminTag,
  getAdminTag,
  listAdminTags,
  updateAdminTag
} from '../../../controllers/tag.controller.js';
import {
  deleteAdminComment,
  listAdminCommentItems,
  updateAdminCommentStatus
} from '../../../controllers/comment.controller.js';
import {
  getAdminSiteConfig,
  updateAdminSiteConfig
} from '../../../controllers/site-config.controller.js';
import { uploadAdminImage } from '../../../controllers/upload.controller.js';
import uploadImageMiddleware from '../../../middlewares/uploadMiddleware.js';

import {
  adminArticleListQueryValidator,
  articleIdParamValidator,
  createArticleValidator,
  updateArticleValidator
} from '../../../validators/article.validator.js';
import {
  categoryIdParamValidator,
  createCategoryValidator,
  updateCategoryValidator
} from '../../../validators/category.validator.js';
import {
  adminCommentQueryValidator,
  commentIdParamValidator,
  updateCommentStatusValidator
} from '../../../validators/comment.validator.js';
import { updateSiteConfigValidator } from '../../../validators/site-config.validator.js';
import {
  createTagValidator,
  tagIdParamValidator,
  updateTagValidator
} from '../../../validators/tag.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/access-check', getAccessCheck);
router.get('/dashboard/overview', getAdminDashboardOverview);
router.post('/upload/image', uploadImageMiddleware, uploadAdminImage);

router.get('/articles', adminArticleListQueryValidator, validateRequest, listAdminArticles);
router.get('/articles/:id', articleIdParamValidator, validateRequest, getAdminArticleById);
router.post('/articles', createArticleValidator, validateRequest, createAdminArticle);
router.put('/articles/:id', updateArticleValidator, validateRequest, updateAdminArticle);
router.delete('/articles/:id', articleIdParamValidator, validateRequest, deleteAdminArticle);

router.get('/categories', listAdminCategories);
router.get('/categories/:id', categoryIdParamValidator, validateRequest, getAdminCategory);
router.post('/categories', createCategoryValidator, validateRequest, createAdminCategory);
router.put('/categories/:id', updateCategoryValidator, validateRequest, updateAdminCategory);
router.delete('/categories/:id', categoryIdParamValidator, validateRequest, deleteAdminCategory);

router.get('/tags', listAdminTags);
router.get('/tags/:id', tagIdParamValidator, validateRequest, getAdminTag);
router.post('/tags', createTagValidator, validateRequest, createAdminTag);
router.put('/tags/:id', updateTagValidator, validateRequest, updateAdminTag);
router.delete('/tags/:id', tagIdParamValidator, validateRequest, deleteAdminTag);

router.get('/comments', adminCommentQueryValidator, validateRequest, listAdminCommentItems);
router.put('/comments/:id/status', updateCommentStatusValidator, validateRequest, updateAdminCommentStatus);
router.delete('/comments/:id', commentIdParamValidator, validateRequest, deleteAdminComment);

router.get('/site/config', getAdminSiteConfig);
router.put('/site/config', updateSiteConfigValidator, validateRequest, updateAdminSiteConfig);

export default router;
