import { body } from 'express-validator';

export const loginValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 32 })
    .withMessage('Username length must be between 3 and 32'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 64 })
    .withMessage('Password length must be between 6 and 64')
];