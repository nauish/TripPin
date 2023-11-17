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
    INSERT INTO trips (user_id, destination, start_date, end_date, budget, type, privacy_setting, note)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
  `,
    [
      trip.user_id,
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
    LEFT JOIN trip_places tp
    ON t.id = tp.trip_id
    LEFT JOIN places p
    ON tp.place_id = p.id
    WHERE t.id = $1
  `,
    [id],
  );

  return results.rows;
}
