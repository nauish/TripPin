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

type Place = {
  id: number;
  longitude: number;
  latitude: number;
};

function calculateDistance(place1: Place, place2: Place) {
  const dx = place2.longitude - place1.longitude;
  const dy = place2.latitude - place1.latitude;
  return Math.sqrt(dx * dx + dy * dy);
}

export function optimizeRoute(places: Place[]): Place[] {
  const unvisitedPlaces = new Set(places);
  const route: Place[] = [];

  // Start from the first place as the current place
  let currentPlace = unvisitedPlaces.values().next().value;
  unvisitedPlaces.delete(currentPlace);
  route.push(currentPlace);

  const calculateNearestPlaces = (thisPlace: Place) => {
    let nearestPlace: Place | null = null;
    let secondNearestPlace: Place | null = null;
    let shortestDistance = Infinity;
    let secondShortestDistance = Infinity;

    // Find the nearest place
    unvisitedPlaces.forEach((unvisitedPlace) => {
      const distance = calculateDistance(thisPlace, unvisitedPlace);

      if (distance < shortestDistance) {
        // If the distance is shorter than the shortest distance
        secondNearestPlace = nearestPlace; // The second nearest place is the nearest place
        nearestPlace = unvisitedPlace; // Set the nearest place to the current place
        secondShortestDistance = shortestDistance;
        shortestDistance = distance;
      } else if (distance < secondShortestDistance) {
        secondNearestPlace = unvisitedPlace; // Set the second nearest place to the current place
        secondShortestDistance = distance;
      }
    });

    return { nearestPlace, secondNearestPlace };
  };

  while (unvisitedPlaces.size > 0) {
    const { nearestPlace, secondNearestPlace } = calculateNearestPlaces(currentPlace);

    if (nearestPlace) {
      currentPlace = nearestPlace;
      unvisitedPlaces.delete(currentPlace);
      route.push(currentPlace);
    }

    if (secondNearestPlace) {
      currentPlace = secondNearestPlace;
      unvisitedPlaces.delete(currentPlace);
      route.push(currentPlace);
    }
  }

  return route;
}

export async function optimizingPlaceRoute(req: Request, res: Response) {
  try {
    const places = await selectPlacesByTripId(+req.params.tripId);
    const route = optimizeRoute(places);
    updatePlaceOrder(route.map((place, index) => ({ id: place.id, order: index })));
    return res.json({ data: { message: '成功最佳化路線' } });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(401).json({ error: error.message });
    console.error(error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
