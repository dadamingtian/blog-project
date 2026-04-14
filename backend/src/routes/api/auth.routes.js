import { Router } from 'express';
import { login, profile } from '../../controllers/auth.controller.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { loginValidator } from '../../validators/auth.validator.js';

const router = Router();

router.post('/login', loginValidator, validateRequest, login);
router.get('/profile', authMiddleware, profile);

export default router;