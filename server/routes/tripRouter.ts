import { Router } from 'express';
import authenticateJWT, { authenticateJWTOptional } from '../middleware/authentication.js';
import {
  addUserToTrip,
  copyTrip,
  createTrip,
  getTrip,
  getTripAttendees,
  getTripChat,
  putTrip,
} from '../controllers/trip.js';
import { createPlace, deletePlaceFromTrip, getTripPlaces, putPlace } from '../controllers/place.js';
import { getComments, postComment } from '../controllers/comment.js';
import { getChatCompletion } from '../controllers/chat.js';

const router = Router();

router.route('/v1/trips').post([authenticateJWT, createTrip]);
router.route('/v1/trips/:tripId').get([authenticateJWTOptional, getTrip]).put([putTrip]);
router
  .route('/v1/trips/:tripId/attendees/')
  .get([authenticateJWT, getTripAttendees])
  .post([authenticateJWT, addUserToTrip]);
router
  .route('/v1/trips/:tripId/places/')
  .get([authenticateJWTOptional, getTripPlaces])
  .post([authenticateJWT, createPlace])
  .put([authenticateJWT, copyTrip]);
router
  .route('/v1/trips/:tripId/places/:placeId')
  .put([authenticateJWT, putPlace])
  .delete([authenticateJWT, deletePlaceFromTrip]);
router
  .route('/v1/trips/:tripId/chat')
  .get([getTripChat])
  .post([authenticateJWT, getChatCompletion]);
router.route('/v1/trips/:tripId/comments').get([getComments]).post([postComment]);

export default router;
