import { Request, Response } from 'express';
import { insertComment, insertCommentPhotos, selectCommentsByTripId } from '../models/comment.js';
import pool from '../models/dbPools.js';

export async function getComments(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const comments = await selectCommentsByTripId(+tripId);
    return res.json({
      data: comments.map((comment: any) => ({
        ...comment,
        photos:
          comment.photos.length > 0 && comment.photos[0]
            ? comment.photos.map((photo: string) => `${process.env.CLOUDFRONT_DOMAIN}${photo}`)
            : [],
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function postComment(req: Request, res: Response) {
  const client = await pool.connect();
  const { photos } = req.files as unknown as { photos: { filename: string; key: string }[] };

  let photoFileNames: string[] = [];
  if (process.env.NODE_ENV === 'production') {
    photoFileNames = photos?.map((photo) => photo.key.split('/')[1]);
  } else {
    photoFileNames = photos?.map((photo) => photo.filename);
  }

  try {
    await client.query('BEGIN');
    const commentId = await insertComment(req.body);
    if (photos && photos.length > 0) {
      await insertCommentPhotos(commentId, photoFileNames);
    }
    await client.query('COMMIT');
    return res.json({ data: { commentId } });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}
