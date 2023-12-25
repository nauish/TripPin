import { z } from 'zod';
import pool from './dbPools.js';

const ChatSchema = z.object({
  message: z.string(),
  user_id: z.coerce.number(),
  name: z.string(),
  timestamp: z.date(),
});

export async function insertChat(message: string, tripId: number, userId: number) {
  const results = await pool.query(
    `
    INSERT INTO chat_messages (message, user_id, trip_id)
    VALUES ($1, $2, $3)
  `,
    [message, userId, tripId],
  );

  return results.rows[0];
}

export async function selectChatByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT u.id as user_id, u.name, message, cm.timestamp
    FROM chat_messages cm
    INNER JOIN users u ON cm.user_id = u.id
    WHERE trip_id = $1
    ORDER BY cm.id ASC
    `,
    [tripId],
  );

  return z.array(ChatSchema).parse(results.rows);
}
