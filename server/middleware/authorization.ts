import { Request, Response, NextFunction } from 'express';
import { selectAttendeesByTripIdAndUserId } from '../models/user.js';
import { selectPrivacyByTripId } from '../models/trip.js';
import PRIVACY_SETTING from '../constants/privacySetting.js';
import { ValidationError, handleError } from '../utils/errorHandler.js';

export async function checkTripAttendeesOptional(req: Request, res: Response, next: NextFunction) {
  try {
    const { tripId } = req.params;
    const { userId } = res.locals;

    const privacySetting = await selectPrivacyByTripId(+tripId);
    if (privacySetting === PRIVACY_SETTING.PUBLIC) return next();
    if (!userId) throw new ValidationError('您並沒有登入，無法存取私人行程');
    const result = await selectAttendeesByTripIdAndUserId(+tripId, userId);
    if (!result) throw new ValidationError('您並非此行程私人行程的參加者');
    next();
  } catch (error) {
    handleError(error, res);
  }
  return undefined;
}

export async function checkTripAttendees(req: Request, res: Response, next: NextFunction) {
  try {
    const { tripId } = req.params;
    const { userId } = res.locals;

    if (!userId) throw new Error('您沒有權限編輯這個行程');
    const result = await selectAttendeesByTripIdAndUserId(+tripId, userId);
    if (!result || result.role !== 'attendee') {
      throw new Error('您沒有權限編輯這個行程');
    }

    next();
  } catch (error) {
    handleError(error, res);
  }
}
