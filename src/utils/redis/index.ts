import '@/utils/config';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);
export default redis;

export const pub = new Redis(process.env.REDIS_URL as string);
export const sub = new Redis(process.env.REDIS_URL as string);

