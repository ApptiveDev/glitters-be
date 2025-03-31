import { Member } from '.prisma/client';
import { PasswordExcludedMember } from '@/domains/member/types';

export function getPasswordExcludedMember(member: Member): PasswordExcludedMember {
  delete (member as Partial<Member>).password;
  return member;
}
