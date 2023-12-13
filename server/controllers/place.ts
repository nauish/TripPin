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
    const places = await selectPlacesByTripId(+req.params.tripId);

    const spending = places.reduce((acc, place) => {
      if (place.budget) {
        return acc + place.budget;
      }
      return acc;
    }, 0);

    const maxDayNumber = Math.max(...places.map((place) => place.day_number));
    const allDays = Array.from({ length: maxDayNumber }, (_, index) => index + 1);

    const data = allDays.map((dayNumber) => {
      const dayPlaces = places.filter((place) => place.day_number === dayNumber);
      return {
        dayNumber,
        places: dayPlaces,
      };
    });

    return res.json({ maxDayNumber, data, spending });
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
      +data.budget,
    );
    return res.json({ data: result });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: '出錯了！' });
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
    return res.status(500).json({ error: '出錯了！' });
  }
}

export async function deletePlaceFromTrip(req: Request, res: Response) {
  try {
    const { placeId } = req.params;
    const result = await deletePlace(+placeId);

    if (!result) throw new Error('刪除景點失敗');

    return res.json({ data: { message: '成功刪除' } });
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
    await updatePlaceOrder(array);
    return res.json({ data: { message: '成功更新' } });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: '出錯了' });
  }
}

export async function saveTripByOthers(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { isSaved, tripId } = req.body;

    if (isSaved) {
      const saved = await insertSavedTrip(userId, +tripId);
      if (!saved) {
        throw new Error('儲存景點失敗');
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
    return res.status(500).json({ error: '出錯了' });
  }
}
