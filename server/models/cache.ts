import { config } from 'dotenv';
import { Redis, RedisOptions } from 'ioredis';

config();

let redis: Redis | null = null;

export function initCache() {
  const redisOptions: RedisOptions = {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  };

  if (process.env.NODE_ENV === 'production') {
    redisOptions.tls = { rejectUnauthorized: false };
  }

  redis = new Redis(redisOptions);

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
    redis?.disconnect();
    redis = null;
  });
  return redis;
}

export function getCacheInstance() {
  return redis ?? initCache();
}
