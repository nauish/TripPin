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
import {
  createPlace,
  deletePlaceFromTrip,
  getTripPlaces,
  putPlace,
  putPlaceOrder,
} from '../controllers/place.js';
import { getComments, postComment } from '../controllers/comment.js';
import { getChatCompletion } from '../controllers/chat.js';
import {
  createChecklist,
  createChecklistItem,
  deleteChecklist,
  deleteChecklistItem,
  getChecklists,
  putChecklist,
  putChecklistItem,
} from '../controllers/checklist.js';
import { checkTripAttendees, checkTripAttendeesOptional } from '../middleware/attendees.js';
import generatePDF from '../controllers/pdf.js';

const router = Router();

router.route('/v1/trips').post([authenticateJWT, createTrip]);
router
  .route('/v1/trips/:tripId')
  .get([authenticateJWTOptional, checkTripAttendeesOptional, getTrip])
  .put([authenticateJWT, checkTripAttendees, putTrip]);
router
  .route('/v1/trips/:tripId/pdf')
  .get([authenticateJWTOptional, checkTripAttendeesOptional, generatePDF]);
router
  .route('/v1/trips/:tripId/attendees/')
  .get([authenticateJWTOptional, checkTripAttendeesOptional, getTripAttendees])
  .post([authenticateJWT, addUserToTrip]);
router
  .route('/v1/trips/:tripId/places/')
  .get([authenticateJWTOptional, checkTripAttendeesOptional, getTripPlaces])
  .post([authenticateJWT, checkTripAttendees, createPlace])
  .put([authenticateJWT, copyTrip]);
router
  .route('/v1/trips/:tripId/places/orders')
  .put([authenticateJWT, checkTripAttendees, putPlaceOrder]);
router
  .route('/v1/trips/:tripId/places/:placeId')
  .put([authenticateJWT, checkTripAttendees, putPlace])
  .delete([authenticateJWT, checkTripAttendees, deletePlaceFromTrip]);
router
  .route('/v1/trips/:tripId/chat')
  .get([authenticateJWT, checkTripAttendees, getTripChat])
  .post([authenticateJWT, checkTripAttendees, getChatCompletion]);
router.route('/v1/trips/:tripId/comments').get([getComments]).post([postComment]);
router
  .route('/v1/trips/:tripId/checklists')
  .get([authenticateJWTOptional, checkTripAttendeesOptional, getChecklists])
  .post([authenticateJWT, checkTripAttendees, createChecklist]);
router
  .route('/v1/trips/:tripId/checklists/:checklistId')
  .put([authenticateJWT, checkTripAttendees, putChecklist])
  .delete([authenticateJWT, checkTripAttendees, deleteChecklist]);
router
  .route('/v1/trips/:tripId/checklists/:checklistId/items')
  .post([authenticateJWT, checkTripAttendees, createChecklistItem]);
router
  .route('/v1/trips/:tripId/checklists/:checklistId/items/:itemId')
  .put([authenticateJWT, checkTripAttendees, putChecklistItem])
  .delete([authenticateJWT, checkTripAttendees, deleteChecklistItem]);

export default router;
