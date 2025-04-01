import type { Member } from '.prisma/client';
import type { Response } from 'express';
import { GetMyInfoSchema } from '@/domains/member/schema';

export type PasswordExcludedMember = Omit<Member, 'password'>;
export type GetMyInfoResponse = Response<z.infer<typeof GetMyInfoSchema>>
