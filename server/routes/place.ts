import { Router } from 'express';
import authenticateJWT from '../middleware/authentication.js';
import { createPlace, getTripPlaces } from '../controllers/place.js';

const router = Router();

router.route('/v1/place').post([authenticateJWT, createPlace]);
router.route('/v1/trip/:tripId/places/').get([getTripPlaces]);

export default router;
