import pool from './dbPools.js';

/**
 * CREATE TABLE places (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  marker_type VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
 */

export async function insertPlace(place: {
  user_id: number;
  trip_id: number;
  day_number: number;
  name: string;
  longitude: number;
  latitude: number;
  marker_type?: string;
  type?: string;
  note?: string;
  start_hour?: number;
  end_hour?: number;
}) {
  const coordinates = `POINT (${place.longitude} ${place.latitude})`;
  const results = await pool.query(
    `
    INSERT INTO places (user_id, trip_id, day_number, name, location, marker_type, type, note, start_hour, end_hour)
    VALUES($1, $2, $3, $4, ST_GeomFromText($5, 4326), $6, $7, $8, $9, $10) RETURNING id
  `,
    [
      place.user_id,
      place.trip_id,
      place.day_number ?? 1,
      place.name,
      coordinates,
      place.marker_type,
      place.type,
      place.note,
      place.start_hour,
      place.end_hour,
    ],
  );
  const placeId = results.rows[0].id;
  if (placeId) return placeId;
  throw new Error('Insert new place failed');
}

export async function selectPlacesByTripId(TripId: number) {
  const results = await pool.query(
    `
    SELECT 
          *,
          ST_X(location::geometry) AS longitude,
          ST_Y(location::geometry) AS latitude
    FROM places p 
    WHERE p.trip_id = $1
  `,
    [TripId],
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
) {
  const results = await pool.query(
    `
    UPDATE places
    SET 
        day_number = $1,
        tag = $2,
        note = $3,
        start_hour = $4,
        end_hour = $5
    WHERE id = $6
    RETURNING id
  `,
    [day_number, note, tag, start_hour, end_hour, placeId],
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
