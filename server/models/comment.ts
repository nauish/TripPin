import { z } from 'zod';
import pool from './dbPools.js';

const Comment = z.object({
  id: z.coerce.number(),
  user_id: z.coerce.number(),
  trip_id: z.coerce.number().optional(),
  username: z.string().optional(),
  comment: z.string(),
  rating: z.number(),
  created_at: z.coerce.date(),
});

export async function selectCommentsByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT
          tc.id AS id, 
          tc.user_id AS user_id, 
          u.name AS username,
          u.photo,
          tc.comment,
          tc.rating,
          tc.created_at
    FROM trip_comments tc
    LEFT JOIN users u ON tc.user_id = u.id
    WHERE trip_id = $1
    `,
    [tripId],
  );
  const result = z.array(Comment).parse(results.rows);
  return result;
}

export async function insertComment(comment: z.infer<typeof Comment>) {
  const results = await pool.query(
    `
    INSERT INTO trip_comments (user_id, trip_id, comment, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [comment.user_id, comment.trip_id, comment.comment, comment.rating],
  );
  return z.array(Comment).parse(results.rows);
}
