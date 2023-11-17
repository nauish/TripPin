import { Request, Response } from 'express';
import { insertTrip, selectTripById } from '../models/trip.js';

export async function createTrip(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const {
      name,
      destination,
      budget,
      startDate,
      endDate,
      privacySetting,
      type,
      note,
    } = req.body;

    const tripId = await insertTrip({
      user_id: userId,
      destination,
      name,
      budget,
      start_date: startDate,
      end_date: endDate,
      type,
      privacy_setting: privacySetting ?? 'Private',
      note,
    });
    return res.json({ data: { tripId } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const data = await selectTripById(+tripId);
    return res.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
