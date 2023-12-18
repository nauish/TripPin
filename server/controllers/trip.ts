import { Request, Response } from 'express';
import {
  deleteFromTripsTripId,
  insertAttendee,
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
import { ValidationError } from '../middleware/errorHandler.js';
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
    const tripId = await insertTrip({
      user_id: userId,
      destination,
      name,
      budget,
      start_date: startDate === '' ? null : startDate,
      end_date: endDate === '' ? null : endDate,
      type,
      privacy_setting: privacySetting ?? PRIVACY_SETTING.PUBLIC,
      note,
      photo,
    });
    await insertAttendee(userId, tripId);
    await client.query('COMMIT');
    return res.json({ data: { tripId } });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: '未預期的錯誤' });
  } finally {
    client.release();
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const data = await selectTripById(+tripId);
    return res.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripAttendees(req: Request, res: Response) {
  const { tripId } = req.params;
  const attendees = await selectAttendeesByTripId(+tripId);

  return res.status(200).json({ tripId, attendees });
}

export async function addUserToTrip(req: Request, res: Response) {
  const { email } = req.body;
  const { tripId } = req.params;
  if (!email) {
    return res.status(400).json({ error: '請輸入email' });
  }
  try {
    const userIdFromDB = await selectUserByEmail(email);
    if (!userIdFromDB) {
      return res.status(400).json({ error: '使用者不存在' });
    }
    const data = await insertAttendee(userIdFromDB.id, +tripId);

    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(400).json({ error: '使用者已經在行程中' });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripsCreatedByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    let data = [];

    if (+userId === res.locals.userId) data = await selectTripsByUserId(+userId, true);
    else data = await selectTripsByUserId(+userId, false);

    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripsSavedByUser(req: Request, res: Response) {
  try {
    const { userId } = res.locals;
    const data = await selectSavedTripsByUserId(+userId);

    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripChat(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const results = await selectChatByTripId(+tripId);
    return res.status(200).json({ data: results });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
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
    return res.status(200).json({ data: { message: '更新景點成功' } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function copyTrip(req: Request, res: Response) {
  const { tripId } = req.params;
  const { userId } = res.locals;
  try {
    const oldTrip = await selectTripById(+tripId);
    const oldTripPlaces = await selectPlacesByTripId(+tripId);
    const newTripId = await insertTrip({
      user_id: userId,
      destination: oldTrip[0].destination,
      name: oldTrip[0].name,
      budget: oldTrip[0].budget,
      start_date: oldTrip[0].start_date,
      end_date: oldTrip[0].end_date,
      type: oldTrip[0].type,
      privacy_setting: oldTrip[0].privacy_setting,
      note: oldTrip[0].note,
      photo: oldTrip[0].photo,
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
    return res.status(200).json({ data: { id: newTripId } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getTripsAttendedByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const data = await selectTripsAttendedByUser(+userId);
    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function getPublicTrips(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort || 'latest';

    let selectTrips;
    if (sort === 'latest') {
      selectTrips = selectLatestPublicTrips;
    } else if (sort === 'top-rated') {
      selectTrips = selectMostHighlyRatedTrips;
    } else if (sort === 'hottest') {
      selectTrips = selectMostClickedTrips;
    } else {
      return res.status(400).json({ error: 'Invalid query' });
    }

    const data = await selectTrips(page);
    const nextPage = data.length > 6 ? page + 1 : undefined;
    const trips = data.slice(0, 6);

    return res.status(200).json({ data: trips, nextPage });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function recordClicks(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    await updateTripClickCount(+tripId);

    return res.status(200).json({ data: { message: 'Update clicks successfully' } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function deleteTrip(req: Request, res: Response) {
  try {
    await deleteFromTripsTripId(+req.params.tripId);
    return res.status(200).json({ data: { message: '刪除行程成功' } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
