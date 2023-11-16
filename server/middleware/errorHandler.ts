import { NextFunction, Request, Response } from 'express';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ValidationError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
  return next();
}
