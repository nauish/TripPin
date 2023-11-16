import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: './.env' });

const jwtKey: jwt.Secret = process.env.TOKEN_SECRET || '';

const DecodedSchema = z.object({
  userId: z.number(),
});

type Decoded = z.infer<typeof DecodedSchema>;

function verifyJWT(token: string): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtKey, (err, decoded) => {
      try {
        if (err) reject(err);
        const result = DecodedSchema.parse(decoded);
        resolve(result);
      } catch (error) {
        reject(new Error('Invalid decoded value'));
      }
    });
  });
}

export default async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.jwt;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = await verifyJWT(token);
    res.locals.userId = decoded.userId;
    return next();
  } catch (err) {
    if (err instanceof Error) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
