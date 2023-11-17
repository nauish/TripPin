import { Router } from 'express';
import authenticateJWT from '../middleware/authentication.js';
import { createTrip, getTrip } from '../controllers/trip.js';

const router = Router();

router.route('/v1/trip').post([authenticateJWT, createTrip]);
router.route('/v1/trip/:tripId').get([getTrip]);

export default router;
