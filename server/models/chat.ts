import { z } from 'zod';
import pool from './dbPools.js';

const ChatSchema = z.object({
  message: z.string(),
  user_id: z.coerce.number(),
  name: z.string(),
});

export async function insertChat(message: string, tripId: number, userId: number) {
  const results = await pool.query(
    `
    INSERT INTO chat_messages (message, user_id, trip_id)
    VALUES ($1, $2, $3)
  `,
    [message, userId, tripId],
  );

  return results.rows;
}

export async function selectChatByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT u.id as user_id, u.name, message 
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE trip_id = $1
    ORDER BY cm.id ASC
    `,
    [tripId],
  );

  const result = z.array(ChatSchema).parse(results.rows);
  return result;
}
