import { Request, Response } from 'express';
import {
  deleteFromTripsByTripId,
  deleteSavedTrip,
  insertAttendee,
  insertSavedTrip,
  insertTrip,
  selectAttendeesByTripId,
  selectLatestPublicTrips,
  selectMostClickedTrips,
  selectMostHighlyRatedTrips,
  selectSavedTripsByUserId,
  selectTripById,
  selectTripsByUserId,
  updateTrip,
  updateTripClickCount,
} from '../models/trip.js';
import { selectChatByTripId } from '../models/chat.js';
import { insertPlace, selectPlacesByTripId } from '../models/place.js';
import { selectTripsAttendedByUser, selectUserByEmail } from '../models/user.js';
import { handleError, ValidationError } from '../utils/errorHandler.js';
import PRIVACY_SETTING from '../constants/privacySetting.js';
import pool from '../models/dbPools.js';

export async function createTrip(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const { userId } = res.locals;
    const { name, destination, budget, startDate, endDate, privacySetting, type, note, photo } =
      req.body;
    if (!name || !privacySetting) throw new ValidationError('缺少必要欄位');

    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('結束日期不可早於開始日期');
    }

    await client.query('BEGIN');
    const tripId = await insertTrip(
      {
        user_id: userId,
        destination,
        name,
        budget,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        type,
        privacy_setting: privacySetting ?? PRIVACY_SETTING.PUBLIC,
        note,
        photo,
      },
      client,
    );
    await insertAttendee(userId, tripId, client);
    await client.query('COMMIT');
    res.json({ data: { tripId } });
  } catch (err) {
    await client.query('ROLLBACK');
    handleError(err, res);
  } finally {
    client.release();
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const data = await selectTripById(+tripId);
    res.json({ data });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getTripAttendees(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const attendees = await selectAttendeesByTripId(+tripId);
    res.json({ tripId, attendees });
  } catch (error) {
    handleError(error, res);
  }
}

export async function addUserToTrip(req: Request, res: Response) {
  const { email } = req.body;
  const { tripId } = req.params;
  if (!email || !tripId) throw new ValidationError('缺少必要欄位');
  try {
    const userIdFromDB = await selectUserByEmail(email);
    if (!userIdFromDB) throw new ValidationError('使用者不存在');
    const data = await insertAttendee(userIdFromDB.id, +tripId);
    res.json({ data });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('duplicate key value violates unique constraint')
    ) {
      return res.status(400).json({ error: '使用者已經在行程中' });
    }
    handleError(error, res);
  }
  return undefined;
}

export async function getTripsCreatedByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const data = await selectTripsByUserId(+userId, +userId === res.locals.userId);
    res.json({ data });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getTripsSavedByUser(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const data = await selectSavedTripsByUserId(+userId);

    res.json({ data });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getTripChat(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const results = await selectChatByTripId(+tripId);
    res.json({ data: results });
  } catch (error) {
    handleError(error, res);
  }
}

export async function putTrip(req: Request, res: Response) {
  const { tripId } = req.params;
  const { name, destination, budget, startDate, endDate, type, note } = req.body;
  const privacySetting = req.body.privacy_setting ?? PRIVACY_SETTING.PUBLIC;

  if (!name || !privacySetting) {
    throw new ValidationError('Missing required fields');
  }

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
    res.json({ data: { message: '更新景點成功' } });
  } catch (error) {
    handleError(error, res);
  }
}

export async function copyTrip(req: Request, res: Response) {
  const { tripId } = req.params;
  const { userId } = res.locals;
  try {
    const [oldTrip] = await selectTripById(+tripId);
    const oldTripPlaces = await selectPlacesByTripId(+tripId);
    const newTripId = await insertTrip({
      ...oldTrip,
      user_id: +userId,
    });
    oldTripPlaces.forEach(async (place) => {
      await insertPlace({
        trip_id: newTripId,
        user_id: userId,
        name: place.name,
        day_number: place.day_number,
        tag: place.tag,
        type: place.type,
        note: place.note,
        marker_type: place.marker_type,
        start_hour: place.start_hour,
        end_hour: place.end_hour,
        longitude: place.longitude,
        latitude: place.latitude,
        address: place.address,
      });
    });
    await insertAttendee(userId, +newTripId);
    res.json({ data: { id: newTripId } });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getTripsAttendedByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const data = await selectTripsAttendedByUser(+userId);
    res.json({ data });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getPublicTrips(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort || 'hottest';

    let selectTrips;
    if (sort === 'latest') {
      selectTrips = selectLatestPublicTrips;
    } else if (sort === 'top-rated') {
      selectTrips = selectMostHighlyRatedTrips;
    } else if (sort === 'hottest') {
      selectTrips = selectMostClickedTrips;
    } else throw new ValidationError('Invalid sort option');

    const data = await selectTrips(page);
    const nextPage = data.length > 6 ? page + 1 : undefined;
    const trips = data.slice(0, 6);

    res.json({ data: trips, nextPage });
  } catch (error) {
    handleError(error, res);
  }
}

export async function recordClicks(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    await updateTripClickCount(+tripId);

    res.json({ data: { message: true } });
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteTrip(req: Request, res: Response) {
  try {
    const isDeleted = await deleteFromTripsByTripId(+req.params.tripId);
    if (!isDeleted) throw new Error('刪除行程失敗');
    res.json({ data: { message: '刪除行程成功' } });
  } catch (error) {
    handleError(error, res);
  }
}

export async function saveTripByOthers(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const { isSaved, tripId } = req.body;

    if (isSaved) {
      const saved = await insertSavedTrip(userId, +tripId);
      if (!saved) throw new ValidationError('收藏行程失敗');
      return res.json({ data: { message: '加到收藏成功' } });
    }

    const isSuccess = await deleteSavedTrip(userId, +tripId);
    if (!isSuccess) throw new ValidationError('從收藏移除失敗');
    res.json({ data: { message: '從收藏移除成功' } });
  } catch (err) {
    handleError(err, res);
  }
  return undefined;
}
