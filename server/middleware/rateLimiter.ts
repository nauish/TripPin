import { Request, Response, NextFunction } from 'express';
import { getCacheInstance } from '../models/cache.js';

const QUOTA = Number(process.env.RATE_LIMITER_QUOTA) || 1000;
const WINDOW = Number(process.env.RATE_LIMITER_WINDOW) || 60;

async function isQuotaExceeded(token: string) {
  const cache = getCacheInstance();
  if (!cache) return false;
  const results = await cache.multi().set(token, 0, 'EX', WINDOW, 'NX').incr(token).exec();
  const count = results?.[1][1];
  return typeof count === 'number' && count > QUOTA;
}

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.ip;
    if (token && (await isQuotaExceeded(token))) {
      return res.status(429).json({ error: `每${WINDOW}秒${QUOTA}次的請求到達上限了` });
    }
    return next();
  } catch (err) {
    console.error(err);
    return next();
  }
};

export default rateLimiter;
