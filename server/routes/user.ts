import { Router } from 'express';
import { body } from 'express-validator';
import handleResult from '../middleware/validatorResultHandler.js';
import * as userController from '../controllers/user.js';
import authenticateJWT from '../middleware/authentication.js';

const router = Router();

router
  .route('/v1/user/signup')
  .post([
    body('email').isEmail().normalizeEmail(),
    body('name').exists().notEmpty().trim(),
    body('password').exists().notEmpty().isLength({ min: 6 }),
    handleResult,
    userController.createUser,
  ]);

router.route('/v1/user/login').post(userController.loginUser);
router
  .route('/v1/user/profile')
  .get([authenticateJWT, userController.getProfile]);

export default router;
