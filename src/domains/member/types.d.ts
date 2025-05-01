import type { Member } from '.prisma/client';
import type { Response } from 'express';
import {
  GetActivePostCountResponseBodySchema,
  GetMyInfoSchema,
} from '@/domains/member/schema';

export type PasswordExcludedMember = Omit<Member, 'password'>;
export type GetMyInfoResponse = Response<z.infer<typeof GetMyInfoSchema>>

export type GetActivePostCountResponse = Response<z.infer<typeof GetActivePostCountResponseBodySchema>>;
