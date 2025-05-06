import type { Response } from 'express';
import {
  GetActivePostCountResponseBodySchema,
  GetMyInfoSchema,
  InternalMemberSchema,
  PublicMemberSchema,
} from '@/domains/member/schema';
import { z } from 'zod';

export type PublicMember = z.infer<typeof PublicMemberSchema>;
export type InternalMember = z.infer<typeof InternalMemberSchema>;
export type GetMyInfoResponse = Response<z.infer<typeof GetMyInfoSchema>>

export type GetActivePostCountResponse = Response<z.infer<typeof GetActivePostCountResponseBodySchema>>;
