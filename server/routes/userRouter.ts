import { Router } from 'express';
import { getProfile } from '../controllers/user.js';
import authenticateJWT, { authenticateJWTOptional } from '../middleware/authentication.js';
import {
  getTripsAttendedByUser,
  getTripsCreatedByUser,
  getTripsSavedByUser,
} from '../controllers/trip.js';
import { saveTripByOthers } from '../controllers/place.js';

const router = Router();

router.route('/v1/users/profile').get([authenticateJWT, getProfile]);

router.route('/v1/users/:userId/trips').get([authenticateJWTOptional, getTripsCreatedByUser]);
router
  .route('/v1/users/:userId/trips/saved')
  .get([authenticateJWT, getTripsSavedByUser])
  .post([authenticateJWT, saveTripByOthers]);
router.route('/v1/users/:userId/trips/attended').get([authenticateJWT, getTripsAttendedByUser]);

export default router;
