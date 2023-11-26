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

    const tripDays = places.reduce((acc, place) => {
      const dayNumber = place.day_number;
      const day = acc.find((d: any) => d.dayNumber === dayNumber);

      if (!day) {
        acc.push({
          dayNumber,
          places: [
            {
              ...place,
            },
          ],
        });
      } else {
        // If day exists, push the place to its places array
        day.places.push({ ...place });
      }
      return acc;
    }, []);

    interface TripDay {
      dayNumber: number;
      places: any[];
    }

    tripDays.sort((a: TripDay, b: TripDay) => a.dayNumber - b.dayNumber);
    return res.json({ data: tripDays });
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
    const data = req.body;
    const result = await updatePlace(
      +placeId,
      data.day_number,
      data.tag,
      data.note,
      data.start_hour,
      data.end_hour,
    );
    return res.json({ data: result });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function putPlaces(req: Request, res: Response) {
  try {
    const data = req.body;
    console.log(data);
    return res.json({ data });
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
