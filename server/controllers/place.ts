import { Request, Response } from 'express';
import { deletePlace, insertPlace, selectPlacesByTripId, updatePlace } from '../models/place.js';

export async function createPlace(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, location, markerType, type, note, tripId, dayNumber, startHour, endHour } =
      req.body;
    const { lat, lng } = location;

    const placeId = await insertPlace({
      user_id: userId,
      trip_id: tripId,
      day_number: dayNumber,
      name,
      latitude: lat,
      longitude: lng,
      marker_type: markerType,
      type,
      note,
      start_hour: startHour,
      end_hour: endHour,
    });

    if (!placeId) {
      throw new Error('Insert new place failed');
    }

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
    const places = await selectPlacesByTripId(+tripId);

    return res.json({ data: places });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function putPlace(req: Request, res: Response) {
  try {
    const { placeId } = req.params;
    const { dayNumber, tag, note, startHour, endHour } = req.body;
    const result = await updatePlace(+placeId, dayNumber, tag, note, startHour, endHour);
    return res.json({ data: result });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function deletePlaceFromTrip(req: Request, res: Response) {
  try {
    const { placeId } = req.params;
    const result = await deletePlace(+placeId);

    if (!result) {
      throw new Error('Delete place failed');
    }

    return res.json({ data: { message: 'Successfully Deleted' } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
