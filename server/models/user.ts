import { z } from 'zod';
import pool from './dbPools.js';

const UserSchema = z.object({
  id: z.coerce.number(),
  email: z.string(),
  name: z.string(),
  photo: z.string().nullish(),
  provider_name: z.string(),
  token: z.string(),
});

const AttendeeSchema = z.object({
  user_id: z.coerce.number(),
  role: z.string().optional(),
});

export async function insertUser(
  email: string,
  name: string,
  providerName: string,
  token: string,
  photo: string = '',
): Promise<string> {
  const results = await pool.query(
    `
  INSERT INTO users (email, name, photo, provider_name, token)
  VALUES($1, $2, $3, $4, $5) RETURNING id
`,
    [email, name, photo, providerName, token],
  );
  const userId = results.rows[0].id;
  if (userId) return userId;
  throw new Error('insert user failed');
}

export async function selectUserByEmail(email: string) {
  const results = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
  `,
    [email],
  );
  const [user] = z.array(UserSchema).parse(results.rows);
  return user;
}

export async function selectUserById(id: number) {
  const results = await pool.query(
    `
    SELECT * FROM users
    WHERE id = $1
  `,
    [id],
  );
  const [user] = z.array(UserSchema).parse(results.rows);
  return user;
}

export async function selectAttendeesByTripIdAndUserId(tripId: number, userId: number) {
  const results = await pool.query(
    `
    SELECT * FROM attendees a
    WHERE trip_id = $1 AND a.user_id = $2
    `,
    [tripId, userId],
  );

  const [attendees] = z.array(AttendeeSchema).parse(results.rows);
  return attendees;
}

export async function selectTripsAttendedByUser(userId: number) {
  const results = await pool.query(
    `
    SELECT t.id, t.name, t.destination, t.start_date, t.end_date, t.budget, t.type, t.privacy_setting, t.note, t.photo
    FROM trips t
    JOIN attendees a ON t.id = a.trip_id
    WHERE a.user_id = $1 and t.user_id != $1
    `,
    [userId],
  );

  return results.rows;
}

export async function updateUserRole(tripId: number, userId: number, role: string) {
  const results = await pool.query(
    `
    UPDATE attendees
    SET role = $1
    WHERE trip_id = $2 AND user_id = $3
    `,
    [role, tripId, userId],
  );
  return results.rowCount;
}

export async function deleteAttendeeFromTrip(tripId: number, userId: number) {
  const results = await pool.query(
    `
    DELETE FROM attendees
    WHERE trip_id = $1 AND user_id = $2
    `,
    [tripId, userId],
  );
  return results.rowCount;
}
