import { Router } from 'express';

import validateRequest from '../../../middlewares/validateRequest.js';
import {
  createPublicComment,
  listPublicArticleComments
} from '../../../controllers/comment.controller.js';
import {
  getPublicArticleBySlug,
  listPublicArchive,
  listPublicArticles,
  searchPublicArticles
} from '../../../controllers/article.controller.js';
import {
  listPublicArticlesByCategorySlug,
  listPublicCategories
} from '../../../controllers/category.controller.js';
import {
  listPublicArticlesByTagSlug,
  listPublicTags
} from '../../../controllers/tag.controller.js';
import { getPublicSiteConfig } from '../../../controllers/site-config.controller.js';

import {
  articleSlugParamValidator,
  publicArticleListQueryValidator,
  searchQueryValidator
} from '../../../validators/article.validator.js';
import { categorySlugParamValidator } from '../../../validators/category.validator.js';
import { paginationValidator } from '../../../validators/common.validator.js';
import { articleIdParamValidator, createCommentValidator } from '../../../validators/comment.validator.js';
import { tagSlugParamValidator } from '../../../validators/tag.validator.js';

const router = Router();

router.get('/articles', publicArticleListQueryValidator, validateRequest, listPublicArticles);
router.get('/articles/search', searchQueryValidator, validateRequest, searchPublicArticles);
router.get('/articles/archive/list', listPublicArchive);
router.get('/articles/:slug', articleSlugParamValidator, validateRequest, getPublicArticleBySlug);

router.get('/categories', paginationValidator, validateRequest, listPublicCategories);
router.get(
  '/categories/:slug/articles',
  [...categorySlugParamValidator, ...publicArticleListQueryValidator],
  validateRequest,
  listPublicArticlesByCategorySlug
);

router.get('/tags', paginationValidator, validateRequest, listPublicTags);
router.get(
  '/tags/:slug/articles',
  [...tagSlugParamValidator, ...publicArticleListQueryValidator],
  validateRequest,
  listPublicArticlesByTagSlug
);

router.post('/comments', createCommentValidator, validateRequest, createPublicComment);
router.get('/comments/article/:articleId', articleIdParamValidator, validateRequest, listPublicArticleComments);

router.get('/site/config', getPublicSiteConfig);

export default router;
