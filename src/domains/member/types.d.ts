import type { Member } from '.prisma/client';
import type { Response } from 'express';
import {
  GetLastPostResponseBodySchema,
  GetMyInfoSchema,
} from '@/domains/member/schema';

export type PasswordExcludedMember = Omit<Member, 'password'>;
export type GetMyInfoResponse = Response<z.infer<typeof GetMyInfoSchema>>

export type GetLastPostResponse = Response<z.infer<typeof GetLastPostResponseBodySchema>>;
