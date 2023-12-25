import { PoolClient } from 'pg';
import PRIVACY_SETTING from '../constants/privacySetting.js';
import { Trip } from '../types/trip.js';
import pool from './dbPools.js';

export async function insertTrip(
  trip: {
    user_id: number;
    name: string;
    destination?: string;
    start_date?: Date;
    end_date?: Date;
    budget?: number;
    type?: string;
    privacy_setting: string;
    note?: string;
    photo?: string;
  },
  transaction?: PoolClient,
) {
  const query = `
  INSERT INTO trips (user_id, name, destination, start_date, end_date, budget, type, privacy_setting, note, photo)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;

  const bindParams = [
    trip.user_id,
    trip.name,
    trip.destination,
    trip.start_date,
    trip.end_date,
    trip.budget,
    trip.type,
    trip.privacy_setting,
    trip.note,
    trip.photo,
  ];

  const results = await (transaction ?? pool).query(query, bindParams);

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

export async function selectCompleteTripInfo(id: number) {
  const results = await pool.query(
    `
    WITH PlaceDistances AS (
      SELECT
        *,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        ST_Distance(
          LAG(p.location::geometry) OVER (PARTITION BY p.trip_id ORDER BY p.dnd_order), 
          p.location::geometry
        ) AS distance_from_previous,
        LAG(p.name) OVER (PARTITION BY p.trip_id ORDER BY p.dnd_order) AS previous_place_name
      FROM places p
      WHERE p.trip_id = $1
    )
    SELECT
      json_build_object(
        'id', t.id,
        'name', t.name,
        'destination', t.destination,
        'start_date', t.start_date,
        'end_date', t.end_date,
        'budget', t.budget,
        'type', t.type,
        'privacy_setting', t.privacy_setting,
        'note', t.note,
        'photo', t.photo,
        'user', jsonb_build_object(
          'name', u.name
        ),
        'places', json_agg(
          DISTINCT jsonb_build_object(
            'id', pd.id,
            'name', pd.name,
            'day_number', pd.day_number,
            'tag', pd.tag,
            'type', pd.type,
            'note', pd.note,
            'dnd_order', pd.dnd_order,
            'budget', pd.budget,
            'marker_type', pd.marker_type,
            'start_hour', pd.start_hour,
            'end_hour', pd.end_hour,
            'longitude', pd.longitude,
            'latitude', pd.latitude,
            'address', pd.address,
            'distance_from_previous', pd.distance_from_previous
          )
        )
      )
    FROM trips t
    RIGHT JOIN PlaceDistances pd ON pd.trip_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    GROUP BY t.id, u.id;
  `,
    [id],
  );

  const [trip] = results.rows;
  return (trip?.json_build_object as Trip) || null;
}

export async function insertAttendee(userId: number, tripId: number, transaction?: PoolClient) {
  const results = await (transaction ?? pool).query(
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
          u.name,
          u.email,
          u.photo,
          a.role
    FROM attendees a
    JOIN users u ON a.user_id = u.id
    WHERE a.trip_id = $1
    `,
    [tripId],
  );
  return results.rows;
}

export async function selectTripsByUserId(userId: number, isPrivateTrip: boolean) {
  const results = await pool.query(
    isPrivateTrip
      ? 'SELECT * FROM trips WHERE user_id = $1 ORDER BY id DESC'
      : 'SELECT * FROM trips WHERE user_id = $1  AND privacy_setting = $2 ORDER BY id DESC',
    isPrivateTrip ? [userId] : [userId, PRIVACY_SETTING.PUBLIC],
  );
  return results.rows;
}

export async function selectSavedTripsByUserId(userId: number): Promise<Trip[]> {
  const results = await pool.query(
    `
    SELECT
          t.id,
          t.name,
          t.destination,
          t.start_date,
          t.end_date,
          t.budget,
          t.type,
          t.privacy_setting,
          t.note,
          t.photo
    FROM trips t
    INNER JOIN saved_trips st
    ON t.id = st.trip_id
    WHERE st.user_id = $1
  `,
    [userId],
  );
  return results.rows;
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

export async function selectPrivacyByTripId(tripId: number): Promise<string> {
  const results = await pool.query(
    `
    SELECT privacy_setting FROM trips
    WHERE id = $1
  `,
    [tripId],
  );
  const [trip] = results.rows;
  return trip.privacy_setting;
}

export async function selectLatestPublicTrips(page: number) {
  const limit = 6;
  const offset = (page - 1) * limit;

  const results = await pool.query(
    `
    SELECT
          t.id,
          t.name,
          t.destination,
          t.start_date,
          t.end_date,
          t.budget,
          t.type,
          t.privacy_setting,
          t.note,
          t.photo,
          u.name AS user_name,
          u.photo AS user_photo
    FROM trips t
    INNER JOIN users u
    ON t.user_id = u.id
    WHERE t.privacy_setting = $1
    ORDER BY t.id DESC
    LIMIT $2 OFFSET $3
  `,
    [PRIVACY_SETTING.PUBLIC, limit + 1, offset],
  );

  return results.rows;
}

export async function selectMostHighlyRatedTrips(page: number) {
  const limit = 6;
  const offset = (page - 1) * limit;

  const results = await pool.query(
    `
    SELECT
          t.id,
          t.name,
          t.destination,
          t.start_date,
          t.end_date,
          t.budget,
          t.type,
          t.privacy_setting,
          t.note,
          t.photo,
          AVG(tc.rating) AS average_rating
      FROM trips t
      LEFT JOIN trip_comments tc ON t.id = tc.trip_id
      WHERE t.privacy_setting = $1
      GROUP BY t.id
      ORDER BY average_rating DESC NULLS LAST, t.id DESC
      LIMIT $2 OFFSET $3
    `,
    [PRIVACY_SETTING.PUBLIC, limit + 1, offset],
  );

  return results.rows;
}

export async function selectMostClickedTrips(page: number) {
  const limit = 6;
  const offset = (page - 1) * limit;

  const results = await pool.query(
    `
    SELECT
          t.id,
          t.name,
          t.destination,
          t.start_date,
          t.end_date,
          t.budget,
          t.type,
          t.privacy_setting,
          t.note,
          t.photo,
          t.click_count AS clicks
      FROM trips t
      WHERE t.privacy_setting = $1
      ORDER BY clicks DESC, t.id DESC
      LIMIT $2 OFFSET $3
    `,
    [PRIVACY_SETTING.PUBLIC, limit + 1, offset],
  );

  return results.rows;
}

export async function updateTripClickCount(tripId: number) {
  const results = await pool.query(
    `
    UPDATE trips
    SET click_count = click_count + 1
    WHERE id = $1
  `,
    [tripId],
  );
  return results.rows;
}

export async function deleteFromTripsByTripId(tripId: number) {
  const results = await pool.query(
    `
    DELETE FROM trips
    WHERE id = $1
  `,
    [tripId],
  );
  return results.rowCount ?? 0;
}

export async function insertSavedTrip(userId: number, tripId: number) {
  const results = await pool.query(
    `
    INSERT INTO saved_trips (user_id, trip_id)
    VALUES ($1, $2)
    RETURNING trip_id
  `,
    [userId, tripId],
  );
  const result = results.rows[0];
  if (result) return result;
  throw new Error('Insert trip save failed');
}

export async function deleteSavedTrip(userId: number, tripId: number) {
  const command = await pool.query(
    `
    DELETE FROM saved_trips WHERE user_id = $1 AND trip_id = $2
    `,
    [userId, tripId],
  );

  if (command.rowCount === 0) return false;
  return true;
}
