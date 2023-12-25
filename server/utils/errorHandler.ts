import { Response } from 'express';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ValidationError';
  }
}

export function handleError(err: unknown, res: Response): Response {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  console.error(err);
  if (err instanceof Error) return res.status(500).json({ error: err.message });
  return res.status(500).json({ error: '出錯了！' });
}
