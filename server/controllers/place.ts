import { Request, Response } from 'express';
import {
  deletePlace,
  insertPlace,
  selectPlacesByTripId,
  updatePlace,
  updatePlaceOrder,
} from '../models/place.js';
import { Place } from '../types/trip.js';
import { ValidationError, handleError } from '../utils/errorHandler.js';

export async function createPlace(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { name, location, markerType, type, note, tripId, dayNumber, address } = req.body;
    const { lat, lng } = location;

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
      throw new ValidationError('新增景點失敗');
    }

    res.json({ data: { placeId } });
  } catch (err) {
    handleError(err, res);
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

    res.json({ maxDayNumber, data, spending });
  } catch (error) {
    handleError(error, res);
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
    res.json({ data: result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function deletePlaceFromTrip(req: Request, res: Response) {
  try {
    const { placeId } = req.params;
    const result = await deletePlace(+placeId);

    if (!result) throw new Error('刪除景點失敗');

    res.json({ data: { message: '成功刪除' } });
  } catch (err) {
    handleError(err, res);
  }
}

export async function putPlaceOrder(req: Request, res: Response) {
  try {
    const array = req.body;
    await updatePlaceOrder(array);
    res.json({ data: { message: '成功更新' } });
  } catch (err) {
    handleError(err, res);
  }
}

function calculateDistance(place1: Place, place2: Place) {
  const longitudeDiff = place2.longitude - place1.longitude;
  const latitudeDiff = place2.latitude - place1.latitude;
  const distance = Math.sqrt(longitudeDiff ** 2 + latitudeDiff ** 2);
  return distance;
}

export function optimizeRoute(places: Place[]): Place[] {
  if (places.length === 0) return [];
  const unvisitedPlaces = new Set(places);
  const route: Place[] = [];

  let currentPlace = unvisitedPlaces.values().next().value;
  unvisitedPlaces.delete(currentPlace);
  route.push(currentPlace);

  const calculateNearestPlaces = (thisPlace: Place) => {
    let nearestPlace: Place | null = null;
    let secondNearestPlace: Place | null = null;
    let shortestDistance = Infinity;
    let secondShortestDistance = Infinity;

    unvisitedPlaces.forEach((unvisitedPlace) => {
      const distance = calculateDistance(thisPlace, unvisitedPlace);

      if (distance < shortestDistance) {
        secondNearestPlace = nearestPlace;
        nearestPlace = unvisitedPlace;
        secondShortestDistance = shortestDistance;
        shortestDistance = distance;
      } else if (distance < secondShortestDistance) {
        secondNearestPlace = unvisitedPlace;
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
    updatePlaceOrder(route.map((place, index) => ({ id: +place.id, order: index })));
    res.json({ data: { message: '成功最佳化路線' } });
  } catch (error) {
    handleError(error, res);
  }
}
