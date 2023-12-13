import { config } from 'dotenv';
import { Redis } from 'ioredis';

config();

let redis: Redis | null = null;

export function initCache(): Redis {
  redis = new Redis({
    tls: {
      rejectUnauthorized: false,
    },
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  });

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
