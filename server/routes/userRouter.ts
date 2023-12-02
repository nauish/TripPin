import { Router } from 'express';
import { getProfile } from '../controllers/user.js';
import authenticateJWT, { authenticateJWTOptional } from '../middleware/authentication.js';
import { getTripsCreatedByUser } from '../controllers/trip.js';

const router = Router();

router.route('/v1/users/profile').get([authenticateJWT, getProfile]);

// Public trips
router.route('/v1/users/:userId/trips').get([authenticateJWTOptional, getTripsCreatedByUser]);

export default router;
