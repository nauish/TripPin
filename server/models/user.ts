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

export async function insertUser(
  email: string,
  name: string,
  providerName: string,
  token: string,
  photo: string = '',
): Promise<number> {
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
