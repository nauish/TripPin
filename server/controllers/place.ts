import { Request, Response } from 'express';
import { insertPlace, selectPlacesByTripId } from '../models/place.js';

export async function createPlace(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, location, markerType, type, note } = req.body;
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

    return res.json({ data: { placeId } });
  } catch (err) {
    if (err instanceof Error) {
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
