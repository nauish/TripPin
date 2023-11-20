import { Request, Response } from 'express';
import {
  insertPlace,
  insertPlaceToTripPlaces,
  selectPlacesByTripId,
} from '../models/place.js';

export async function createPlace(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, location, markerType, type, note, tripId } = req.body;
    const { lat, lng } = location;

    const placeId = await insertPlace({
      user_id: userId,
      name,
      latitude: lat,
      longitude: lng,
      marker_type: markerType,
      type,
      note,
    });

    if (!placeId) {
      throw new Error('Insert new place failed');
    }

    const DEFAULT_DAY = 1;

    await insertPlaceToTripPlaces(placeId, tripId, DEFAULT_DAY);

    return res.json({ data: { placeId } });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('duplicate key')) {
        return res.status(400).json({ error: 'Place already in the trip' });
      }
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripPlaces(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const data = await selectPlacesByTripId(+tripId);
    return res.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
