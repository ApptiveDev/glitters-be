import { InternalMember } from '@/domains/member/types';
import redis from '@/utils/redis';

const NOTIFICATION_STORE_PREFIX = `notification:${process.env.NODE_ENV}`;

export async function storeNotificationStatus(member: InternalMember | number) {
  if(typeof member !== 'number') {
    member = member.id;
  }
  await redis.set(`${NOTIFICATION_STORE_PREFIX}:${member}`, 'true', 'EX', 60 * 60 * 6); // 6시간 후 만료
}

export async function isNotified(member: InternalMember | number) {
  if(typeof member !== 'number') {
    member = member.id;
  }
  return redis.exists(`${NOTIFICATION_STORE_PREFIX}:${member}`);
}
