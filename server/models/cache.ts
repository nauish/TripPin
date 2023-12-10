import { Redis } from 'ioredis';

let redis: Redis | null = null;

export function initCache(): Redis {
  redis = new Redis({
    port: Number(process.env.REDIS_PORT),
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
