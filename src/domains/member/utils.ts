import { Member } from '.prisma/client';
import { PublicMember } from '@/domains/member/types';

export function omitPrivateFields(member: Member): PublicMember {
  delete (member as Partial<Member>).password;
  delete (member as Partial<Member>).expoToken;
  return member;
}
