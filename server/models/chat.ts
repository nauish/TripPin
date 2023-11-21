import pool from './dbPools.js';

export async function insertChat(
  message: string,
  tripId: number,
  userId: number,
) {
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
    SELECT user_id, u.name, message, timestamp 
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE trip_id = $1
    `,
    [tripId],
  );

  return results.rows;
}
