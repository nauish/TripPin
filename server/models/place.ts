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
  longitude: number;
  latitude: number;
  marker_type?: string;
  type?: string;
  note?: string;
}) {
  const coordinates = `POINT (${place.longitude} ${place.latitude})`;
  const results = await pool.query(
    `
    INSERT INTO places (user_id, name, location, marker_type, type, note)
    VALUES($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6) RETURNING id
  `,
    [
      place.user_id,
      place.name,
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

export async function insertPlaceToTripPlaces(
  placeId: number,
  tripId: number,
  day: number,
) {
  const results = await pool.query(
    `
    INSERT INTO trip_places (place_id, trip_id, day_number)
    VALUES ($1, $2, $3) RETURNING place_id
  `,
    [placeId, tripId, day],
  );

  const placeTripId = results.rows[0].place_id;
  if (placeTripId) return placeTripId;
  throw new Error('Insert new place in this trip failed');
}

export async function updateTripPlaceDay(
  tripId: number,
  placeId: number,
  day: number,
) {
  const results = await pool.query(
    `
    UPDATE trip_places
    SET day_number = $3
    WHERE trip_id = $1 AND place_id = $2
    RETURNING day_number
  `,
    [tripId, placeId, day],
  );
  const result = results.rows[0].day_number;
  if (result) return result;
  throw new Error('Update place day failed');
}

export async function deletePlaceFromTripPlaces(
  placeId: number,
  tripId: number,
) {
  await pool.query(
    `
    DELETE FROM trip_places
    WHERE place_id = $1 AND trip_id = $2
  `,
    [placeId, tripId],
  );

  return true;
}
