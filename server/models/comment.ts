import { z } from 'zod';
import pool from './dbPools.js';

const Comment = z.object({
  id: z.coerce.number(),
  user_id: z.coerce.number(),
  trip_id: z.coerce.number().optional(),
  username: z.string().optional(),
  comment: z.string(),
  rating: z.number(),
  photos: z.array(z.string()).optional(),
  created_at: z.coerce.date(),
});

export async function selectCommentsByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT
          tc.id AS id, 
          tc.user_id AS user_id, 
          u.name AS username,
          u.photo AS user_photo,
          tc.comment,
          tc.rating,
          tc.created_at,
          tcp.photo
    FROM trip_comments tc
    LEFT JOIN trip_comment_photos tcp ON tc.id = tcp.trip_comment_id
    INNER JOIN users u ON tc.user_id = u.id
    WHERE trip_id = $1
    `,
    [tripId],
  );

  const groupedResults = results.rows.reduce((acc, row) => {
    if (!acc[row.id]) {
      acc[row.id] = { ...row, photos: [row.photo] };
    } else {
      acc[row.id].photos.push(row.photo);
    }
    return acc;
  }, {});

  return Object.values(groupedResults);
}

export async function insertComment(comment: z.infer<typeof Comment>) {
  const results = await pool.query(
    `
    INSERT INTO trip_comments (user_id, trip_id, comment, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [comment.user_id, comment.trip_id, comment.comment, comment.rating],
  );
  return results.rows[0].id;
}

export async function insertCommentPhotos(commentId: number, photos: string[]) {
  const params = [Array(photos.length).fill(commentId), photos];

  const results = await pool.query(
    `
    INSERT INTO trip_comment_photos (trip_comment_id, photo)
    SELECT * FROM unnest($1::integer[], $2::text[])
    `,
    params,
  );

  return results;
}
