import type { Member } from '.prisma/client';

export type PasswordExcludedMember = Omit<Member, 'password'>;
