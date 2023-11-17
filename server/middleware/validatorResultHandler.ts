import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export default function handleResult(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = validationResult(req).formatWith((err: ValidationError) => {
    throw new Error(`${err.type}: ${err.msg}`);
  });

  if (!result.isEmpty()) return res.status(400).json({ error: result.array() });

  return next();
}
