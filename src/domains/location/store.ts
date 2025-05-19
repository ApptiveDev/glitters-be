import { InternalMember } from '@/domains/member/types';
import redis from '@/utils/redis';

const LOCATION_STORE_PREFIX = `location:${process.env.NODE_ENV}`;

export async function storeLocation(member: InternalMember | number, latitude: number, longitude: number) {
  await redis.set(`${LOCATION_STORE_PREFIX}:${member}`, JSON.stringify([latitude, longitude]));
}

export async function getStoredLocations() {
  const stream = redis.scanStream({ match: `${LOCATION_STORE_PREFIX}:*`, count: 10000 });
  const keys: string[] = [];
  for await (const resultKeys of stream) {
    keys.push(...resultKeys);
  }

  const pipeline = redis.pipeline();
  keys.forEach(key => pipeline.get(key));
  const results = await pipeline.exec();
  if(! results) {
    return;
  }

  const keyValueMap: Record<string, [number, number]> = {};
  keys.forEach((key, i) => {
    const [err, value] = results[i];
    if(err) {
      return;
    }
    const memberId = key.split(':')[2];
    keyValueMap[memberId] = JSON.parse(value as string);
  });

  return keyValueMap;
}
