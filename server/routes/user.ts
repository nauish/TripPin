import { Router } from 'express';
import { body } from 'express-validator';
import handleResult from '../middleware/validatorResultHandler.js';
import * as userController from '../controllers/user.js';
import authenticateJWT from '../middleware/authentication.js';

const router = Router();

router
  .route('/user/signup')
  .post([
    body('email').isEmail().normalizeEmail(),
    body('name').exists().notEmpty().trim(),
    body('password').exists().notEmpty(),
    handleResult,
    userController.createUser,
  ]);

router.route('/user/login').post(userController.loginUser);
router.route('/user/profile').get([authenticateJWT, userController.getProfile]);

export default router;
