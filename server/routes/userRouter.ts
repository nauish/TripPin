import { Router } from 'express';
import { getProfile } from '../controllers/user.js';
import authenticateJWT from '../middleware/authentication.js';
import { getTripsCreatedByUser } from '../controllers/trip.js';

const router = Router();

router.route('/v1/users/profile').get([authenticateJWT, getProfile]);
router
  .route('/v1/users/:userId/trips')
  .get([authenticateJWT, getTripsCreatedByUser]);

export default router;
