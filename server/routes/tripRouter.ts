import { Router } from 'express';
import authenticateJWT from '../middleware/authentication.js';
import {
  addSelfToTrip,
  createTrip,
  getTrip,
  getTripAttendees,
  getTripChat,
  putTrip,
} from '../controllers/trip.js';
import {
  createPlace,
  deletePlaceFromTrip,
  getTripPlaces,
  putPlace,
  putPlaces,
} from '../controllers/place.js';
import { getComments, postComment } from '../controllers/comment.js';

const router = Router();

router.route('/v1/trips').post([authenticateJWT, createTrip]);
router.route('/v1/trips/:tripId').get([getTrip]).put([putTrip]);
router
  .route('/v1/trips/:tripId/attendees/')
  .get([authenticateJWT, getTripAttendees])
  .post([authenticateJWT, addSelfToTrip]);
router
  .route('/v1/trips/:tripId/places/')
  .get([getTripPlaces])
  .post([authenticateJWT, createPlace])
  .put([authenticateJWT, putPlaces]);
router
  .route('/v1/trips/:tripId/places/:placeId')
  .put([authenticateJWT, putPlace])
  .delete([authenticateJWT, deletePlaceFromTrip]);
router.route('/v1/trips/:tripId/chat').get([getTripChat]);
router.route('/v1/trips/:tripId/comments').get([getComments]).post([postComment]);

export default router;
