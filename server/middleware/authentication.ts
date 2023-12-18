import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { z } from 'zod';

config();

const jwtKey: jwt.Secret = process.env.TOKEN_SECRET || '';

const DecodedSchema = z.object({
  userId: z.number(),
});

type Decoded = z.infer<typeof DecodedSchema>;

export function verifyJWT(token: string): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtKey, (err, decoded) => {
      try {
        if (err) reject(err);
        const result = DecodedSchema.parse(decoded);
        resolve(result);
      } catch (error) {
        reject(new Error('無效的解碼數值'));
      }
    });
  });
}

export default async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ error: '沒有提供驗證圖章' });

    const decoded = await verifyJWT(token);
    res.locals.userId = decoded.userId;
    return next();
  } catch (err) {
    if (err instanceof Error) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(401).json({ error: '驗證失敗' });
  }
}

export async function authenticateJWTOptional(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) throw new Error('Not providing a token');

    const decoded = await verifyJWT(token);
    res.locals.userId = decoded.userId;
    return next();
  } catch (err) {
    if (err instanceof Error) {
      res.locals.userId = '';
      return next();
    }
    return res.status(401).json({ error: '驗證失敗' });
  }
}
