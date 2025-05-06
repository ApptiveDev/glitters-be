import { Member } from '.prisma/client';
import { InternalMember, PublicMember } from '@/domains/member/types';

export function omitPrivateFields(member: Member | InternalMember): PublicMember {
  delete (member as Partial<Member>).password;
  delete (member as Partial<Member>).expoToken;
  return member;
}
