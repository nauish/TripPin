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
  name: string;
  destination?: string;
  longitude: number;
  latitude: number;
  marker_type?: string;
  type?: string;
  note?: string;
}) {
  const coordinates = `POINT ${place.longitude} ${place.latitude}`;
  const results = await pool.query(
    `
    INSERT INTO places (user_id, name, destination, location, marker_type, type, note)
    VALUES($1, $2, $3, ST_GeomFromText($4, 4326), $5, $6, $7) RETURNING id
  `,
    [
      place.user_id,
      place.name,
      place.destination,
      coordinates,
      place.marker_type,
      place.type,
      place.note,
    ],
  );
  const placeId = results.rows[0].id;
  if (placeId) return placeId;
  throw new Error('Insert new place failed');
}

export async function selectPlacesByTripId(TripId: number) {
  const results = await pool.query(
    `
    SELECT * FROM places p
    LEFT JOIN trip_places tp
    ON p.id = tp.place_id
    WHERE tp.trip_id = $1
  `,
    [TripId],
  );

  return results.rows;
}
