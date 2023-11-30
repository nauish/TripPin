// import { z } from 'zod';
import pool from './dbPools.js';

// const TripSchema = z.object({
//   id: z.coerce.number(),
//   user_id: z.coerce.number(),
//   name: z.string(),
//   destination: z.string().nullable(),
//   start_date: z.date().nullable(),
//   end_date: z.date().nullable(),
//   budget: z.number().nullable(),
//   type: z.string().nullable(),
//   privacy_setting: z.string(),
//   note: z.string().nullable(),
// });

/**
  CREATE TABLE attendees (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
 */

export async function insertTrip(trip: {
  user_id: number;
  name: string;
  destination?: string;
  start_date?: Date;
  end_date?: Date;
  budget?: number;
  type?: string;
  privacy_setting: string;
  note?: string;
}) {
  const results = await pool.query(
    `
    INSERT INTO trips (user_id, name, destination, start_date, end_date, budget, type, privacy_setting, note)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
  `,
    [
      trip.user_id,
      trip.name,
      trip.destination,
      trip.start_date,
      trip.end_date,
      trip.budget,
      trip.type,
      trip.privacy_setting,
      trip.note,
    ],
  );
  const tripId = results.rows[0].id;
  if (tripId) return tripId;
  throw new Error('Insert trip failed');
}

export async function selectTripById(id: number) {
  const results = await pool.query(
    `
    SELECT * FROM trips t
    WHERE t.id = $1
  `,
    [id],
  );

  return results.rows;
}

export async function insertAttendee(userId: number, tripId: number) {
  const results = await pool.query(
    `
    INSERT INTO attendees (trip_id, user_id) 
    VALUES ($1, $2) RETURNING user_id
    `,
    [tripId, userId],
  );

  const result = results.rows[0];
  if (result) return result;
  throw new Error('Insert new attendee failed');
}

export async function selectAttendeesByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT
          u.id,
          u.name
    FROM attendees a
    LEFT JOIN users u
    ON a.user_id = u.id
    WHERE a.trip_id = $1
    `,
    [tripId],
  );
  return results.rows;
}

export async function selectTripsByUserId(userId: number) {
  const results = await pool.query('SELECT * FROM trips WHERE user_id = $1', [userId]);
  const trips = results.rows;
  return trips;
}

export async function updateTrip(trip: {
  id: number;
  name: string;
  destination: string;
  start_date: Date;
  end_date: Date;
  budget: number;
  type: string;
  privacy_setting: string;
  note: string;
}) {
  const results = await pool.query(
    `
      UPDATE trips
      SET 
          name = $2, 
          destination = $3, 
          start_date = $4, 
          end_date = $5, 
          budget = $6, 
          type = $7, 
          privacy_setting = $8, 
          note = $9
      WHERE id = $1
    `,
    [
      trip.id,
      trip.name,
      trip.destination,
      trip.start_date,
      trip.end_date,
      trip.budget,
      trip.type,
      trip.privacy_setting,
      trip.note,
    ],
  );
  return results.rows;
}
