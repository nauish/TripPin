import { Request, Response } from 'express';
import {
  insertAttendee,
  insertTrip,
  selectAttendeesByTripId,
  selectTripById,
  selectTripsByUserId,
  updateTrip,
} from '../models/trip.js';
import { selectChatByTripId } from '../models/chat.js';
import { selectPlacesByTripId } from '../models/place.js';
import { selectUserByEmail } from '../models/user.js';

export async function createTrip(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, destination, budget, startDate, endDate, privacySetting, type, note } = req.body;
    const tripId = await insertTrip({
      user_id: userId,
      destination,
      name,
      budget,
      start_date: startDate === '' ? null : startDate,
      end_date: endDate === '' ? null : endDate,
      type,
      privacy_setting: privacySetting ?? 'Private',
      note,
    });
    return res.json({ data: { tripId } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const data = await selectTripById(+tripId);

    if (data[0].privacy_setting === 'private') {
      const { userId } = res.locals;
      if (data[0].user_id !== userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    return res.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripAttendees(req: Request, res: Response) {
  const { tripId } = req.params;
  const attendees = await selectAttendeesByTripId(+tripId);

  return res.status(200).json({ tripId, attendees });
}

export async function addUserToTrip(req: Request, res: Response) {
  const { email, userId } = req.body;
  const { tripId } = req.params;

  try {
    if (userId) {
      await insertAttendee(+userId, +tripId);
      return res.status(200).json({ data: { message: 'Join trip successfully' } });
    }
    const userIdFromDB = await selectUserByEmail(email);
    if (!userIdFromDB) {
      return res.status(400).json({ error: 'User not found' });
    }
    await insertAttendee(userIdFromDB.id, +tripId);

    return res.status(200).json({ data: { message: 'Join trip successfully' } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(400).json({ error: 'User already joined trip' });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripsCreatedByUser(req: Request, res: Response) {
  const { userId } = res.locals;

  try {
    const data = await selectTripsByUserId(+userId);
    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripChat(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const results = await selectChatByTripId(+tripId);
    return res.status(200).json({ data: results });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function putTrip(req: Request, res: Response) {
  const { tripId } = req.params;
  const { name, destination, budget, startDate, endDate, privacySetting, type, note } = req.body;

  try {
    await updateTrip({
      id: +tripId,
      destination,
      name,
      budget,
      start_date: startDate,
      end_date: endDate,
      type,
      privacy_setting: privacySetting,
      note,
    });
    return res.status(200).json({ data: { message: 'Update trip successfully' } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
