import { MemberSchema, PostSchema } from '@/schemas';
import { z } from 'zod';

export const PasswordExcludedMemberSchema = MemberSchema.omit({ password: true });
export const GetMyInfoSchema = z.object({
  member: PasswordExcludedMemberSchema,
});

export const GetLastPostResponseBodySchema = PostSchema.pick({
  createdAt: true,
});
