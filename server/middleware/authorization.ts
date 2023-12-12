import { Request, Response, NextFunction } from 'express';
import { selectAttendeesByTripIdAndUserId } from '../models/user.js';
import { selectPrivacyByTripId } from '../models/trip.js';
import PRIVACY_SETTING from '../constants/privacySetting.js';

export async function checkTripAttendeesOptional(req: Request, res: Response, next: NextFunction) {
  try {
    const { tripId } = req.params;
    const { userId } = res.locals;

    const privacySetting = await selectPrivacyByTripId(+tripId);
    if (privacySetting === PRIVACY_SETTING.PUBLIC) return next();
    if (!userId) throw new Error("You don't have permission to access this trip");
    const result = await selectAttendeesByTripIdAndUserId(+tripId, userId);
    if (!result) throw new Error("You don't have permission to access this trip");
    return next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function checkTripAttendees(req: Request, res: Response, next: NextFunction) {
  try {
    const { tripId } = req.params;
    const { userId } = res.locals;

    if (!userId) throw new Error("You don't have permission to access this trip");
    const result = await selectAttendeesByTripIdAndUserId(+tripId, userId);
    console.log(result);
    if (!result || result.role !== 'attendee') {
      throw new Error('您沒有權限編輯這個行程');
    }

    return next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
