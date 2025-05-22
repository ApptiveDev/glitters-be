import type { Response } from 'express';
import {
  GetActivePostCountResponseBodySchema,
  GetMyInfoSchema,
  PublicMemberSchema,
} from '@/domains/member/schema';
import { z } from 'zod';
import { AuthenticatedJWTPayload } from '@/domains/auth/types';

export type PublicMember = z.infer<typeof PublicMemberSchema>;
export type InternalMember = Pick<AuthenticatedJWTPayload, 'id' | 'name' | 'email'>;
export type GetMyInfoResponse = Response<z.infer<typeof GetMyInfoSchema>>

export type GetActivePostCountResponse = Response<z.infer<typeof GetActivePostCountResponseBodySchema>>;
