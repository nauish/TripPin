import { Request, Response } from 'express';
import {
  deletePlace,
  deleteSavedTrip,
  insertPlace,
  insertSavedTrip,
  selectPlacesByTripId,
  updatePlace,
  updatePlaceOrder,
} from '../models/place.js';
import { ValidationError } from '../middleware/errorHandler.js';

export async function createPlace(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, location, markerType, type, note, tripId, dayNumber, address } = req.body;
    const { lat, lng } = location;

    console.log(req.body);

    const placeId = await insertPlace({
      user_id: userId,
      trip_id: tripId,
      day_number: dayNumber ?? 1,
      name,
      latitude: lat,
      longitude: lng,
      marker_type: markerType,
      type,
      note,
      address,
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

    const maxDayNumber = places[0] ? places[0].max_day_number : 0;
    const allDays = Array.from({ length: maxDayNumber }, (_, index) => index + 1);

    const tripDays = allDays.map((dayNumber) => {
      const dayPlaces = places.filter((place) => place.day_number === dayNumber);
      return {
        dayNumber,
        places: dayPlaces.map((place) => ({ ...place })),
      };
    });

    return res.json({ data: tripDays });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(401).json({ error: error.message });
    console.error(error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
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

export async function putPlaceOrder(req: Request, res: Response) {
  try {
    const array = req.body;
    await Promise.all(
      array.map(async (item: { order: number; id: string }) => {
        const { order, id } = item;
        await updatePlaceOrder(order, +id);
      }),
    );
    return res.json({ data: { message: 'Successfully Updated' } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function saveTripByOthers(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { isSaved, tripId } = req.body;

    if (isSaved) {
      const saved = await insertSavedTrip(userId, +tripId);
      if (!saved) {
        throw new Error('Save trip failed');
      }
      return res.json({ data: { message: '加到收藏成功' } });
    }

    const isSuccess = await deleteSavedTrip(userId, +tripId);
    if (!isSuccess) {
      throw new Error('Delete saved trip failed');
    }
    return res.json({ data: { message: '從收藏移除成功' } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
