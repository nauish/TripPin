import { Place } from '../types/trip.js';
import { ValidationError } from '../utils/errorHandler.js';
import pool from './dbPools.js';

type PlaceInput = {
  user_id: number;
  trip_id: number;
  day_number: number;
  name: string;
  longitude: number;
  latitude: number;
  marker_type: string;
  type?: string;
  note?: string;
  start_hour?: string;
  end_hour?: string;
  tag?: string;
  address: string;
};

export async function insertPlace({
  user_id,
  trip_id,
  day_number,
  name,
  longitude,
  latitude,
  marker_type,
  type,
  note,
  start_hour,
  end_hour,
  tag,
  address,
}: PlaceInput) {
  const coordinates = `POINT (${longitude} ${latitude})`;
  const results = await pool.query(
    `
    INSERT INTO places (
      user_id,
      trip_id,
      day_number,
      name,
      location,
      marker_type,
      type,
      note,
      start_hour,
      end_hour,
      tag,
      address
      )
    VALUES ($1, $2, $3, $4, ST_GeographyFromText($5), $6, $7, $8, $9, $10, $11, $12) RETURNING id
  `,
    [
      user_id,
      trip_id,
      day_number,
      name,
      coordinates,
      marker_type,
      type,
      note,
      start_hour,
      end_hour,
      tag,
      address,
    ],
  );
  const placeId = results.rows[0].id;
  if (placeId) return placeId;
  throw new Error('Insert new place failed');
}

export async function selectPlacesByTripId(tripId: number): Promise<Place[]> {
  if (Number.isNaN(tripId)) throw new ValidationError('Invalid trip id');
  const results = await pool.query(
    `
      SELECT
        p.*,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        ST_Distance(
          LAG(p.location::geometry) OVER (PARTITION BY p.trip_id ORDER BY p.day_number, p.dnd_order), 
          p.location::geometry
        ) AS distance_from_previous,
        LAG(p.name) OVER (PARTITION BY p.trip_id ORDER BY p.day_number, p.dnd_order) AS previous_place_name
      FROM places p
      WHERE p.trip_id = $1
    `,
    [tripId],
  );

  return results.rows;
}

export async function updatePlace(
  placeId: number,
  day_number: number,
  tag: number,
  note: string,
  start_hour: number,
  end_hour: number,
  budget: number,
) {
  if (Number.isNaN(placeId)) throw new ValidationError('Invalid place id');
  const results = await pool.query(
    `
    UPDATE places
    SET 
        day_number = $1,
        tag = $2,
        note = $3,
        start_hour = $4,
        end_hour = $5,
        budget = $6
    WHERE id = $7
    RETURNING id
  `,
    [day_number, tag, note, start_hour, end_hour, budget, placeId],
  );
  const result = results.rows[0];
  if (result) return result;
  throw new Error('Update place failed');
}

export async function deletePlace(placeId: number) {
  const command = await pool.query(
    `
    DELETE FROM places WHERE id = $1
    `,
    [placeId],
  );

  if (command.rowCount === 0) return false;
  return true;
}

export async function updatePlaceOrder(array: { order: number; id: number }[]) {
  const orders = array.map((v) => v.order);
  const ids = array.map((v) => Number(v.id));

  const results = await pool.query(
    `
    UPDATE places p
    SET dnd_order = new."order"
    FROM (
      SELECT * FROM UNNEST($1::int[], $2::int[]) AS new ("order", "id")
    ) AS new
    WHERE p.id = new.id
  `,
    [orders, ids],
  );

  if (results) return results.rowCount;
  throw new Error('更新地點失敗');
}
