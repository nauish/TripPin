import { Router } from 'express';
import authenticateJWT from '../middleware/authentication.js';
import { createPlace } from '../controllers/place.js';

const router = Router();

router.route('/v1/place').post([authenticateJWT, createPlace]);

export default router;
