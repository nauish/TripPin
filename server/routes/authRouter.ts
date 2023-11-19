import { Router } from 'express';
import { body } from 'express-validator';
import handleResult from '../middleware/validatorResultHandler.js';
import { loginUser, createUser } from '../controllers/user.js';

const router = Router();

router
  .route('/v1/auth/signup')
  .post([
    body('email').isEmail().normalizeEmail(),
    body('name').exists().notEmpty().trim(),
    body('password').exists().notEmpty().isLength({ min: 6 }),
    handleResult,
    createUser,
  ]);

router.route('/v1/auth/login').post(loginUser);

export default router;
