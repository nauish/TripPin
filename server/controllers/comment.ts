import { Request, Response } from 'express';
import { insertComment, insertCommentPhotos, selectCommentsByTripId } from '../models/comment.js';
import pool from '../models/dbPools.js';
import { handleError } from '../utils/errorHandler.js';

export async function getComments(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const comments = await selectCommentsByTripId(+tripId);
    res.json({
      data: comments.map((comment) => ({
        ...comment,
        photos: comment.photos?.[0]
          ? comment.photos.map((photo: string) => `${process.env.CLOUDFRONT_DOMAIN}${photo}`)
          : [],
      })),
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function postComment(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const { photos } = req.files as unknown as { photos: { filename: string; key: string }[] };

    let photoFileNames: string[] = [];
    if (process.env.NODE_ENV === 'production') {
      photoFileNames = photos?.map((photo) => photo.key.split('/')[1]);
    } else {
      photoFileNames = photos?.map((photo) => photo.filename);
    }

    await client.query('BEGIN');
    const commentId = await insertComment(req.body, client);
    if (photos && photos.length > 0) await insertCommentPhotos(commentId, photoFileNames, client);
    await client.query('COMMIT');
    res.json({ data: { commentId } });
  } catch (error) {
    await client.query('ROLLBACK');
    handleError(error, res);
  } finally {
    client.release();
  }
}
