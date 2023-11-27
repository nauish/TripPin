import { Request, Response } from 'express';
import { insertComment, selectCommentsByTripId } from '../models/comment.js';

export async function getComments(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const comments = await selectCommentsByTripId(+tripId);
    return res.json({ data: comments });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function postComment(req: Request, res: Response) {
  try {
    const result = await insertComment(req.body);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
