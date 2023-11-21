import { Router } from 'express';
import authenticateJWT from '../middleware/authentication.js';
import {
  addSelfToTrip,
  createTrip,
  getTrip,
  getTripAttendees,
} from '../controllers/trip.js';
import {
  createPlace,
  deletePlace,
  getTripPlaces,
  putTripPlaces,
} from '../controllers/place.js';

const router = Router();

router.route('/v1/trips').post([authenticateJWT, createTrip]);
router.route('/v1/trips/:tripId').get([getTrip]);
router
  .route('/v1/trips/:tripId/attendees/')
  .get([authenticateJWT, getTripAttendees])
  .post([authenticateJWT, addSelfToTrip]);
router
  .route('/v1/trips/:tripId/places/')
  .get([getTripPlaces])
  .post([authenticateJWT, createPlace]);
router
  .route('/v1/trips/:tripId/places/:placeId')
  .put([authenticateJWT, putTripPlaces])
  .delete([authenticateJWT], deletePlace);

export default router;
